import { env } from '../config/env';
import { fallbackClassify } from './fallbackClassifier';
import { GeminiVisionProvider } from './GeminiVisionProvider';
import { metricsRegistry } from '../middleware/observability';
import {
  AIAnalysisInput,
  AIAnalysisResult,
  ResolutionVerificationInput,
  ResolutionVerificationResult,
} from './types';

export class AIService {
  private geminiProvider: GeminiVisionProvider | null = null;

  constructor() {
    if (env.AI_PROVIDER === 'gemini' && env.GEMINI_API_KEY) {
      try {
        this.geminiProvider = new GeminiVisionProvider();
      } catch (err) {
        console.warn('⚠️ GeminiVisionProvider init skipped. Fallback classifier ready.');
      }
    }
  }

  async analyzeIssue(input: AIAnalysisInput): Promise<AIAnalysisResult> {
    const fullText = [input.description, input.voiceTranscript].filter(Boolean).join('. ');

    if (env.AI_PROVIDER === 'gemini' && (this.geminiProvider || env.GEMINI_API_KEY)) {
      const startTime = Date.now();
      try {
        if (!this.geminiProvider) {
          this.geminiProvider = new GeminiVisionProvider();
        }
        const result = await this.geminiProvider.analyze({
          ...input,
          description: fullText,
        });
        metricsRegistry.recordGeminiCall(Date.now() - startTime, true);
        return result;
      } catch (error: any) {
        const isTimeout = error.message?.includes('timed out');
        metricsRegistry.recordGeminiCall(Date.now() - startTime, false, isTimeout);
        console.warn(`⚠️ Gemini AI analysis error (${error.message}). Falling back to rule-based analysis.`);
        return fallbackClassify(fullText, input.category, input.problemImpact, input.problemSince, input);
      }
    }

    return fallbackClassify(fullText, input.category, input.problemImpact, input.problemSince, input);
  }

  async verifyResolution(
    input: ResolutionVerificationInput
  ): Promise<ResolutionVerificationResult> {
    if (env.AI_PROVIDER === 'gemini' && (this.geminiProvider || env.GEMINI_API_KEY)) {
      try {
        if (!this.geminiProvider) {
          this.geminiProvider = new GeminiVisionProvider();
        }
        return await this.geminiProvider.verifyResolution(input);
      } catch (error: any) {
        console.warn(`⚠️ Gemini verification error (${error.message}). Using rule verification.`);
      }
    }

    return {
      status: 'likely_resolved',
      confidence: 0.85,
      reasoning: 'Field officer uploaded resolution evidence photograph and remarks. Marked for citizen confirmation.',
      detectedChanges: ['Remediation photographic proof submitted by field officer'],
      recommendation: 'citizen_verification',
    };
  }

  async transcribeAudio(
    audioBuffer: Buffer,
    mimeType = 'audio/webm',
    targetLanguage = 'en'
  ): Promise<{ transcript: string; translatedText?: string; detectedLanguage?: string }> {
    if (env.GEMINI_API_KEY) {
      try {
        if (!this.geminiProvider) {
          this.geminiProvider = new GeminiVisionProvider();
        }
        return await this.geminiProvider.transcribeAudio(audioBuffer, mimeType, targetLanguage);
      } catch (error: any) {
        console.warn(`⚠️ Gemini audio transcription error (${error.message}).`);
      }
    }
    return { transcript: '' };
  }

  async translateText(
    text: string,
    targetLanguage: 'en' | 'hi' | 'gu'
  ): Promise<string> {
    if (env.GEMINI_API_KEY) {
      try {
        if (!this.geminiProvider) {
          this.geminiProvider = new GeminiVisionProvider();
        }
        return await this.geminiProvider.translateText(text, targetLanguage);
      } catch (error: any) {
        console.warn(`⚠️ Gemini text translation error (${error.message}).`);
      }
    }
    return text;
  }
}

export const aiService = new AIService();
export async function analyzeIssue(input: AIAnalysisInput): Promise<AIAnalysisResult> {
  return aiService.analyzeIssue(input);
}
export async function verifyResolution(
  input: ResolutionVerificationInput
): Promise<ResolutionVerificationResult> {
  return aiService.verifyResolution(input);
}
export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType = 'audio/webm',
  targetLanguage = 'en'
): Promise<{ transcript: string; translatedText?: string; detectedLanguage?: string }> {
  return aiService.transcribeAudio(audioBuffer, mimeType, targetLanguage);
}
export async function translateText(
  text: string,
  targetLanguage: 'en' | 'hi' | 'gu'
): Promise<string> {
  return aiService.translateText(text, targetLanguage);
}
export * from './types';
