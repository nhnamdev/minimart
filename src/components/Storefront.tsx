"use client";

import { useCallback, useEffect, useState } from "react";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { CustomerOrders } from "@/components/CustomerOrders";
import { FulfillmentChoice } from "@/components/FulfillmentChoice";
import { OrderTabs } from "@/components/OrderTabs";
import { ShoppingCart } from "@/components/ShoppingCart";
import { StoreHeader } from "@/components/StoreHeader";
import { useLanguage } from "@/context/LanguageContext";
import type { CartQuantities, ReferralInfo, SavedOrderReference, StorefrontData } from "@/types/catalog";

const cartStorageKey = "minimart-cart";
const ordersStorageKey = "minimart-orders";
const referralStorageKey = "minimart-referral-code";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 90) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

function readStoredCart(): CartQuantities {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(cartStorageKey) ?? "{}") as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).flatMap(([productId, value]) => {
      const quantity = Number(value);
      return Number.isSafeInteger(quantity) && quantity > 0
        ? [[productId, Math.min(quantity, 99)]]
        : [];
    }));
  } catch {
    return {};
  }
}

function readStoredOrders(): SavedOrderReference[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ordersStorageKey) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((value) => {
      if (!value || typeof value !== "object") return [];
      const orderCode = "orderCode" in value && typeof value.orderCode === "string" ? value.orderCode : "";
      const customerPhone = "customerPhone" in value && typeof value.customerPhone === "string" ? value.customerPhone : "";
      return orderCode && customerPhone ? [{ orderCode, customerPhone }] : [];
    }).slice(0, 20);
  } catch {
    return [];
  }
}

export function Storefront() {
  const { language, t } = useLanguage();
  const [fulfillmentMode, setFulfillmentMode] = useState<"delivery" | "pickup" | null>(null);
  const [activeTab, setActiveTab] = useState<"goods" | "orders">("goods");
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState<CartQuantities>({});
  const [savedOrders, setSavedOrders] = useState<SavedOrderReference[]>([]);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [data, setData] = useState<StorefrontData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStorefront = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/storefront?lang=${encodeURIComponent(language)}`, {
        cache: "default",
      });
      if (!response.ok) throw new Error("STORE_LOAD_FAILED");
      setData(await response.json() as StorefrontData);
    } catch {
      setError(t("loadFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [language, t]);

  useEffect(() => {
    void loadStorefront();
  }, [loadStorefront]);

  useEffect(() => {
    setQuantities(readStoredCart());
    setSavedOrders(readStoredOrders());
    setStorageReady(true);

    async function detectReferral() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const refQuery = urlParams.get("ref")?.trim();
        const candidateCode = refQuery || getCookie("ref") || window.localStorage.getItem(referralStorageKey);

        if (!candidateCode) return;

        const res = await fetch(`/api/referrals/validate?code=${encodeURIComponent(candidateCode)}`);
        if (!res.ok) return;
        const result = await res.json() as { valid: boolean; code?: string; agentName?: string; discountPercent?: number };
        if (result.valid && result.code && result.discountPercent !== undefined) {
          const info: ReferralInfo = {
            code: result.code,
            agentName: result.agentName || result.code,
            discountPercent: result.discountPercent,
          };
          setReferralInfo(info);
          setCookie("ref", result.code, 90);
          window.localStorage.setItem(referralStorageKey, result.code);
        } else {
          document.cookie = "ref=; max-age=0; path=/;";
          window.localStorage.removeItem(referralStorageKey);
        }
      } catch {
        // Ignore network errors for referral
      }
    }
    void detectReferral();
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(cartStorageKey, JSON.stringify(quantities));
  }, [quantities, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(ordersStorageKey, JSON.stringify(savedOrders));
  }, [savedOrders, storageReady]);

  useEffect(() => {
    if (!data) return;
    document.title = data.site.seoTitle || data.site.name;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description && data.site.seoDescription) description.content = data.site.seoDescription;
  }, [data]);

  function updateQuantity(productId: string, next: number) {
    setQuantities((current) => {
      if (next <= 0) {
        const copy = { ...current };
        delete copy[productId];
        return copy;
      }

      return { ...current, [productId]: Math.min(next, 99) };
    });
  }

  function rememberOrder(reference: SavedOrderReference) {
    setSavedOrders((current) => [
      reference,
      ...current.filter((item) => item.orderCode !== reference.orderCode),
    ].slice(0, 20));
  }

  if (isLoading && !data) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f3f5f7] px-6 text-center">
        <div className="w-full max-w-md animate-pulse rounded-2xl bg-white p-8 shadow-sm">
          <div className="mx-auto size-20 rounded-xl bg-[#e7eaed]" />
          <div className="mx-auto mt-5 h-5 w-56 rounded bg-[#e7eaed]" />
          <p className="mt-5 text-sm text-[#6b737a]">{t("loading")}</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f3f5f7] px-6 text-center">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-[#232323]">{t("loadFailed")}</h1>
          <button type="button" onClick={() => void loadStorefront()} className="mt-5 rounded-lg bg-[#fdbc24] px-5 py-3 font-semibold text-[#20252b] active:translate-y-px">
            {t("retry")}
          </button>
        </section>
      </main>
    );
  }

  const products = data.categories.flatMap((category) => category.products);

  if (fulfillmentMode === null) {
    return <FulfillmentChoice site={data.site} onSelect={setFulfillmentMode} />;
  }

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-white md:mx-auto md:max-w-[1180px] md:border-x md:border-black/10 md:shadow-[0_0_32px_rgba(7,17,27,.08)]">
      <StoreHeader
        site={data.site}
        fulfillmentMode={fulfillmentMode}
        onFulfillmentModeChange={setFulfillmentMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      {referralInfo ? (
        <aside
          aria-label="Thông tin ưu đãi giới thiệu"
          className="flex shrink-0 items-center justify-between gap-2 border-b border-[#f5de8c] bg-[#fff8e1] px-4 py-2 text-xs font-medium text-[#7a5200] shadow-inner"
        >
          <span className="flex items-center gap-1.5 truncate">
            <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#fdbc24] text-[9px] font-bold text-[#20252b]">✓</span>
            <span className="truncate">
              {t("referralDiscountBanner")} <strong className="font-bold text-[#d9382e]">{referralInfo.discountPercent}%</strong> ({referralInfo.code})
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-[#fdbc24] px-2 py-0.5 text-[10px] font-bold text-[#20252b]">
            -{referralInfo.discountPercent}%
          </span>
        </aside>
      ) : null}
      <OrderTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "goods" ? (
        <>
          <CatalogBrowser
            categories={data.categories}
            currencyCode={data.site.currencyCode}
            searchTerm={searchTerm}
            quantities={quantities}
            onQuantityChange={updateQuantity}
            referralDiscountPercent={referralInfo?.discountPercent}
          />
          <ShoppingCart
            fulfillmentMode={fulfillmentMode}
            storeAddress={data.site.address}
            storePhone={data.site.phone}
            currencyCode={data.site.currencyCode}
            products={products}
            quantities={quantities}
            referralInfo={referralInfo}
            onQuantityChange={updateQuantity}
            onClear={() => setQuantities({})}
            onOrderPlaced={rememberOrder}
            onViewOrders={() => setActiveTab("orders")}
          />
        </>
      ) : (
        <CustomerOrders references={savedOrders} />
      )}
    </main>
  );
}
