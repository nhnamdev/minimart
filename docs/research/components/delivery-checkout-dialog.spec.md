# DeliveryCheckoutDialog Specification

## Overview
- **Target file:** `src/components/DeliveryCheckoutDialog.tsx`
- **Reference:** user-provided `confirm-order-dialogMask` HTML and the live Delivery checkout flow
- **Interaction model:** click-driven modal opened by the checkout button only when the fulfillment mode is Delivery

## DOM Structure
- Fixed full-screen dark mask
- Centered white dialog with title
- Scrollable light-gray content area
  - Business contact row
  - Customer name, telephone, and receiving-address inputs
  - Current cart item list and subtotal
  - Remarks textarea
- Fixed dialog footer with Cancel and Confirm actions

## Computed Styles

### Mask
- position: fixed
- inset: 0
- background: rgba(0, 0, 0, 0.6)
- z-index: 99

### Dialog
- width: 92vw
- max-height: 94dvh so both footer actions remain reachable on desktop and mobile
- left/top: 50%
- transform: translate(-50%, -50%)
- border-radius: 2vw
- background: #fff
- display: flex; flex-direction: column

### Title
- margin-top: 4.5vw
- padding-bottom: 4.5vw
- font-size: 5vw
- font-weight: 500
- color: #fdbc24
- border-bottom: 1px solid #eaeaea

### Content
- width: 100%
- flex: 1; min-height: 0 inside the viewport-bounded dialog
- overflow-y: auto
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

### Footer
- display: flex
- border-top: 1px solid #eaeaea
- margin-top: 3vw
- each action: flex: 1; padding: 4vw; font-size: 5vw; font-weight: 500
- cancel color: #666
- confirm color: #fdbc24

## States & Behaviors
- Checkout with Delivery and a non-empty cart opens the modal.
- Checkout with Pickup keeps the existing demo notice and does not open this modal.
- Cancel closes the modal without changing the cart.
- Confirm closes the modal and shows the existing demo-order notice; no backend submission is in scope.
- The item list, quantities, item prices, item count, and subtotal come from current cart state.

## Text Content
- Xác nhận đơn hàng
- Thông tin / Quán
- Tên / Vui lòng nhập tên
- Số ĐT / Vui lòng nhập số điện thoại
- Địa chỉ / Vui lòng nhập địa chỉ nhận hàng
- Thêm lần này
- Số lượng / Tạm tính
- Ghi chú
- Huỷ / Xác nhận

## Responsive Behavior
- Uses the original viewport-relative sizing at mobile, tablet, and desktop widths.
- Dialog content remains scrollable at a maximum of 70vh.
- Long item names wrap while quantities and prices stay aligned.
