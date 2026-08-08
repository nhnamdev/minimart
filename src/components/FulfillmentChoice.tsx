"use client";

import Image from "next/image";

import {
  DeliveryIcon,
  GlobeIcon,
  LocationIcon,
  PhoneIcon,
  PickupIcon,
} from "@/components/icons";

interface FulfillmentChoiceProps {
  onSelect: (mode: "delivery" | "pickup") => void;
}

export function FulfillmentChoice({ onSelect }: FulfillmentChoiceProps) {
  return (
    <main className="flex min-h-dvh w-full flex-col overflow-y-auto bg-[#f3f5f7]">
      <header className="relative isolate overflow-hidden text-white">
        <div aria-hidden="true" className="absolute -inset-[2vw] -z-20 blur-[3vw]">
          <Image
            src="/images/order-multi/store-avatar.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgba(7,17,27,.5)]" />

        <div className="flex px-[4vw] py-[4vw]">
          <div className="relative size-[18vw] shrink-0 overflow-hidden rounded-[1vw]">
            <Image
              src="/images/order-multi/store-avatar.jpg"
              alt="Ảnh đại diện Cửa hàng tiện lợi Thỏ Nhỏ"
              fill
              priority
              sizes="18vw"
              className="object-cover"
            />
          </div>

          <div className="ml-[1.5vw] min-w-0 flex-1">
            <h1 className="text-[4.3vw] leading-[5vw] font-bold">Cửa hàng tiện lợi Thỏ Nhỏ</h1>
            <p className="mt-[1vw] text-[3.1vw] leading-[4vw]">Tiện lợi mỗi ngày</p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-[3vw]">
            <button type="button" className="flex items-center gap-[1vw] text-[3vw] leading-[5vw]">
              <GlobeIcon className="size-[3vw]" />
              <span>Ngôn ngữ</span>
            </button>
            <a
              href="tel:0865016689"
              className="flex items-center gap-[1vw] rounded-[2.55vw] border-[.55px] border-white px-[2vw] py-[1vw] text-[3vw] leading-none"
              aria-label="Gọi 0865 016 689"
            >
              <PhoneIcon className="size-[3vw]" />
              <span>Liên hệ</span>
            </a>
          </div>
        </div>
      </header>

      <section className="mx-[3vw] mt-[8vw] flex overflow-hidden rounded-[3vw] bg-white shadow-[0_1px_4px_rgba(7,17,27,.04)]">
        <button
          type="button"
          onClick={() => onSelect("delivery")}
          className="flex flex-1 flex-col items-center justify-center px-[3vw] pt-[9vw] pb-[9vw] active:bg-[#fafafa]"
        >
          <span className="mb-[3.5vw] text-center text-[4.5vw] font-bold">Giao hàng</span>
          <DeliveryIcon className="size-[10vw]" />
        </button>

        <div aria-hidden="true" className="my-[2vw] w-px bg-[#ccc]" />

        <button
          type="button"
          onClick={() => onSelect("pickup")}
          className="flex flex-1 flex-col items-center justify-center px-[3vw] pt-[9vw] pb-[9vw] active:bg-[#fafafa]"
        >
          <span className="mb-[3.5vw] text-center text-[4.5vw] font-bold">Tự đến lấy</span>
          <PickupIcon className="size-[10vw]" />
        </button>
      </section>

      <h2 className="mx-[3vw] mt-[8vw] mb-[4vw] ml-[5vw] text-[5vw] font-bold">Thông tin cửa hàng</h2>

      <section className="mx-[3vw] mb-[6vw] flex flex-col rounded-[3vw] bg-white p-[4vw]">
        <div className="mb-[3vw] flex items-start justify-between gap-[4vw]">
          <span className="text-[4vw] text-[#333]">Số điện thoại cửa hàng</span>
          <a href="tel:0865016689" className="flex items-center gap-[1vw] text-[3.5vw] text-[#7e8c8d]">
            <PhoneIcon className="size-[4.5vw]" />
            <span>0865016689</span>
          </a>
        </div>
        <div className="mb-[3vw] flex items-start justify-between gap-[4vw]">
          <span className="text-[4vw] text-[#333]">Thời gian bán giao hàng</span>
          <span className="text-[3.5vw] text-[#7e8c8d]">Cả ngày</span>
        </div>
        <div className="flex items-start justify-between gap-[4vw]">
          <span className="shrink-0 text-[4vw] text-[#333]">Địa chỉ cửa hàng</span>
          <span className="flex max-w-[52vw] items-start gap-[1vw] text-right text-[3.5vw] leading-[4.5vw] text-[#7e8c8d]">
            <LocationIcon className="mt-[.1vw] size-[4.5vw] shrink-0" />
            <span>32a Đường Số 81, Tân Hưng, Hồ Chí Minh</span>
          </span>
        </div>
      </section>
    </main>
  );
}
