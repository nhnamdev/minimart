# OrderTabs Specification

## Overview
- Target file: `src/components/OrderTabs.tsx`
- Screenshot: unavailable; see `docs/research/BEHAVIORS.md`
- Interaction model: click-driven

## DOM structure
- One horizontal tab list with two equal items and a hairline bottom border.

## Computed styles
- Container: flex, width 100%, height and line-height `6vh`, relative.
- Tab: flex 1, centered, relative.
- Link: block, font `3.5vw`, color `#4d555d`.
- Active link: `#f01414`.
- Divider/bottom border: `rgba(7,17,27,.1)`.

## States and behaviors
- `Đặt hàng` active by default.
- Clicking `Đơn hàng` switches to a local empty-order panel without navigation/backend.

## Assets
- N/A.

## Text content
- `Đặt hàng`
- `Đơn hàng`

## Responsive behavior
- Two equal columns at all widths.
