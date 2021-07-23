import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';


i18n.use(Backend).use(LanguageDetector).use(initReactI18next).init({
    debug: true,
    fallbackLng: 'en',
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
    return i18n.language;
}