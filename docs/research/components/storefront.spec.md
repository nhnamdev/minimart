# Storefront Specification

## Overview
- Target file: `src/components/Storefront.tsx`
- Screenshot: unavailable; see `docs/research/QA.md`
- Interaction model: state orchestration

## DOM structure
- Full viewport flex shell.
- StoreHeader, OrderTabs, CatalogBrowser, and ShoppingCart in source order.
- Empty order state replaces catalog/cart when the orders tab is active.

## Styles
- Width 100%, height `100dvh`, white background, column layout, overflow hidden.
- Catalog receives all remaining height through `flex: 1` and `min-height: 0`.

## States and behaviors
- Owns search text, active tab, and product quantity map.
- Quantity zero removes the product key from local state.
- Switching tabs keeps the current demo cart quantities in memory.

## Assets and content
- Imports the real-content catalog and the four section components.
- Empty orders copy: `Chưa có đơn hàng`.

## Responsive behavior
- Full viewport at all widths; child sections preserve the source vw/vh proportions.
