"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { CloseIcon, GlobeIcon, PhoneIcon, SearchIcon } from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";
import { languageOptions } from "@/lib/i18n";
import type { SiteContent } from "@/types/catalog";

interface StoreHeaderProps {
  site: SiteContent;
  fulfillmentMode: "delivery" | "pickup";
  onFulfillmentModeChange: (mode: "delivery" | "pickup") => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function StoreHeader({
  site,
  fulfillmentMode,
  onFulfillmentModeChange,
  searchTerm,
  onSearchChange,
}: StoreHeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isLanguageOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsLanguageOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isLanguageOpen]);

  return (
    <header className="relative isolate overflow-hidden text-white">
      {site.coverImageUrl ? <div
        aria-hidden="true"
        className="absolute -inset-[2vw] -z-20 blur-[3vw] md:-inset-6 md:blur-3xl"
      >
        <Image
          src={site.coverImageUrl}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div> : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[rgba(7,17,27,.5)]"
      />

      <div className="flex px-[4vw] pt-[4vw] md:px-8 md:pt-6">
        {site.logoUrl ? <div className="relative size-[18vw] shrink-0 overflow-hidden rounded-[1vw] md:size-24 md:rounded-lg">
          <Image
            src={site.logoUrl}
            alt={site.name}
            fill
            sizes="18vw"
            className="object-cover"
          />
        </div> : null}

        <div className="ml-[1.5vw] mr-[1vw] min-w-0 flex-1 md:ml-4 md:mr-4">
          <h1 className="text-[4.3vw] leading-[5vw] font-bold md:text-2xl md:leading-7">{site.name}</h1>
          <div className="mb-[2vw] w-[53vw] text-[3.1vw] leading-[3.3vw] md:mb-3 md:w-auto md:text-sm md:leading-5">
            <p>{site.tagline}</p>
            <p>{t("deliveryHours")}: {site.openingHours}</p>
            <div
              role="group"
              aria-label={t("fulfillment")}
              className="mt-[2vw] inline-flex overflow-hidden rounded-[2.55vw] border-[.55px] border-white md:mt-3 md:rounded-full"
            >
              <button
                type="button"
                aria-pressed={fulfillmentMode === "delivery"}
                onClick={() => onFulfillmentModeChange("delivery")}
                className={`px-[2.5vw] py-[1.2vw] text-[2.8vw] leading-none font-medium whitespace-nowrap transition-colors md:px-4 md:py-2 md:text-sm ${
                  fulfillmentMode === "delivery"
                    ? "bg-[#fdbc24] text-[#20252b]"
                    : "bg-white/10 text-white"
                }`}
              >
                {t("delivery")}
              </button>
              <button
                type="button"
                aria-pressed={fulfillmentMode === "pickup"}
                onClick={() => onFulfillmentModeChange("pickup")}
                className={`border-l-[.55px] border-white px-[2.5vw] py-[1.2vw] text-[2.8vw] leading-none font-medium whitespace-nowrap transition-colors md:px-4 md:py-2 md:text-sm ${
                  fulfillmentMode === "pickup"
                    ? "bg-[#fdbc24] text-[#20252b]"
                    : "bg-white/10 text-white"
                }`}
              >
                {t("pickup")}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isLanguageOpen}
          onClick={() => setIsLanguageOpen(true)}
          className="flex shrink-0 items-center self-start gap-[1vw] text-[3vw] leading-[5vw] md:gap-2 md:text-sm md:leading-6"
        >
          <GlobeIcon className="size-[3vw] md:size-4" />
          <span>{t("language")}</span>
        </button>
      </div>

      <div className="flex h-[8vw] items-center justify-end gap-[1.5vw] pr-[5vw] pb-[2vw] md:h-14 md:gap-2 md:pr-8 md:pb-4">
        <a
          href={`tel:${site.phone}`}
          className="flex items-center gap-[1vw] rounded-[2.55vw] border-[.55px] border-white px-[2vw] py-[1vw] text-[3vw] leading-none md:gap-2 md:rounded-full md:px-4 md:py-2 md:text-sm"
          aria-label={`${t("contact")} ${site.phone}`}
        >
          <PhoneIcon className="size-[3vw] md:size-4" />
          <span>{site.phone}</span>
        </a>

        {isSearchOpen && (
          <label className="flex items-center rounded-[2.55vw] border-[.55px] border-white px-[2vw] py-[1vw] md:rounded-full md:px-4 md:py-2">
            <span className="sr-only">{t("searchProducts")}</span>
            <input
              ref={searchInputRef}
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("search")}
              className="w-[27vw] bg-transparent text-[3vw] leading-none text-white outline-none placeholder:text-white/70 md:w-56 md:text-sm"
            />
          </label>
        )}

        <button
          type="button"
          aria-label={isSearchOpen ? t("close") : t("search")}
          aria-expanded={isSearchOpen}
          onClick={() => setIsSearchOpen((isOpen) => !isOpen)}
          className="flex items-center gap-[1vw] rounded-[2.55vw] border-[.55px] border-white px-[2vw] py-[1vw] text-[3vw] leading-none md:gap-2 md:rounded-full md:px-4 md:py-2 md:text-sm"
        >
          {isSearchOpen ? (
            <CloseIcon className="size-[3vw] md:size-4" />
          ) : (
            <SearchIcon className="size-[3vw] md:size-4" />
          )}
          <span>{isSearchOpen ? t("close") : t("search")}</span>
        </button>
      </div>

      <div
        aria-hidden={!isLanguageOpen}
        inert={!isLanguageOpen}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[rgba(7,17,27,.88)] transition-[opacity,visibility] duration-200 ${
          isLanguageOpen
            ? "visible pointer-events-auto opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
        role="presentation"
        onMouseDown={(event) => {
          if (event.currentTarget === event.target) setIsLanguageOpen(false);
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="language-dialog-title"
          className="relative w-[72vw] rounded-[1vw] bg-[#07111b] px-[7vw] py-[6vw] text-center shadow-2xl md:w-[460px] md:rounded-2xl md:px-12 md:py-10"
        >
          <button
            type="button"
            aria-label={t("closeLanguage")}
            onClick={() => setIsLanguageOpen(false)}
            className="absolute top-[2.5vw] right-[2.5vw] p-[1vw] md:top-4 md:right-4 md:p-2"
          >
            <CloseIcon className="size-[5vw] md:size-6" />
          </button>

          <h2
            id="language-dialog-title"
            className="mb-[4vw] text-[4vw] leading-[5vw] font-semibold md:mb-6 md:text-xl md:leading-7"
          >
            {t("chooseLanguage")}
          </h2>

          <div className="flex flex-col divide-y divide-white/20">
            {languageOptions.map((option) => {
              const isSelected = option.code === language;

              return (
                <button
                  key={option.code}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setLanguage(option.code);
                    setIsLanguageOpen(false);
                  }}
                  className={`py-[3vw] text-[3.5vw] leading-[4vw] md:py-4 md:text-base md:leading-6 ${
                    isSelected ? "text-[#f01414]" : "text-white"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
