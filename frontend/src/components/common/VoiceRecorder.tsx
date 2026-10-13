import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Mic,
  Square,
  Volume2,
  Sparkles,
  RefreshCw,
  Globe,
  Languages,
  CheckCircle2,
  Play,
  RotateCw,
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface VoiceRecorderProps {
  transcript: string;
  onTranscriptChange: (text: string) => void;
  onAudioBlobReady?: (blob: Blob) => void;
}

export default function VoiceRecorder({
  transcript,
  onTranscriptChange,
  onAudioBlobReady,
}: VoiceRecorderProps) {
  const { t, i18n } = useTranslation();

  // Selected Target Translation Language
  const [targetLang, setTargetLang] = useState<'en' | 'hi' | 'gu'>(
    (i18n.language as 'en' | 'hi' | 'gu') || 'en'
  );

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [lastAudioBlob, setLastAudioBlob] = useState<Blob | null>(null);

  const isRecordingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync target language if i18n changes
  useEffect(() => {
    if (['en', 'hi', 'gu'].includes(i18n.language)) {
      setTargetLang(i18n.language as 'en' | 'hi' | 'gu');
    }
  }, [i18n.language]);

  // Setup Web Speech Recognition for instant on-device text while speaking
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang =
          targetLang === 'hi' ? 'hi-IN' : targetLang === 'gu' ? 'gu-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          let fullText = '';
          for (let i = 0; i < event.results.length; i++) {
            fullText += event.results[i][0].transcript + ' ';
          }
          if (fullText.trim()) {
            onTranscriptChange(fullText.trim());
          }
        };

        recognition.onerror = () => {
          // Gracefully continue MediaRecorder
        };

        recognition.onend = () => {
          if (isRecordingRef.current) {
            try {
              recognition.start();
            } catch (err) {
              // Ignored
            }
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition init error');
      }
    }

    return () => {
      stopRecording();
    };
  }, [targetLang]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setAudioUrl(null);
      setRecordingTime(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setLastAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (onAudioBlobReady) {
          onAudioBlobReady(audioBlob);
        }

        // Transcribe & Translate via Gemini 3.6 Flash
        await transcribeWithGeminiAI(audioBlob, targetLang);
      };

      mediaRecorder.start(200);
      isRecordingRef.current = true;
      setIsRecording(true);

      // Start Web Speech recognition if available
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang =
            targetLang === 'hi' ? 'hi-IN' : targetLang === 'gu' ? 'gu-IN' : 'en-IN';
          recognitionRef.current.start();
        } catch (err) {
          // Optional
        }
      }

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      alert('Microphone access is required to record voice notes. Please grant microphone permissions.');
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignored
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const transcribeWithGeminiAI = async (audioBlob: Blob, lang: 'en' | 'hi' | 'gu') => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice_note.webm');
      formData.append('targetLanguage', lang);

      const res = await apiClient.post('/ai/transcribe-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.data?.transcript) {
        onTranscriptChange(res.data.data.transcript);
      }
    } catch (err) {
      console.warn('Gemini audio transcription error');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranslateExistingText = async (lang: 'en' | 'hi' | 'gu') => {
    if (!transcript.trim()) return;
    setIsTranslating(true);
    setTargetLang(lang);
    try {
      const res = await apiClient.post('/ai/translate-text', {
        text: transcript,
        targetLanguage: lang,
      });

      if (res.data.success && res.data.data?.translatedText) {
        onTranscriptChange(res.data.data.translatedText);
      }
    } catch (err) {
      alert('Translation service temporarily unavailable.');
    } finally {
      setIsTranslating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-4 bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-xl">
      {/* Header & Target Language Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2 text-xs">
          <Volume2 size={18} className="text-blue-900 shrink-0" />
          <div>
            <p className="font-bold text-slate-900">{t('report.voiceLabel')}</p>
            <p className="text-slate-500 text-[11px]">
              Speak in any language — Gemini AI transcribes and translates your voice in real time.
            </p>
          </div>
        </div>

        {/* Target Language Dropdown Selector */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs shadow-2xs">
          <Globe size={13} className="text-blue-700" />
          <span className="font-bold text-slate-700">Translate to:</span>
          <select
            value={targetLang}
            onChange={(e) => {
              const newLang = e.target.value as 'en' | 'hi' | 'gu';
              setTargetLang(newLang);
              if (transcript.trim()) {
                handleTranslateExistingText(newLang);
              }
            }}
            className="bg-transparent font-bold text-blue-900 focus:outline-none cursor-pointer text-xs"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="gu">ગુજરાતી (Gujarati)</option>
          </select>
        </div>
      </div>

      {/* Record Trigger Button & Active Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          <span className="font-semibold">Selected Mode: </span>
          <strong className="text-blue-900">
            {targetLang === 'hi'
              ? '🇮🇳 Voice to Hindi (हिन्दी)'
              : targetLang === 'gu'
              ? '🇮🇳 Voice to Gujarati (ગુજરાતી)'
              : '🇬🇧 Voice to English'}
          </strong>
        </div>

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'gov-button-primary bg-blue-900 hover:bg-blue-800'
          }`}
        >
          {isRecording ? (
            <>
              <Square size={14} className="fill-white" />
              <span>{t('report.voiceStop')} ({formatTime(recordingTime)})</span>
            </>
          ) : (
            <>
              <Mic size={15} className="text-amber-400" />
              <span>{t('report.voiceRecord')}</span>
            </>
          )}
        </button>
      </div>

      {/* Live Recording Animation Wave */}
      {isRecording && (
        <div className="flex items-center justify-between p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span>Listening & recording speech... ({formatTime(recordingTime)})</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-1 h-3 bg-red-500 animate-bounce" />
            <span className="w-1 h-5 bg-red-600 animate-bounce [animation-delay:0.1s]" />
            <span className="w-1 h-4 bg-red-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-1 h-6 bg-red-700 animate-bounce [animation-delay:0.3s]" />
          </div>
        </div>
      )}

      {/* Gemini AI Transcription & Translation Loading Banner */}
      {(isTranscribing || isTranslating) && (
        <div className="flex items-center gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs animate-pulse">
          <RefreshCw size={15} className="animate-spin text-blue-700" />
          <span className="font-semibold">
            {isTranscribing
              ? `Processing & translating voice note via Google Gemini AI (${targetLang.toUpperCase()})...`
              : `Translating complaint text into ${targetLang.toUpperCase()}...`}
          </span>
        </div>
      )}

      {/* Audio Playback Bar */}
      {audioUrl && !isRecording && (
        <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Play size={12} className="text-blue-700" />
            <span>Recorded Spoken Audio:</span>
          </span>
          <audio src={audioUrl} controls className="w-full h-8" />
        </div>
      )}

      {/* Editable Speech Transcript Area */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span>{t('report.voiceTranscript')}</span>
          </label>
          <span className="text-[10px] text-slate-500 italic">
            Gemini Multimodal AI Powered
          </span>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          rows={3}
          placeholder="Speak into your microphone to generate text. You can also edit the translated text here..."
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 leading-relaxed shadow-2xs"
        />

        {/* 1-Click Language Translation Buttons */}
        {transcript.trim() && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
              <Languages size={13} className="text-blue-700" />
              <span>Instant Translate:</span>
            </span>

            <button
              type="button"
              onClick={() => handleTranslateExistingText('hi')}
              disabled={isTranslating}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                targetLang === 'hi'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              🇮🇳 हिन्दी (Hindi)
            </button>

            <button
              type="button"
              onClick={() => handleTranslateExistingText('gu')}
              disabled={isTranslating}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                targetLang === 'gu'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              🇮🇳 ગુજરાતી (Gujarati)
            </button>

            <button
              type="button"
              onClick={() => handleTranslateExistingText('en')}
              disabled={isTranslating}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                targetLang === 'en'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
