"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { DeliveryCheckoutDialog } from "@/components/DeliveryCheckoutDialog";
import { formatVnd } from "@/lib/currency";
import { CartIcon, CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { PickupCheckoutDialog } from "@/components/PickupCheckoutDialog";
import { useLanguage } from "@/context/LanguageContext";
import type { CartQuantities, CheckoutDetails, Product, SavedOrderReference } from "@/types/catalog";

interface ShoppingCartProps {
  fulfillmentMode: "delivery" | "pickup";
  storeAddress: string | null;
  storePhone: string;
  products: Product[];
  quantities: CartQuantities;
  onQuantityChange: (productId: string, next: number) => void;
  onClear: () => void;
  onOrderPlaced: (reference: SavedOrderReference) => void;
  onViewOrders: () => void;
}

export function ShoppingCart({
  fulfillmentMode,
  storeAddress,
  storePhone,
  products,
  quantities,
  onQuantityChange,
  onClear,
  onOrderPlaced,
  onViewOrders,
}: ShoppingCartProps) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeliveryCheckoutOpen, setIsDeliveryCheckoutOpen] = useState(false);
  const [isPickupCheckoutOpen, setIsPickupCheckoutOpen] = useState(false);
  const [placedOrderCode, setPlacedOrderCode] = useState("");

  const selectedProducts = useMemo(
    () => products.filter((product) => (quantities[product.id] ?? 0) > 0),
    [products, quantities],
  );

  const itemCount = selectedProducts.reduce(
    (sum, product) => sum + (quantities[product.id] ?? 0),
    0,
  );
  const total = selectedProducts.reduce(
    (sum, product) => sum + product.price * (quantities[product.id] ?? 0),
    0,
  );
  const hasItems = itemCount > 0;

  function handleClear() {
    onClear();
  }

  function handleCheckout() {
    if (!hasItems) return;

    if (fulfillmentMode === "delivery") {
      setIsOpen(false);
      setIsDeliveryCheckoutOpen(true);
      return;
    }

    setIsOpen(false);
    setIsPickupCheckoutOpen(true);
  }

  async function submitOrder(details: CheckoutDetails) {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        fulfillmentMode,
        ...details,
        items: selectedProducts.map((product) => ({
          productId: product.id,
          quantity: quantities[product.id] ?? 0,
        })),
      }),
    });
    if (!response.ok) throw new Error("ORDER_FAILED");
    const result = await response.json() as { orderCode: string };
    setIsDeliveryCheckoutOpen(false);
    setIsPickupCheckoutOpen(false);
    onClear();
    onOrderPlaced({ orderCode: result.orderCode, customerPhone: details.customerPhone });
    setPlacedOrderCode(result.orderCode);
  }

  return (
    <>
      {isDeliveryCheckoutOpen && (
        <DeliveryCheckoutDialog
          products={products}
          quantities={quantities}
          storePhone={storePhone}
          onCancel={() => setIsDeliveryCheckoutOpen(false)}
          onConfirm={submitOrder}
        />
      )}

      {isPickupCheckoutOpen && (
        <PickupCheckoutDialog
          products={products}
          quantities={quantities}
          storeAddress={storeAddress}
          storePhone={storePhone}
          onCancel={() => setIsPickupCheckoutOpen(false)}
          onConfirm={submitOrder}
        />
      )}

      {placedOrderCode ? (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-5" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="order-success-title" className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#ecf8ef] text-2xl text-[#26733d]">✓</div>
            <h2 id="order-success-title" className="mt-4 text-xl font-bold text-[#232323]">{t("orderPlaced")}</h2>
            <p className="mt-2 text-sm text-[#687078]">{t("orderPlacedDetail")}</p>
            <p className="mt-2 select-all text-2xl font-black tracking-wide text-[#fb4f45]">#{placedOrderCode}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setPlacedOrderCode("")} className="rounded-lg border border-[#cfd4d8] px-4 py-3 font-semibold text-[#4d555d]">{t("close")}</button>
              <button type="button" onClick={() => { setPlacedOrderCode(""); onViewOrders(); }} className="rounded-lg bg-[#fdbc24] px-4 py-3 font-bold text-[#20252b]">{t("viewOrder")}</button>
            </div>
          </section>
        </div>
      ) : null}

      <section
        aria-hidden={!isOpen}
        className={`absolute right-0 bottom-12 left-0 z-[98] max-h-[min(62vh,420px)] overflow-y-auto border-t border-black/10 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.16)] transition-[opacity,transform,visibility] duration-200 ease-out ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible translate-y-3 opacity-0 pointer-events-none"
        }`}
      >
        <div className="sticky top-0 flex h-12 items-center justify-between border-b border-[#eceff1] bg-white px-4">
          <h2 className="text-[16px] font-bold text-[#232323]">{t("cart")}</h2>
          <div className="flex items-center gap-3">
            {hasItems && (
              <button
                type="button"
                className="text-[12px] font-medium text-[#f34c43]"
                onClick={handleClear}
              >
                {t("clearAll")}
              </button>
            )}
            <button
              type="button"
              aria-label={t("closeCart")}
              className="grid size-8 place-items-center text-[#70767b]"
              onClick={() => setIsOpen(false)}
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
        </div>

        {hasItems ? (
          <div className="divide-y divide-[#eceff1] px-4">
            {selectedProducts.map((product) => {
              const quantity = quantities[product.id] ?? 0;

              return (
                <div key={product.id} className="flex min-h-16 items-center gap-3 py-2.5">
                  <Image
                    src={product.image}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11 shrink-0 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[#25292d]">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-[12px] font-semibold text-[#f05045]">
                      {formatVnd(product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={`${t("decrease")} ${product.name}`}
                      className="grid size-7 place-items-center text-[#777d82]"
                      onClick={() => onQuantityChange(product.id, Math.max(0, quantity - 1))}
                    >
                      <MinusIcon className="size-6" />
                    </button>
                    <span className="min-w-5 text-center text-[13px] font-semibold text-[#25292d]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`${t("increase")} ${product.name}`}
                      className="grid size-7 place-items-center text-[#f4ad00]"
                      onClick={() => onQuantityChange(product.id, quantity + 1)}
                    >
                      <PlusIcon className="size-6" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-4 py-8 text-center text-[13px] text-[#969b9f]">
            {t("emptyCart")}
          </p>
        )}

      </section>

      <div className="absolute bottom-0 left-0 z-[99] flex h-12 w-full bg-[#141d27]">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? t("closeCart") : t("openCart")}
          className="flex min-w-0 flex-1 items-start text-left"
          onClick={() => {
            setIsOpen((current) => !current);
          }}
        >
          <span className="relative top-[-10px] mx-3 box-border grid size-14 shrink-0 place-items-center rounded-full bg-[#141d27] p-1.5">
            <span
              className={`grid size-full place-items-center rounded-full ${
                hasItems ? "bg-[#fdbc24] text-white" : "bg-[#2b343c] text-[#80858a]"
              }`}
            >
              <CartIcon className="size-7" />
            </span>
            {hasItems && (
              <span className="absolute top-0 right-0 grid size-6 place-items-center rounded-full bg-[#f34c43] text-[9px] font-bold text-white shadow-[0_4px_8px_rgba(0,0,0,.4)]">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </span>
          <span
            className={`mt-3 truncate pr-3 text-[16px] leading-6 font-bold ${
              hasItems ? "text-white" : "text-white/45"
            }`}
          >
            {formatVnd(total)}
          </span>
        </button>

        <button
          type="button"
          disabled={!hasItems}
          className={`h-12 min-w-[25vw] px-3 text-[3vw] font-bold md:min-w-48 md:text-sm ${
            hasItems
              ? "bg-[#fdbc24] text-[#2b333b]"
              : "cursor-default bg-[#2b333b] text-white/60"
          }`}
          onClick={handleCheckout}
        >
          {hasItems ? t("checkout") : t("fromZero")}
        </button>
      </div>
    </>
  );
}
