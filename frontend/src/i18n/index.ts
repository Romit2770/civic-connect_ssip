import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import gu from './locales/gu.json';

const savedLanguage = localStorage.getItem('civic_lang') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    gu: { translation: gu },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  saveMissing: false,
  returnEmptyString: false,
  missingKeyHandler: (lng, ns, key) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[i18n missing] ${lng} -> ${ns}:${key}`);
    }
  },
});

// Sync HTML lang attribute immediately and on language change
if (typeof document !== 'undefined') {
  document.documentElement.lang = savedLanguage;
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
    localStorage.setItem('civic_lang', lng);
  });
}

export default i18n;
