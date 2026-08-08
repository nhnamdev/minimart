"use client";

import { useMemo } from "react";

import { PhoneIcon } from "@/components/icons";
import { formatVnd } from "@/data/catalog";
import type { CartQuantities, Product } from "@/types/catalog";

interface PickupCheckoutDialogProps {
  products: Product[];
  quantities: CartQuantities;
  onCancel: () => void;
  onConfirm: () => void;
}

export function PickupCheckoutDialog({
  products,
  quantities,
  onCancel,
  onConfirm,
}: PickupCheckoutDialogProps) {
  const selectedProducts = useMemo(
    () => products.filter((product) => (quantities[product.id] ?? 0) > 0),
    [products, quantities],
  );
  const itemCount = selectedProducts.reduce(
    (sum, product) => sum + (quantities[product.id] ?? 0),
    0,
  );
  const subtotal = selectedProducts.reduce(
    (sum, product) => sum + product.price * (quantities[product.id] ?? 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-[110] bg-black/60" role="presentation">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="pickup-checkout-title"
        className="absolute top-1/2 left-1/2 flex max-h-[94dvh] w-[92vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2vw] bg-white leading-none"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm();
        }}
      >
        <h2
          id="pickup-checkout-title"
          className="mt-[4.5vw] border-b border-[#eaeaea] pb-[4.5vw] text-center text-[5vw] font-medium text-[#fdbc24]"
        >
          Xác nhận đơn hàng
        </h2>

        <div className="min-h-0 w-full flex-1 overflow-y-auto bg-[#f3f3f3] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <section>
            <div className="mx-[2.5vw] mt-[2.5vw] flex bg-white px-[3vw] pt-[3vw] text-[4.3vw] font-medium text-[#fdbc24]">
              <span className="flex items-center">Thông tin:</span>
              <span className="ml-auto flex items-center">
                <a href="tel:0865016689" className="flex items-center gap-[1vw] text-[3.8vw]">
                  <PhoneIcon className="size-[3.4vw]" />
                  <span>Quán</span>
                </a>
              </span>
            </div>

            <div className="mx-[2.5vw] mb-[2.5vw] bg-white px-[3vw] pb-[3vw] text-[3.7vw]">
              <label className="flex h-[10vw] items-center border-b border-[#f9f9f9]">
                <span className="min-w-[20vw] whitespace-nowrap">Tên:</span>
                <input
                  type="text"
                  placeholder="Vui lòng nhập tên"
                  className="h-full min-w-0 flex-1 border-0 pl-[1vw] text-[#333] outline-none placeholder:text-[#999]"
                />
              </label>
              <label className="flex h-[10vw] items-center border-b border-[#f9f9f9]">
                <span className="min-w-[20vw] whitespace-nowrap">Số ĐT:</span>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="Vui lòng nhập số điện thoại"
                  className="h-full min-w-0 flex-1 border-0 pl-[1vw] text-[#333] outline-none placeholder:text-[#999]"
                />
              </label>
            </div>
          </section>

          <section className="mx-[2.5vw] mt-[2.5vw] flex bg-white p-[3vw] text-[4.3vw] font-medium text-[#fdbc24]">
            <span className="shrink-0">Địa chỉ cửa hàng:</span>
            <span className="flex-1 pl-[1vw] text-[3.7vw] leading-[5vw] font-normal text-[#333]">
              32a Đường Số 81, Tân Hưng, Hồ Chí Minh
            </span>
          </section>

          <section>
            <h3 className="mx-[2.5vw] mt-[2.5vw] bg-white px-[3vw] pt-[3vw] text-[4.3vw] font-medium text-[#fdbc24]">
              Thêm lần này:
            </h3>
            <div className="mx-[2.5vw] mb-[2.5vw] bg-white p-[3vw] text-[3.7vw]">
              {selectedProducts.map((product) => {
                const quantity = quantities[product.id] ?? 0;

                return (
                  <div key={product.id} className="flex border-b border-[#f9f9f9] py-[3vw]">
                    <div className="flex w-[65%] flex-wrap overflow-hidden">
                      <span className="w-[80%] break-words text-[#454545]">{product.name}</span>
                      <span className="flex flex-1 flex-row-reverse whitespace-nowrap font-medium text-[#878787]">
                        x{quantity}
                      </span>
                    </div>
                    <span className="flex-1 text-right font-medium text-[#383838]">
                      {formatVnd(product.price * quantity)}
                    </span>
                  </div>
                );
              })}

              <div className="pt-[3vw] text-right text-[4vw] font-medium text-[#383838]">
                <span className="mr-[2%]">Số lượng {itemCount}</span>
                <span>
                  Tạm tính <strong>{formatVnd(subtotal)}</strong>
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mx-[2.5vw] mt-[2.5vw] bg-white px-[3vw] pt-[3vw] text-[4.3vw] font-medium text-[#fdbc24]">
              Ghi chú:
            </h3>
            <div className="mx-[2.5vw] mb-[2.5vw] flex bg-white p-[3vw] text-[3.7vw]">
              <textarea
                maxLength={100}
                aria-label="Ghi chú đơn hàng"
                className="h-[20vw] flex-1 resize-none border border-[#ccc] bg-white p-0.5 outline-none"
              />
            </div>
          </section>
        </div>

        <div className="mt-[3vw] flex w-full border-t border-[#eaeaea] text-center">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border-r border-[#eaeaea] p-[4vw] !text-[5vw] font-medium text-[#666]"
          >
            Huỷ
          </button>
          <button type="submit" className="flex-1 p-[4vw] !text-[5vw] font-medium text-[#fdbc24]">
            Xác nhận
          </button>
        </div>
      </form>
    </div>
  );
}
