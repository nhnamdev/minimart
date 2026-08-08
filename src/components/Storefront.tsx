"use client";

import { useState } from "react";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { FulfillmentChoice } from "@/components/FulfillmentChoice";
import { OrderTabs } from "@/components/OrderTabs";
import { ShoppingCart } from "@/components/ShoppingCart";
import { StoreHeader } from "@/components/StoreHeader";
import { categories, products } from "@/data/catalog";
import type { CartQuantities } from "@/types/catalog";

export function Storefront() {
  const [fulfillmentMode, setFulfillmentMode] = useState<"delivery" | "pickup" | null>(null);
  const [activeTab, setActiveTab] = useState<"goods" | "orders">("goods");
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState<CartQuantities>({});

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

  if (fulfillmentMode === null) {
    return <FulfillmentChoice onSelect={setFulfillmentMode} />;
  }

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-white md:mx-auto md:max-w-[1180px] md:border-x md:border-black/10 md:shadow-[0_0_32px_rgba(7,17,27,.08)]">
      <StoreHeader
        fulfillmentMode={fulfillmentMode}
        onFulfillmentModeChange={setFulfillmentMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <OrderTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "goods" ? (
        <>
          <CatalogBrowser
            categories={categories}
            searchTerm={searchTerm}
            quantities={quantities}
            onQuantityChange={updateQuantity}
          />
          <ShoppingCart
            fulfillmentMode={fulfillmentMode}
            products={products}
            quantities={quantities}
            onQuantityChange={updateQuantity}
            onClear={() => setQuantities({})}
          />
        </>
      ) : (
        <section className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[#f3f5f7] px-8 text-center text-[#93999f]">
          <p className="text-[clamp(14px,3.5vw,24px)]">Chưa có đơn hàng</p>
        </section>
      )}
    </main>
  );
}
