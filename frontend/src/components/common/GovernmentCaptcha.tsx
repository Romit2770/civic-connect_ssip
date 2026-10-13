import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Volume2, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface GovernmentCaptchaProps {
  value: string;
  onChange: (val: string) => void;
  onValidChange?: (isValid: boolean) => void;
  error?: string | null;
}

export default function GovernmentCaptcha({
  value,
  onChange,
  onValidChange,
  error,
}: GovernmentCaptchaProps) {
  const [captchaCode, setCaptchaCode] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCode = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    onChange('');
  };

  useEffect(() => {
    generateCode();
  }, []);

  useEffect(() => {
    if (captchaCode && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Canvas background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Background noise grid / dots
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = `rgba(100, 116, 139, ${Math.random() * 0.4})`;
          ctx.beginPath();
          ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // Random noise wave lines
        for (let i = 0; i < 4; i++) {
          ctx.strokeStyle = `rgba(30, 64, 175, ${0.2 + Math.random() * 0.3})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, Math.random() * canvas.height);
          ctx.bezierCurveTo(
            canvas.width * 0.3,
            Math.random() * canvas.height,
            canvas.width * 0.7,
            Math.random() * canvas.height,
            canvas.width,
            Math.random() * canvas.height
          );
          ctx.stroke();
        }

        // Render characters with distortion & rotation
        const charColors = ['#0a2540', '#1e40af', '#b45309', '#15803d', '#4c1d95', '#0f172a'];
        for (let i = 0; i < captchaCode.length; i++) {
          ctx.save();
          const char = captchaCode[i];
          const x = 16 + i * 22;
          const y = 26 + (Math.random() * 6 - 3);
          const angle = (Math.random() - 0.5) * 0.4; // -0.2 to 0.2 rad

          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.font = 'bold 20px "Courier New", monospace';
          ctx.fillStyle = charColors[i % charColors.length];
          ctx.fillText(char, 0, 0);
          ctx.restore();
        }
      }
    }
  }, [captchaCode]);

  useEffect(() => {
    const isMatch = value.trim().toUpperCase() === captchaCode.toUpperCase();
    if (onValidChange) {
      onValidChange(isMatch);
    }
  }, [value, captchaCode]);

  const speakCaptcha = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        captchaCode.split('').join(' ')
      );
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const autoFillDemo = () => {
    onChange(captchaCode);
  };

  const isMatched = value.trim().toUpperCase() === captchaCode.toUpperCase() && value.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-blue-900" />
          <span>Security Verification Captcha</span>
          <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={autoFillDemo}
          className="text-[10px] text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer"
          title="Auto-fill for demo evaluation"
        >
          ⚡ Auto-fill
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Captcha Canvas Image Box */}
        <div className="border border-slate-300 rounded-md overflow-hidden bg-slate-50 shadow-inner flex items-center justify-center p-0.5">
          <canvas
            ref={canvasRef}
            width={150}
            height={38}
            className="select-none pointer-events-none"
            aria-label="Security Captcha Image"
          />
        </div>

        {/* Refresh & Audio Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={generateCode}
            className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            title="Refresh Captcha Code"
            aria-label="Refresh Captcha"
          >
            <RotateCw size={15} />
          </button>

          <button
            type="button"
            onClick={speakCaptcha}
            className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            title="Read Captcha Aloud (Audio)"
            aria-label="Audio Captcha"
          >
            <Volume2 size={15} />
          </button>
        </div>

        {/* Captcha Input */}
        <div className="flex-1 min-w-[120px] relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={6}
            placeholder="Enter Captcha..."
            required
            className={`w-full px-3 py-2 bg-slate-50 border rounded-md font-mono text-sm tracking-wider uppercase text-slate-900 focus:outline-none focus:bg-white ${
              isMatched
                ? 'border-emerald-500 ring-1 ring-emerald-500'
                : error
                ? 'border-red-400'
                : 'border-slate-300 focus:border-blue-700'
            }`}
          />
          {isMatched && (
            <CheckCircle2
              size={16}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600"
            />
          )}
        </div>
      </div>

      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
