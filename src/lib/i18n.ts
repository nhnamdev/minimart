import type { LanguageCode } from "@/types/catalog";

export const languageOptions: Array<{ code: LanguageCode; label: string }> = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
  { code: "zh-Hans", label: "简体中文" },
  { code: "zh-Hant", label: "繁體中文" },
];

const messages = {
  vi: {
    language: "Ngôn ngữ", contact: "Liên hệ", delivery: "Giao hàng", pickup: "Tự đến lấy",
    storeInfo: "Thông tin cửa hàng", storePhone: "Số điện thoại cửa hàng", deliveryHours: "Thời gian bán giao hàng",
    storeAddress: "Địa chỉ cửa hàng", fulfillment: "Phương thức nhận hàng", search: "Tìm kiếm", close: "Đóng",
    searchProducts: "Tìm kiếm sản phẩm", chooseLanguage: "Vui lòng chọn ngôn ngữ", closeLanguage: "Đóng chọn ngôn ngữ",
    goods: "Hàng hóa", orders: "Đơn hàng", noOrders: "Chưa có đơn hàng", categories: "Danh mục sản phẩm",
    view: "Xem", quantity: "Số lượng", decrease: "Giảm một", increase: "Thêm một", soldOut: "đã hết hàng",
    closeProduct: "Đóng chi tiết sản phẩm", cart: "Giỏ hàng", clearAll: "Xóa tất cả", closeCart: "Đóng giỏ hàng",
    openCart: "Mở giỏ hàng", emptyCart: "Giỏ hàng đang trống", checkout: "Thanh toán", fromZero: "Từ ₫0",
    confirmOrder: "Xác nhận đơn hàng", information: "Thông tin:", store: "Quán", name: "Tên:", phone: "Số ĐT:",
    address: "Địa chỉ:", enterName: "Vui lòng nhập tên", enterPhone: "Vui lòng nhập số điện thoại",
    enterAddress: "Vui lòng nhập địa chỉ nhận hàng", storeAddressLabel: "Địa chỉ cửa hàng:", addedNow: "Thêm lần này:",
    subtotal: "Tạm tính", note: "Ghi chú:", orderNote: "Ghi chú đơn hàng", cancel: "Huỷ", confirm: "Xác nhận",
    sending: "Đang gửi...", orderSuccess: "Đã gửi đơn", orderFailed: "Không thể gửi đơn hàng. Vui lòng thử lại.",
    loading: "Đang tải cửa hàng...", loadFailed: "Không thể tải dữ liệu cửa hàng.", retry: "Thử lại", emptyCatalog: "Chưa có sản phẩm.",
  },
  en: {
    language: "Language", contact: "Contact", delivery: "Delivery", pickup: "Pick up",
    storeInfo: "Store information", storePhone: "Store phone", deliveryHours: "Delivery hours",
    storeAddress: "Store address", fulfillment: "Fulfillment method", search: "Search", close: "Close",
    searchProducts: "Search products", chooseLanguage: "Choose a language", closeLanguage: "Close language selector",
    goods: "Products", orders: "Orders", noOrders: "No orders yet", categories: "Product categories",
    view: "View", quantity: "Quantity", decrease: "Remove one", increase: "Add one", soldOut: "is sold out",
    closeProduct: "Close product details", cart: "Cart", clearAll: "Clear all", closeCart: "Close cart",
    openCart: "Open cart", emptyCart: "Your cart is empty", checkout: "Checkout", fromZero: "From ₫0",
    confirmOrder: "Confirm order", information: "Information:", store: "Store", name: "Name:", phone: "Phone:",
    address: "Address:", enterName: "Enter your name", enterPhone: "Enter your phone number",
    enterAddress: "Enter the delivery address", storeAddressLabel: "Store address:", addedNow: "Items:",
    subtotal: "Subtotal", note: "Note:", orderNote: "Order note", cancel: "Cancel", confirm: "Confirm",
    sending: "Sending...", orderSuccess: "Order sent", orderFailed: "Could not send your order. Please try again.",
    loading: "Loading store...", loadFailed: "Could not load store data.", retry: "Retry", emptyCatalog: "No products yet.",
  },
  "zh-Hans": {
    language: "语言", contact: "联系", delivery: "配送", pickup: "到店自取",
    storeInfo: "门店信息", storePhone: "门店电话", deliveryHours: "配送时间", storeAddress: "门店地址",
    fulfillment: "取货方式", search: "搜索", close: "关闭", searchProducts: "搜索商品", chooseLanguage: "请选择语言",
    closeLanguage: "关闭语言选择", goods: "商品", orders: "订单", noOrders: "暂无订单", categories: "商品分类",
    view: "查看", quantity: "数量", decrease: "减少一件", increase: "增加一件", soldOut: "已售罄",
    closeProduct: "关闭商品详情", cart: "购物车", clearAll: "清空", closeCart: "关闭购物车", openCart: "打开购物车",
    emptyCart: "购物车为空", checkout: "结算", fromZero: "₫0 起", confirmOrder: "确认订单", information: "信息：",
    store: "门店", name: "姓名：", phone: "电话：", address: "地址：", enterName: "请输入姓名",
    enterPhone: "请输入电话号码", enterAddress: "请输入配送地址", storeAddressLabel: "门店地址：", addedNow: "本次商品：",
    subtotal: "小计", note: "备注：", orderNote: "订单备注", cancel: "取消", confirm: "确认", sending: "正在发送...",
    orderSuccess: "订单已发送", orderFailed: "订单发送失败，请重试。", loading: "正在加载门店...",
    loadFailed: "无法加载门店数据。", retry: "重试", emptyCatalog: "暂无商品。",
  },
  "zh-Hant": {
    language: "語言", contact: "聯絡", delivery: "配送", pickup: "到店自取",
    storeInfo: "門店資訊", storePhone: "門店電話", deliveryHours: "配送時間", storeAddress: "門店地址",
    fulfillment: "取貨方式", search: "搜尋", close: "關閉", searchProducts: "搜尋商品", chooseLanguage: "請選擇語言",
    closeLanguage: "關閉語言選擇", goods: "商品", orders: "訂單", noOrders: "暫無訂單", categories: "商品分類",
    view: "查看", quantity: "數量", decrease: "減少一件", increase: "增加一件", soldOut: "已售罄",
    closeProduct: "關閉商品詳情", cart: "購物車", clearAll: "清空", closeCart: "關閉購物車", openCart: "打開購物車",
    emptyCart: "購物車為空", checkout: "結帳", fromZero: "₫0 起", confirmOrder: "確認訂單", information: "資訊：",
    store: "門店", name: "姓名：", phone: "電話：", address: "地址：", enterName: "請輸入姓名",
    enterPhone: "請輸入電話號碼", enterAddress: "請輸入配送地址", storeAddressLabel: "門店地址：", addedNow: "本次商品：",
    subtotal: "小計", note: "備註：", orderNote: "訂單備註", cancel: "取消", confirm: "確認", sending: "正在傳送...",
    orderSuccess: "訂單已傳送", orderFailed: "訂單傳送失敗，請重試。", loading: "正在載入門店...",
    loadFailed: "無法載入門店資料。", retry: "重試", emptyCatalog: "暫無商品。",
  },
} as const;

export type MessageKey = keyof typeof messages.vi;

export function translate(language: LanguageCode, key: MessageKey) {
  return messages[language][key] ?? messages.vi[key];
}
