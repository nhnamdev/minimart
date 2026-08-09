import type { LanguageCode } from "@/types/catalog";

const localeByLanguage: Record<LanguageCode, string> = {
  vi: "vi-VN",
  en: "en-US",
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-TW",
};

export function formatCurrency(value: number, currencyCode: string, language: LanguageCode) {
  return new Intl.NumberFormat(localeByLanguage[language], {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(value);
}
