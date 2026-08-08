"use client";

import { useMemo } from "react";

import { PhoneIcon } from "@/components/icons";
import { formatVnd } from "@/data/catalog";
import type { CartQuantities, Product } from "@/types/catalog";

interface DeliveryCheckoutDialogProps {
  products: Product[];
  quantities: CartQuantities;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeliveryCheckoutDialog({
  products,
  quantities,
  onCancel,
  onConfirm,
}: DeliveryCheckoutDialogProps) {
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
        aria-labelledby="delivery-checkout-title"
        className="absolute top-1/2 left-1/2 flex max-h-[94dvh] w-[92vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2vw] bg-white md:w-[640px] md:rounded-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm();
        }}
      >
        <h2
          id="delivery-checkout-title"
          className="mt-[4.5vw] border-b border-[#eaeaea] pb-[4.5vw] text-center text-[5vw] font-medium text-[#fdbc24] md:mt-6 md:pb-5 md:text-2xl"
        >
          Xác nhận đơn hàng
        </h2>

        <div className="min-h-0 w-full flex-1 overflow-y-auto bg-[#f3f3f3] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <section>
            <div className="mx-[2.5vw] mt-[2.5vw] flex bg-white px-[3vw] pt-[3vw] text-[4.3vw] font-medium text-[#fdbc24] md:mx-4 md:mt-4 md:px-5 md:pt-5 md:text-lg">
              <span className="flex items-center">Thông tin:</span>
              <span className="ml-auto flex items-center">
                <a href="tel:0865016689" className="flex items-center gap-[1vw] text-[3.8vw] md:gap-2 md:text-sm">
                  <PhoneIcon className="size-[3.4vw] md:size-4" />
                  <span>Quán</span>
                </a>
              </span>
            </div>

            <div className="mx-[2.5vw] mb-[2.5vw] bg-white px-[3vw] pb-[3vw] text-[3.7vw] md:mx-4 md:mb-4 md:px-5 md:pb-5 md:text-sm">
              <label className="flex h-[10vw] items-center border-b border-[#f9f9f9] md:h-12">
                <span className="min-w-[20vw] whitespace-nowrap md:min-w-28">Tên:</span>
                <input
                  type="text"
                  placeholder="Vui lòng nhập tên"
                  className="h-full min-w-0 flex-1 border-0 pl-[1vw] text-[#333] outline-none placeholder:text-[#999] md:pl-2"
                />
              </label>
              <label className="flex h-[10vw] items-center border-b border-[#f9f9f9] md:h-12">
                <span className="min-w-[20vw] whitespace-nowrap md:min-w-28">Số ĐT:</span>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="Vui lòng nhập số điện thoại"
                  className="h-full min-w-0 flex-1 border-0 pl-[1vw] text-[#333] outline-none placeholder:text-[#999] md:pl-2"
                />
              </label>
              <label className="flex h-[10vw] items-center border-b border-[#f9f9f9] md:h-12">
                <span className="min-w-[20vw] whitespace-nowrap md:min-w-28">Địa chỉ:</span>
                <input
                  type="text"
                  placeholder="Vui lòng nhập địa chỉ nhận hàng"
                  className="h-full min-w-0 flex-1 border-0 pl-[1vw] text-[#333] outline-none placeholder:text-[#999] md:pl-2"
                />
              </label>
            </div>
          </section>

          <section>
            <h3 className="mx-[2.5vw] mt-[2.5vw] bg-white px-[3vw] pt-[3vw] text-[4.3vw] font-medium text-[#fdbc24] md:mx-4 md:mt-4 md:px-5 md:pt-5 md:text-lg">
              Thêm lần này:
            </h3>
            <div className="mx-[2.5vw] mb-[2.5vw] bg-white p-[3vw] text-[3.7vw] md:mx-4 md:mb-4 md:p-5 md:text-sm">
              {selectedProducts.map((product) => {
                const quantity = quantities[product.id] ?? 0;

                return (
                  <div key={product.id} className="flex border-b border-[#f9f9f9] py-[3vw] md:py-3">
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

              <div className="pt-[3vw] text-right text-[4vw] font-medium text-[#383838] md:pt-4 md:text-base">
                <span className="mr-[2%]">Số lượng {itemCount}</span>
                <span>
                  Tạm tính <strong>{formatVnd(subtotal)}</strong>
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mx-[2.5vw] mt-[2.5vw] bg-white px-[3vw] pt-[3vw] text-[4.3vw] font-medium text-[#fdbc24] md:mx-4 md:mt-4 md:px-5 md:pt-5 md:text-lg">
              Ghi chú:
            </h3>
            <div className="mx-[2.5vw] mb-[2.5vw] flex bg-white p-[3vw] text-[3.7vw] md:mx-4 md:mb-4 md:p-5 md:text-sm">
              <textarea
                maxLength={100}
                aria-label="Ghi chú đơn hàng"
                className="h-[20vw] flex-1 resize-none border border-[#ccc] bg-white p-0.5 outline-none md:h-28 md:p-2"
              />
            </div>
          </section>
        </div>

        <div className="mt-[3vw] flex w-full border-t border-[#eaeaea] text-center md:mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border-r border-[#eaeaea] p-[4vw] text-[5vw] font-medium text-[#666] md:p-4 md:text-lg"
          >
            Huỷ
          </button>
          <button type="submit" className="flex-1 p-[4vw] text-[5vw] font-medium text-[#fdbc24] md:p-4 md:text-lg">
            Xác nhận
          </button>
        </div>
      </form>
    </div>
  );
}
