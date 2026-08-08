"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { CloseIcon, GlobeIcon, PhoneIcon, SearchIcon } from "@/components/icons";

interface StoreHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const languages = ["汉语", "Tiếng Việt", "English"] as const;

export function StoreHeader({ searchTerm, onSearchChange }: StoreHeaderProps) {
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
      <div
        aria-hidden="true"
        className="absolute -inset-[2vw] -z-20 blur-[3vw]"
      >
        <Image
          src="/images/order-multi/store-avatar.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[rgba(7,17,27,.5)]"
      />

      <div className="flex px-[4vw] pt-[4vw]">
        <div className="relative size-[18vw] shrink-0 overflow-hidden rounded-[1vw]">
          <Image
            src="/images/order-multi/store-avatar.jpg"
            alt="Ảnh đại diện 小兔便利店"
            fill
            sizes="18vw"
            className="object-cover"
          />
        </div>

        <div className="ml-[1.5vw] mr-[1vw] min-w-0 flex-1">
          <h1 className="text-[4.3vw] leading-[5vw] font-bold">小兔便利店</h1>
          <div className="mb-[2vw] w-[53vw] text-[3.1vw] leading-[3.3vw]">
            <p>小兔便利店</p>
            <p>Thời gian mở cửa: Cả ngày</p>
          </div>
        </div>

        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isLanguageOpen}
          onClick={() => setIsLanguageOpen(true)}
          className="flex shrink-0 items-center self-start gap-[1vw] text-[3vw] leading-[5vw]"
        >
          <GlobeIcon className="size-[3vw]" />
          <span>Ngôn ngữ</span>
        </button>
      </div>

      <div className="flex h-[6vw] items-center justify-end gap-[1.5vw] pr-[5vw] pb-[2vw]">
        <a
          href="tel:0865016689"
          className="flex items-center gap-[1vw] rounded-[2.55vw] border-[.55px] border-white px-[2vw] py-[1vw] text-[3vw] leading-none"
          aria-label="Gọi 0865 016 689"
        >
          <PhoneIcon className="size-[3vw]" />
          <span>0865016689</span>
        </a>

        {isSearchOpen && (
          <label className="flex items-center rounded-[2.55vw] border-[.55px] border-white px-[2vw] py-[1vw]">
            <span className="sr-only">Tìm kiếm sản phẩm</span>
            <input
              ref={searchInputRef}
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm kiếm"
              className="w-[27vw] bg-transparent text-[3vw] leading-none text-white outline-none placeholder:text-white/70"
            />
          </label>
        )}

        <button
          type="button"
          aria-label={isSearchOpen ? "Đóng tìm kiếm" : "Mở tìm kiếm"}
          aria-expanded={isSearchOpen}
          onClick={() => setIsSearchOpen((isOpen) => !isOpen)}
          className="flex items-center gap-[1vw] rounded-[2.55vw] border-[.55px] border-white px-[2vw] py-[1vw] text-[3vw] leading-none"
        >
          {isSearchOpen ? (
            <CloseIcon className="size-[3vw]" />
          ) : (
            <SearchIcon className="size-[3vw]" />
          )}
          <span>{isSearchOpen ? "Đóng" : "Tìm kiếm"}</span>
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
          className="relative w-[72vw] rounded-[1vw] bg-[#07111b] px-[7vw] py-[6vw] text-center shadow-2xl"
        >
          <button
            type="button"
            aria-label="Đóng chọn ngôn ngữ"
            onClick={() => setIsLanguageOpen(false)}
            className="absolute top-[2.5vw] right-[2.5vw] p-[1vw]"
          >
            <CloseIcon className="size-[5vw]" />
          </button>

          <h2
            id="language-dialog-title"
            className="mb-[4vw] text-[4vw] leading-[5vw] font-semibold"
          >
            Vui lòng chọn ngôn ngữ
          </h2>

          <div className="flex flex-col divide-y divide-white/20">
            {languages.map((language) => {
              const isSelected = language === "Tiếng Việt";

              return (
                <button
                  key={language}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setIsLanguageOpen(false)}
                  className={`py-[3vw] text-[3.5vw] leading-[4vw] ${
                    isSelected ? "text-[#f01414]" : "text-white"
                  }`}
                >
                  {language}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
