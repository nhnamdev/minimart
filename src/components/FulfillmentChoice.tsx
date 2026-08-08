"use client";

import Image from "next/image";

import {
  GlobeIcon,
  LocationIcon,
  PhoneIcon,
} from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";
import { languageOptions } from "@/lib/i18n";
import type { LanguageCode } from "@/types/catalog";
import type { SiteContent } from "@/types/catalog";

interface FulfillmentChoiceProps {
  site: SiteContent;
  onSelect: (mode: "delivery" | "pickup") => void;
}

export function FulfillmentChoice({ site, onSelect }: FulfillmentChoiceProps) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <main className="flex min-h-dvh w-full flex-col overflow-y-auto bg-[#f3f5f7] md:mx-auto md:max-w-4xl md:shadow-[0_0_32px_rgba(7,17,27,.08)]">
      <header className="relative isolate overflow-hidden text-white">
        <div aria-hidden="true" className="absolute -inset-[2vw] -z-20 blur-[3vw] md:-inset-6 md:blur-3xl">
          <Image
            src={site.coverImageUrl || "/images/order-multi/store-avatar.jpg"}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgba(7,17,27,.5)]" />

        <div className="flex px-[4vw] py-[4vw] md:px-8 md:py-6">
          <div className="relative size-[18vw] shrink-0 overflow-hidden rounded-[1vw] md:size-24 md:rounded-lg">
            <Image
              src={site.logoUrl || "/images/logo.jpg"}
              alt={site.name}
              fill
              priority
              sizes="18vw"
              className="object-cover"
            />
          </div>

          <div className="ml-[1.5vw] min-w-0 flex-1 md:ml-4">
            <h1 className="text-[4.3vw] leading-[5vw] font-bold md:text-2xl md:leading-7">{site.name}</h1>
            <p className="mt-[1vw] text-[3.1vw] leading-[4vw] md:mt-2 md:text-sm md:leading-5">{site.tagline}</p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-[3vw] md:gap-4">
            <label className="flex items-center gap-[1vw] text-[3vw] leading-[5vw] md:gap-2 md:text-sm md:leading-6">
              <GlobeIcon className="size-[3vw] md:size-4" />
              <span className="sr-only">{t("language")}</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as LanguageCode)}
                className="max-w-[22vw] bg-transparent outline-none md:max-w-40 [&_option]:text-[#232323]"
              >
                {languageOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
              </select>
            </label>
            <a
              href={`tel:${site.phone}`}
              className="flex items-center gap-[1vw] rounded-[2.55vw] border-[.55px] border-white px-[2vw] py-[1vw] text-[3vw] leading-none md:gap-2 md:rounded-full md:px-4 md:py-2 md:text-sm"
              aria-label={`${t("contact")} ${site.phone}`}
            >
              <PhoneIcon className="size-[3vw] md:size-4" />
              <span>{t("contact")}</span>
            </a>
          </div>
        </div>
      </header>

      <section className="mx-[3vw] mt-[8vw] flex overflow-hidden rounded-[3vw] bg-white shadow-[0_1px_4px_rgba(7,17,27,.04)] md:mx-8 md:mt-10 md:rounded-2xl">
        <button
          type="button"
          onClick={() => onSelect("delivery")}
          className="flex flex-1 flex-col items-center justify-center px-[3vw] pt-[9vw] pb-[9vw] active:bg-[#fafafa] md:px-8 md:py-10"
        >
          <span className="mb-[3.5vw] text-center text-[4.5vw] font-bold md:mb-5 md:text-2xl">{t("delivery")}</span>
          <Image
            src="/images/giao-hang.jpg"
            alt=""
            width={1280}
            height={1280}
            sizes="10vw"
            className="size-[10vw] object-contain md:size-32 md:rounded-xl"
          />
        </button>

        <div aria-hidden="true" className="my-[2vw] w-px bg-[#ccc] md:my-6" />

        <button
          type="button"
          onClick={() => onSelect("pickup")}
          className="flex flex-1 flex-col items-center justify-center px-[3vw] pt-[9vw] pb-[9vw] active:bg-[#fafafa] md:px-8 md:py-10"
        >
          <span className="mb-[3.5vw] text-center text-[4.5vw] font-bold md:mb-5 md:text-2xl">{t("pickup")}</span>
          <Image
            src="/images/pickup.jpg"
            alt=""
            width={1280}
            height={1280}
            sizes="10vw"
            className="size-[10vw] object-contain md:size-32 md:rounded-xl"
          />
        </button>
      </section>

      <h2 className="mx-[3vw] mt-[8vw] mb-[4vw] ml-[5vw] text-[5vw] font-bold md:mx-8 md:mt-10 md:mb-5 md:text-2xl">{t("storeInfo")}</h2>

      <section className="mx-[3vw] mb-[6vw] flex flex-col rounded-[3vw] bg-white p-[4vw] md:mx-8 md:mb-10 md:rounded-2xl md:p-6">
        <div className="mb-[3vw] flex items-start justify-between gap-[4vw] md:mb-4 md:gap-8">
          <span className="text-[4vw] text-[#333] md:text-base">{t("storePhone")}</span>
          <a href={`tel:${site.phone}`} className="flex items-center gap-[1vw] text-[3.5vw] text-[#7e8c8d] md:gap-2 md:text-sm">
            <PhoneIcon className="size-[4.5vw] md:size-5" />
            <span>{site.phone}</span>
          </a>
        </div>
        <div className="mb-[3vw] flex items-start justify-between gap-[4vw] md:mb-4 md:gap-8">
          <span className="text-[4vw] text-[#333] md:text-base">{t("deliveryHours")}</span>
          <span className="text-[3.5vw] text-[#7e8c8d] md:text-sm">{site.openingHours}</span>
        </div>
        <div className="flex items-start justify-between gap-[4vw] md:gap-8">
          <span className="shrink-0 text-[4vw] text-[#333] md:text-base">{t("storeAddress")}</span>
          <span className="flex max-w-[52vw] items-start gap-[1vw] text-right text-[3.5vw] leading-[4.5vw] text-[#7e8c8d] md:max-w-md md:gap-2 md:text-sm md:leading-5">
            <LocationIcon className="mt-[.1vw] size-[4.5vw] shrink-0 md:mt-0 md:size-5" />
            <span>{site.address}</span>
          </span>
        </div>
      </section>
    </main>
  );
}
