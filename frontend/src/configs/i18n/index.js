// src/configs/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import en from "./en.json";
import ps from "./pa.json";
import dr from "./dr.json";

const resources = {
  en: { translation: en },
  ps: { translation: ps },
  dr: { translation: dr },
};

// Function to get default language
const getDefaultLanguage = () => {
  // Check if user has previously selected a language
  const savedLang = localStorage.getItem("preferred-language");
  if (savedLang && ["en", "ps", "dr"].includes(savedLang)) {
    return savedLang;
  }

  // Default to Pashto for new users
  return "ps";
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getDefaultLanguage("ps"), // Set default language
    fallbackLng: "ps", // Fallback to Pashto
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

// Set RTL direction for Pashto and Dari
const setDocumentDirection = (lang) => {
  const isRTL = lang === "ps" || lang === "dr";
  document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", lang);
};

// Initialize document direction
setDocumentDirection(getDefaultLanguage());

export default i18n;
