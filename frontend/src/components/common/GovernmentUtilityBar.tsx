import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, PhoneCall, Wifi, WifiOff } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';

interface GovernmentUtilityBarProps {
  showSkipLink?: boolean;
}

export default function GovernmentUtilityBar({ showSkipLink = false }: GovernmentUtilityBarProps = {}) {
  const { t, i18n } = useTranslation();
  const { isOnline } = useOffline();
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('civic_lang', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const handleFontSizeChange = (size: 'sm' | 'base' | 'lg') => {
    setFontSize(size);
    if (size === 'sm') {
      document.documentElement.style.fontSize = '14px';
    } else if (size === 'base') {
      document.documentElement.style.fontSize = '16px';
    } else if (size === 'lg') {
      document.documentElement.style.fontSize = '18px';
    }
  };

  const isEnglish = i18n.language === 'en';

  return (
    <div className="bg-[#071a2e] text-slate-200 text-xs border-b border-slate-700/60 py-1 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* LEFT: Indian Tricolor Flag + Government of India + Ministry */}
        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          <div className="flex flex-col w-4 h-2.5 rounded-[1px] overflow-hidden shadow-xs border border-white/20 shrink-0">
            <div className="bg-[#FF9933] h-[3.5px] w-full" />
            <div className="bg-white h-[3px] w-full flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-[#000080]" />
            </div>
            <div className="bg-[#138808] h-[3.5px] w-full" />
          </div>
          <span className="font-bold text-white tracking-wide">
            {isEnglish ? (
              'GOVERNMENT OF INDIA'
            ) : (
              <>
                {t('common.govIndiaHindi')}{' '}
                <span className="font-normal text-slate-400">|</span>{' '}
                {t('common.govIndia')}
              </>
            )}
          </span>
          <span className="text-slate-500 hidden md:inline">•</span>
          <span className="text-slate-300 hidden md:inline font-normal">
            {t('common.ministry')}
          </span>
        </div>

        {/* RIGHT: Accessibility Controls, Toll-Free Helpline, Online Indicator, Language Switcher */}
        <div className="flex items-center gap-3 sm:gap-4 text-[11px]">
          {/* Skip to Main Content Link (Optional) */}
          {showSkipLink && (
            <a
              href="#main-content"
              className="text-slate-300 hover:text-white underline hidden sm:inline text-[11px]"
            >
              {t('common.skipToMain')}
            </a>
          )}

          {/* Accessibility Font Resizers (A- | A | A+) */}
          <div className="flex items-center gap-0.5 bg-slate-800/90 rounded border border-slate-700 p-0.5">
            <button
              onClick={() => handleFontSizeChange('sm')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                fontSize === 'sm' ? 'bg-[#f59e0b] text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => handleFontSizeChange('base')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                fontSize === 'base' ? 'bg-[#f59e0b] text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => handleFontSizeChange('lg')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                fontSize === 'lg' ? 'bg-[#f59e0b] text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* 24x7 Citizen Helpline */}
          <div className="hidden lg:flex items-center gap-1 text-slate-300">
            <PhoneCall size={12} className="text-amber-400" />
            <span>
              {t('common.tollFree')}: <strong className="text-white font-bold">1800-11-2026</strong>
            </span>
          </div>

          {/* Real-Time Connectivity Radar */}
          <div className="flex items-center gap-1">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                <Wifi size={12} className="text-emerald-400" />
                <span className="hidden sm:inline">{t('common.online')}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px] bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-500/40">
                <WifiOff size={12} />
                <span>{t('common.offline')}</span>
              </span>
            )}
          </div>

          {/* Official Language Selector Dropdown */}
          <div className="flex items-center gap-1 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
            <Globe size={11} className="text-amber-400" />
            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-[11px]"
              aria-label={t('nav.switchLang')}
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
              <option value="gu" className="bg-slate-900 text-white">ગુજરાતી (Gujarati)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
