"use client";

interface OrderTabsProps {
  active: "goods" | "orders";
  onChange: (active: "goods" | "orders") => void;
}

const tabs = [
  { id: "goods", label: "Đặt hàng" },
  { id: "orders", label: "Đơn hàng" },
] as const;

export function OrderTabs({ active, onChange }: OrderTabsProps) {
  return (
    <nav
      aria-label="Điều hướng đặt hàng"
      className="flex h-[6vh] w-full border-b border-[rgba(7,17,27,.1)]"
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          type="button"
          aria-current={active === tab.id ? "page" : undefined}
          onClick={() => onChange(tab.id)}
          className={`h-[6vh] flex-1 text-center text-[3.5vw] leading-[6vh] ${
            index > 0 ? "border-l border-[rgba(7,17,27,.1)]" : ""
          } ${active === tab.id ? "text-[#f01414]" : "text-[#4d555d]"}`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
