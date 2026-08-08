# CatalogBrowser Specification

## Overview
- Target file: `src/components/CatalogBrowser.tsx`
- Screenshot: unavailable; see `docs/research/BEHAVIORS.md`
- Interaction model: scroll + click driven

## DOM structure
- Flex catalog region.
- Category rail with one button per category.
- Product pane with section heading and product rows.
- Product row: image, text content, price, quantity controls.

## Computed styles
- Catalog: flex 1, display flex, overflow hidden, bottom padding 48px.
- Category rail: width `20vw`, background `#f3f5f7`.
- Category item: display table/flex, width 100%, height `6vh`, centered, color `#5b5b5b`.
- Active category: white background, weight 700, z-index 10.
- Product pane: flex 1.
- Section title: padding-left 14px, line-height `7vw`, left border 3px `#777`, font `3.5vw`, weight 700, background `#f3f5f7`.
- Product: flex, centered, margin `3vw 3vw 3vw 0`, bottom padding `3vw`.
- Image: `18vw × 18vw`, radius `1vw`, horizontal margin `2vw`.
- Name: `3.6vw`, weight 600, color `#232323`, padding-bottom `1vw`.
- Description: `3vw`, color `#93999f`, width `35vw`.
- Price: `4.3vw`, color `#fb4f45`, weight 700.
- Quantity icon: `7vw`, color `#fdbc24`, 10px/7px hit padding.

## States and behaviors
- Category button scrolls product pane to section and becomes active.
- Product pane scrolling updates active category using IntersectionObserver.
- Search term filters both names and descriptions.
- Add/decrease update local quantity; controls transition 0.4s linear.
- Product click opens a simple detail panel with the same image/copy.

## Assets
- Nine downloaded product images in `/images/order-multi/` map to the first nine real products.
- Remaining representative real products use the source placeholder artwork.

## Text content
- 14 source categories, including `保存图片➕好友`, `越南电话卡`, `槟榔`, and `保真香烟`.
- First products and prices are verbatim from the live catalog.

## Responsive behavior
- Rail 20%, products 80% at all widths.
- Internal panes scroll independently within remaining viewport.
