import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationTR from './locales/tr/translation.json';

const resources = {
    en: {
        translation: translationEN
    },
    tr: {
        translation: translationTR
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng'
        }
    });

// Keep <html lang> in sync with the active language (WCAG 3.1.1) so screen
// readers pick the right pronunciation rules after a language switch.
const syncDocumentLanguage = (lng) => {
    if (typeof document === 'undefined' || !lng) return;
    document.documentElement.lang = lng.split('-')[0];
};
syncDocumentLanguage(i18n.resolvedLanguage || i18n.language);
i18n.on('languageChanged', syncDocumentLanguage);

export default i18n;
