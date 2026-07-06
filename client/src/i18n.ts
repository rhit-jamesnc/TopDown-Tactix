import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enUS from './locales/en-US.json';
import enGB from './locales/en-GB.json';
import fr from './locales/fr.json';
import es from './locales/es.json';

declare global {
  interface Window {
    i18n: typeof i18n;
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en-US',
    supportedLngs: ['en-US', 'en-GB', 'fr', 'es'],
    interpolation: { escapeValue: false },
    resources: {
      'en-US': { translation: enUS },
      'en-GB': { translation: enGB },
      'fr': { translation: fr },
      'es': { translation: es }
    }
  });

if (typeof window !== 'undefined') {
  window.i18n = i18n;
}

export default i18n;