"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { formatVnd } from "@/data/catalog";
import { CartIcon, CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";
import type { CartQuantities, Product } from "@/types/catalog";

interface ShoppingCartProps {
  products: Product[];
  quantities: CartQuantities;
  onQuantityChange: (productId: string, next: number) => void;
  onClear: () => void;
}

export function ShoppingCart({
  products,
  quantities,
  onQuantityChange,
  onClear,
}: ShoppingCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState("");

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
    setNotice("");
  }

  function handleCheckout() {
    if (!hasItems) return;
    setNotice("Đây là bản demo, đơn hàng chưa được gửi đi.");
  }

  return (
    <>
      <section
        aria-hidden={!isOpen}
        className={`absolute right-0 bottom-12 left-0 z-[98] max-h-[min(62vh,420px)] overflow-y-auto border-t border-black/10 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.16)] transition-[opacity,transform,visibility] duration-200 ease-out ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible translate-y-3 opacity-0 pointer-events-none"
        }`}
      >
        <div className="sticky top-0 flex h-12 items-center justify-between border-b border-[#eceff1] bg-white px-4">
          <h2 className="text-[16px] font-bold text-[#232323]">Giỏ hàng</h2>
          <div className="flex items-center gap-3">
            {hasItems && (
              <button
                type="button"
                className="text-[12px] font-medium text-[#f34c43]"
                onClick={handleClear}
              >
                Xóa tất cả
              </button>
            )}
            <button
              type="button"
              aria-label="Đóng giỏ hàng"
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
                      aria-label={`Giảm số lượng ${product.name}`}
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
                      aria-label={`Tăng số lượng ${product.name}`}
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
            Giỏ hàng đang trống
          </p>
        )}

        {notice && (
          <p role="status" className="border-t border-[#eceff1] px-4 py-2 text-center text-[12px] text-[#70767b]">
            {notice}
          </p>
        )}
      </section>

      <div className="absolute bottom-0 left-0 z-[99] flex h-12 w-full bg-[#141d27]">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Đóng giỏ hàng" : "Mở giỏ hàng"}
          className="flex min-w-0 flex-1 items-start text-left"
          onClick={() => {
            setIsOpen((current) => !current);
            setNotice("");
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
          className={`h-12 min-w-[25vw] px-3 text-[3vw] font-bold ${
            hasItems
              ? "bg-[#fdbc24] text-[#2b333b]"
              : "cursor-default bg-[#2b333b] text-white/60"
          }`}
          onClick={handleCheckout}
        >
          {hasItems ? "Thanh toán" : "Từ ₫0"}
        </button>
      </div>
    </>
  );
}
