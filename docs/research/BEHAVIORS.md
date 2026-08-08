# OrderMulti Goods Behaviors

## Entry flow

- First visit displays a centered `Thông báo` dialog containing `小兔便利店` and an `OK` action.
- Dismissing it reveals the pickup-method route. Choosing `Giao hàng` opens `#/goods`.
- The clone starts directly on the requested goods view and reproduces the store controls as local UI.

## Header

- Store image is duplicated as a heavily blurred background beneath `rgba(7, 17, 27, 0.5)`.
- `Ngôn ngữ` opens a centered dark overlay with 汉语, Tiếng Việt, and English.
- `Tìm kiếm` reveals an input in the header and filters product name/description client-side.
- `Liên hệ quán` points to `tel:0865016689`.

## Catalog

- Both category rail and product pane scroll independently; the document body stays fixed-height and hidden.
- Category click scrolls the corresponding section and marks it white/bold.
- Product rows are separated by `rgba(7, 17, 27, 0.1)` hairlines.
- Product images are square with a `1vw` radius.
- Add control is yellow. Once quantity is positive, decrement/count controls appear. Source transition is `all .4s linear`, rotating the icon from 180deg to 0deg.

## Cart

- Bar is fixed at bottom with `#141d27` background and 48px height.
- Empty icon background is `#2b343c`; populated state is `#fdbc24` with white icon and a red count badge.
- Empty price text is translucent white; populated total is white.
- The pay panel remains `#2b333b` while minimum order is unmet and turns `#fdbc24` when eligible.

## Responsive behavior

- Original CSS is viewport-proportional (`vw`), not breakpoint-driven.
- Left rail remains 20vw and product pane 80vw at 1440, 768, and 390 widths.
- Text, images, spacing, and header scale with viewport width.
- On very wide screens the original becomes oversized; the clone preserves this defining viewport-proportional behavior for fidelity.

## Known extraction limitation

`Page.captureScreenshot` timed out at both 1440 and 390 viewport requests on the source page. DOM snapshots, original stylesheet files, computed styles, and downloaded assets succeeded.
