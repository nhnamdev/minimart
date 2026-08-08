# PickupCheckoutDialog Specification

## Overview
- **Target file:** `src/components/PickupCheckoutDialog.tsx`
- **Reference:** live Pickup checkout flow plus the user-provided `confirm-order-dialogMask` HTML
- **Interaction model:** click-driven modal opened by the checkout button only when the fulfillment mode is Pickup

## DOM Structure
- Fixed full-screen dark mask
- Centered white dialog with title
- Scrollable light-gray content area
  - Store contact row
  - Customer name and telephone inputs
  - Fixed store-address row
  - Current cart item list and subtotal
  - Remarks textarea
- Dialog footer with Cancel and Confirm actions

## Computed Styles

### Mask
- position: fixed
- inset: 0
- width / height: 100%
- background: rgba(0, 0, 0, 0.6)
- z-index: 99

### Dialog
- position: absolute
- width: 92vw
- max-height: 94dvh so the footer remains reachable
- left / top: 50%
- transform: translate(-50%, -50%)
- border-radius: 2vw
- background: #fff
- display: flex; flex-direction: column

### Title
- margin-top: 4.5vw
- padding-bottom: 4.5vw
- font-size: 5vw
- line-height: 1
- font-weight: 500
- color: #fdbc24
- border-bottom: 1px solid #eaeaea
- text-align: center

### Content
- width: 100%
- max-height on original: 70vh
- min-height: 0 and flex: 1 in the clone so the footer remains reachable
- overflow-y: auto; scrollbar hidden
- background: #f3f3f3

### Section heading
- margin: 2.5vw 2.5vw 0
- padding: 3vw 3vw 0
- font-size: 4.3vw
- font-weight: 500
- color: #fdbc24
- background: #fff

### White content block
- margin: 0 2.5vw 2.5vw
- padding: 3vw
- font-size: 3.7vw
- background: #fff

### Customer inputs
- row height: 10vw
- border-bottom: 1px solid #f9f9f9
- label minimum width: 20vw
- input fills the remaining width, has no border, and uses 1vw left padding

### Store address row
- margin: 2.5vw 2.5vw 0
- padding: 3vw 3vw 3vw
- display: flex
- label: `Địa chỉ cửa hàng:`
- value: `32a Đường Số 81, Tân Hưng, Hồ Chí Minh`
- value color: #333

### Cart rows and statistics
- item row: display flex; padding: 3vw 0; border-bottom: 1px solid #f9f9f9
- item left column: width 65%; flex-wrap; overflow hidden
- item name: width 80%; color #454545
- quantity: flex 1; reverse-aligned; color #878787; font-weight 500
- price: flex 1; text-align right; color #383838; font-weight 500
- statistics: padding-top 3vw; text-align right; font-size 4vw; color #383838
- subtotal value: font-weight 700

### Remarks
- textarea height: 20vw
- max length: 100
- resize: none
- border: 1px solid #ccc

### Footer
- display: flex
- border-top: 1px solid #eaeaea
- margin-top: 3vw
- each action: flex 1; padding 4vw; font-size 5vw; font-weight 500
- cancel color: #666; right divider: 1px solid #eaeaea
- confirm color: #fdbc24

## States & Behaviors
- Checkout with Pickup and a non-empty cart opens this modal.
- Checkout with Delivery continues to open `DeliveryCheckoutDialog`.
- Cancel closes the modal without changing the cart.
- Confirm closes the modal and shows the existing demo-order notice; no backend submission is in scope.
- Item rows, quantities, prices, count, and subtotal come from current cart state.

## Text Content
- Xác nhận đơn hàng
- Thông tin / Quán
- Tên / Vui lòng nhập tên
- Số ĐT / Vui lòng nhập số điện thoại
- Địa chỉ cửa hàng
- 32a Đường Số 81, Tân Hưng, Hồ Chí Minh
- Thêm lần này
- Số lượng / Tạm tính
- Ghi chú
- Huỷ / Xác nhận

## Responsive Behavior
- **Desktop:** retains the target's viewport-relative proportions and centered modal.
- **Tablet:** retains the 92vw dialog and scrollable content.
- **Mobile (390 x 844 measured):** dialog width 358.8px; radius 7.8px; title 19.5px; footer action height about 50.7px.
- Content scrolls independently when cart rows exceed the available height.
