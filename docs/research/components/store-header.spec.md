# StoreHeader Specification

## Overview
- Target file: `src/components/StoreHeader.tsx`
- Screenshot: unavailable; see `docs/research/BEHAVIORS.md`
- Interaction model: click-driven

## DOM structure
- Header background image + dark translucent overlay.
- Main row: square avatar, store content, language action.
- Content: title, description, opening time.
- Action row: phone link and search button.

## Computed styles
- Header: relative, overflow hidden, white text, background `rgba(7,17,27,.5)`.
- Main: flex, padding `4vw 4vw 0`.
- Avatar image: `18vw × 18vw`, radius `1vw`.
- Content margin: left `1.5vw`, right `1vw`.
- Store title: `4.3vw`, `5vw` line-height, weight 700.
- Descriptions: width `53vw`, font `3.1vw`, line-height `3.3vw`, margin-bottom `2vw`.
- Language: font `3vw`, icon `3vw`.
- Action row: height `6vw`, padding-right `5vw`, padding-bottom `2vw`.
- Action: font `3vw`, padding `1vw 2vw`, border `.55px solid #fff`, radius `2.55vw`.

## States and behaviors
- Language overlay fades over the page; selected language has a filled radio.
- Search state replaces actions with an input and clear control; typing filters the catalog.
- Phone link uses exact number `0865016689`.

## Assets
- `/images/order-multi/store-avatar.jpg` is used for both avatar and background.
- Search, phone, globe/settings, and close icons from `src/components/icons.tsx`.

## Text content
- `小兔便利店`
- `Thời gian mở cửa: Cả ngày`
- `Ngôn ngữ`, `Liên hệ quán`, `Tìm kiếm`
- Language dialog: `Vui lòng chọn ngôn ngữ`, `汉语`, `Tiếng Việt`, `English`

## Responsive behavior
- All source measurements use vw and maintain fixed proportions.
- The shell preserves the source's viewport-proportional behavior at mobile and desktop widths.
