# OrderMulti Goods Page Topology

Target: `https://client.ordermulti.com/?store=69f18f6ea246be0013de3252&phone=true&st=1785843387220#/goods`

## Page flow

1. Fulfillment choice — store summary plus `Giao hàng` and `Tự đến lấy` actions. The selected mode controls the checkout-dialog variant.
2. Store header — fixed-height visual block with blurred avatar background, logo, store name, opening hours, language control, phone action, and search action.
3. Order tabs — two equal-width items: `Đặt hàng` (active) and `Đơn hàng`.
4. Catalog workspace — fills the remaining viewport above the 48px cart bar.
   - Left category rail: 20% of viewport width, independently scrollable.
   - Right product list: 80% of viewport width, independently scrollable.
   - Clicking a category scrolls the matching product section into view and changes the active category.
5. Shopping cart — fixed to the viewport bottom, dark background, yellow active state, total and minimum-order copy.
6. Overlays — language selector, search UI, product detail, cart summary, and checkout confirmation are click-driven layers above the page.
   - Delivery checkout contains name, telephone, and delivery-address inputs.
   - Pickup checkout contains name and telephone inputs plus the fixed store address.

The source uses viewport-width units throughout. The supplied `phone=true` URL keeps the same proportional layout at desktop and mobile widths.

## Interaction model

- Header: click-driven language/search overlays; phone action uses `tel:0865016689`.
- Tabs: click-driven active state; this clone keeps `Đặt hàng` active and shows a local empty-orders state for `Đơn hàng`.
- Categories/products: scroll + click driven.
- Quantity controls: click-driven with a 0.4s opacity/rotation transition in the source.
- Cart: click-driven summary drawer and fulfillment-specific checkout dialog; final confirmation remains demo-only.

## Browser evidence

The in-app browser exposed the complete DOM, computed styles, original CSS, and live assets. Screenshot capture repeatedly timed out because the source renders a ~182,000px product list inside a viewport-sized scroll container. The clone is therefore based on computed values and original CSS rather than screenshot measurement.
