"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { translate, type MessageKey } from "@/lib/i18n";
import type { LanguageCode } from "@/types/catalog";

const supportedLanguages: LanguageCode[] = ["vi", "en", "zh-Hans", "zh-Hant"];

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: MessageKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("zh-Hans");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("minimart-language");
    if (supportedLanguages.includes(savedLanguage as LanguageCode)) {
      const timer = window.setTimeout(() => setLanguageState(savedLanguage as LanguageCode), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage(nextLanguage) {
      setLanguageState(nextLanguage);
      window.localStorage.setItem("minimart-language", nextLanguage);
    },
    t(key) {
      return translate(language, key);
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
