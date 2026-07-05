import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en-US',
    supportedLngs: ['en-US', 'en-GB', 'fr', 'es'],
    interpolation: { escapeValue: false },
    resources: {
      'en-US': { translation: { "details": "Bug Details", "timestamp": "Timestamp", "email": "Email", "description": "Description", "close": "Close" } },
      'en-GB': { translation: { "details": "Bug Details", "timestamp": "Timestamp", "email": "Email", "description": "Description", "close": "Close" } },
      'fr': { translation: { "details": "Détails du bug", "timestamp": "Horodatage", "email": "E-mail", "description": "Description", "close": "Fermer" } },
      'es': { translation: { "details": "Detalles del error", "timestamp": "Marca de tiempo", "email": "Correo electrónico", "description": "Descripción", "close": "Cerrar" } }
    }
  });

export default i18n;