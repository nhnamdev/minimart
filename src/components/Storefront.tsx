"use client";

import { useCallback, useEffect, useState } from "react";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { FulfillmentChoice } from "@/components/FulfillmentChoice";
import { OrderTabs } from "@/components/OrderTabs";
import { ShoppingCart } from "@/components/ShoppingCart";
import { StoreHeader } from "@/components/StoreHeader";
import { useLanguage } from "@/context/LanguageContext";
import type { CartQuantities, StorefrontData } from "@/types/catalog";

export function Storefront() {
  const { language, t } = useLanguage();
  const [fulfillmentMode, setFulfillmentMode] = useState<"delivery" | "pickup" | null>(null);
  const [activeTab, setActiveTab] = useState<"goods" | "orders">("goods");
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState<CartQuantities>({});
  const [data, setData] = useState<StorefrontData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStorefront = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/storefront?lang=${encodeURIComponent(language)}`, {
        cache: "no-store",
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

      return { ...current, [productId]: next };
    });
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
      <OrderTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "goods" ? (
        <>
          <CatalogBrowser
            categories={data.categories}
            searchTerm={searchTerm}
            quantities={quantities}
            onQuantityChange={updateQuantity}
          />
          <ShoppingCart
            fulfillmentMode={fulfillmentMode}
            storeAddress={data.site.address}
            products={products}
            quantities={quantities}
            onQuantityChange={updateQuantity}
            onClear={() => setQuantities({})}
          />
        </>
      ) : (
        <section className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[#f3f5f7] px-8 text-center text-[#93999f]">
          <p className="text-[clamp(14px,3.5vw,24px)]">{t("noOrders")}</p>
        </section>
      )}
    </main>
  );
}
