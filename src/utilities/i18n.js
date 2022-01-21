import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';


i18n.use(Backend).use(LanguageDetector).use(initReactI18next).init({
    debug: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    interpolation: {
        escapeValue: false
    }
});

/**
 * Change the language of all the dashboard content
 * @param {string} language Language key e.g: en for english es for spanish
 */
export function changeLanguage(language) {
    i18n.changeLanguage(language);
}

export function getAvailableLanguages() {
    return ['en', 'es'];
}

export function getCurrentLanguage() {
    return typeof i18n.language === 'string' ? i18n.language.substring(0, 2) : i18n.language;
}