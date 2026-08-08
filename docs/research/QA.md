# OrderMulti Clone QA

## Automated checks

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed with static `/` route.
- UTF-8 byte-level string checks: Vietnamese and Chinese source strings present; common mojibake sequences absent.

## Browser interaction checks

- Mobile viewport 390 × 844 loaded the full storefront.
- Header rendered at 117px after matching the source's 30vw total height.
- Search `Zalo` reduced the catalog to one category and one product; `微信` was absent.
- Adding Zalo displayed decrement/count controls, cart count, `₫1`, and active checkout.
- Cart drawer opened with `Giỏ hàng`, Zalo, and `Xóa tất cả`.
- Language control opened the visible dialog with 汉语, Tiếng Việt, and English.
- `Đơn hàng` switched to `Chưa có đơn hàng` and removed the cart bar.
- Desktop viewport 1440 × 900 loaded the same viewport-proportional component tree.
- Pickup flow at 390 × 844 passed on the production build: `Tự đến lấy` → add `微信` → `Thanh toán` opened `Xác nhận đơn hàng`.
- Pickup dialog contained name and telephone inputs, the fixed store address, one live cart row, item count, subtotal, remarks, `Huỷ`, and `Xác nhận`; the delivery-address input was absent.
- Pickup dialog measured 358.8px wide with a 7.8px radius and 19.5px title text/line-height, matching the source at the same viewport.

## Visual capture limitation

The Browser screenshot API timed out on both the source and local clone even though DOM inspection and interactions remained available. Visual QA used computed layout rectangles, exact source CSS values, live DOM state, and downloaded assets. No comparison screenshot is claimed.
