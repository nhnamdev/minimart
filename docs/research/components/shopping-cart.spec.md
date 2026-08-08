# ShoppingCart Specification

## Overview
- Target file: `src/components/ShoppingCart.tsx`
- Screenshot: unavailable; see `docs/research/BEHAVIORS.md`
- Interaction model: click-driven

## DOM structure
- Fixed bar: left cart identity/total, right minimum/pay panel.
- Optional cart drawer above bar with selected rows.

## Computed styles
- Fixed bottom bar: left 0, bottom 0, z-index 99, width 100%, height 48px.
- Content background: `#141d27`.
- Logo wrapper: top -10px, margin `0 12px`, padding 6px, 56px square, circular.
- Logo: circular, `#2b343c`; populated state `#fdbc24`.
- Count: absolute red badge, 24px square, font 9px, white.
- Total: margin-top 12px, line-height 24px, font 16px, weight 700.
- Right region: min-width `25vw`.
- Pay: height 48px, font `3vw`, weight 700, `#2b333b`; active `#fdbc24`.

## States and behaviors
- Empty: total `₫0`, copy `Từ ₫0`, drawer disabled.
- Populated: count badge and total update immediately; clicking cart toggles drawer.
- Checkout is demo-only and does not transmit data.

## Assets
- Cart, plus, minus, and close icons from `src/components/icons.tsx`.

## Text content
- `₫0`, `Từ ₫0`, `Giỏ hàng`, `Xóa tất cả`.

## Responsive behavior
- Fixed 48px bar at all viewport sizes.
