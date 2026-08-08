"use client";

import { useLanguage } from "@/context/LanguageContext";

interface OrderTabsProps {
  active: "goods" | "orders";
  onChange: (active: "goods" | "orders") => void;
}

export function OrderTabs({ active, onChange }: OrderTabsProps) {
  const { t } = useLanguage();
  const tabs = [
    { id: "goods", label: t("goods") },
    { id: "orders", label: t("orders") },
  ] as const;
  return (
    <nav
      aria-label={t("orders")}
      className="flex h-[6vh] w-full border-b border-[rgba(7,17,27,.1)] md:h-14"
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          type="button"
          aria-current={active === tab.id ? "page" : undefined}
          onClick={() => onChange(tab.id)}
          className={`h-[6vh] flex-1 text-center text-[3.5vw] leading-[6vh] md:h-14 md:text-[15px] md:leading-[56px] ${
            index > 0 ? "border-l border-[rgba(7,17,27,.1)]" : ""
          } ${active === tab.id ? "text-[#f01414]" : "text-[#4d555d]"}`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
