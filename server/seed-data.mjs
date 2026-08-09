export const initialSite = {
  phone: "0865016689",
  currencyCode: "VND",
  timezone: "Asia/Ho_Chi_Minh",
  logoUrl: "/images/logo.jpg",
  coverImageUrl: "/images/order-multi/store-avatar.jpg",
  translations: {
    vi: {
      name: "Tiệm Tiện Lợi Mỹ Trân",
      tagline: "Tiện lợi mỗi ngày",
      openingHours: "Cả ngày",
      address: "32a Đường Số 81, Tân Hưng, Hồ Chí Minh",
      seoTitle: "Tiệm Tiện Lợi Mỹ Trân",
      seoDescription: "Đặt hàng trực tuyến tại Tiệm Tiện Lợi Mỹ Trân",
    },
    en: {
      name: "My Tran Convenience Store",
      tagline: "Convenience every day",
      openingHours: "Open all day",
      address: "32a Street 81, Tan Hung, Ho Chi Minh City",
      seoTitle: "My Tran Convenience Store",
      seoDescription: "Order online from My Tran Convenience Store",
    },
    "zh-Hans": {
      name: "美珍便利店",
      tagline: "每天都便利",
      openingHours: "全天营业",
      address: "胡志明市新兴坊81号路32A",
      seoTitle: "美珍便利店",
      seoDescription: "美珍便利店在线订购",
    },
    "zh-Hant": {
      name: "美珍便利店",
      tagline: "每天都便利",
      openingHours: "全天營業",
      address: "胡志明市新興坊81號路32A",
      seoTitle: "美珍便利店",
      seoDescription: "美珍便利店線上訂購",
    },
  },
};

const image = (file) => `/images/order-multi/${file}`;
const placeholder = image("product-placeholder.jpg");
const storeAvatar = image("store-avatar.jpg");

export const initialCategories = [
  {
    slug: "social",
    name: "Lưu ảnh ➕ Thêm bạn",
    products: [
      ["wechat", "WeChat", null, 1, "/images/wechat.jpg"],
      ["zalo", "Zalo", null, 1, "/images/zalo.jpg"],
      ["whatsapp", "WhatsApp", null, 1, "/images/whatapp.jpg"],
    ],
  },
  {
    slug: "services",
    name: "SIM điện thoại Việt Nam",
    products: [
      ["sim", "SIM điện thoại Việt Nam", "6GB dữ liệu mỗi ngày, phí duy trì 60.000₫/tháng, gọi điện và nhắn tin bình thường, không cần đăng ký chính chủ", 250000, image("product-05.jpeg")],
      ["usb", "USB ADATA 64GB", null, 420000, image("product-04.jpeg")],
      ["airport", "Xe thương gia đón sân bay", "Xe mới, bao gồm tài xế và nhiên liệu", 2000000, image("product-03.jpeg")],
    ],
  },
  {
    slug: "betel",
    name: "Cau ăn",
    products: [
      ["cards", "Bộ bài tây Double K ♠️", null, 20000, image("product-06.jpg")],
      ["hecheng-50", "Cau Hòa Thành Thiên Hạ 50 tệ", null, 230000, image("product-08.webp")],
      ["hecheng-100", "Cau Hòa Thành Thiên Hạ 100 tệ", null, 450000, image("product-07.jpg")],
      ["hecheng-200", "Cau Hòa Thành Thiên Hạ 200 tệ", null, 780000, placeholder],
      ["zhangxinfa", "Cau Trương Tân Phát 50 tệ", null, 210000, placeholder],
      ["goji", "Cau kỷ tử 50 tệ", null, 230000, placeholder],
    ],
  },
  {
    slug: "cigarettes",
    name: "Thuốc lá chính hãng",
    products: [
      ["lotus-hard", "Thuốc lá Hoa Sen (bao cứng)", null, 2200000, storeAvatar],
      ["lotus-soft", "Thuốc lá Hoa Sen (bao mềm)", null, 2400000, storeAvatar],
      ["furongwang", "Thuốc lá Phù Dung Vương (bao cứng)", null, 1400000, storeAvatar],
      ["nanjing", "Thuốc lá Nam Kinh Huyễn Hách Môn", null, 1300000, storeAvatar],
    ],
  },
  {
    slug: "drinks",
    name: "Rượu Trung Quốc · Rượu ngoại · Bia · Trà",
    products: [
      ["wine", "Rượu vang đỏ dùng hằng ngày tại Việt Nam ⭐⭐⭐⭐⭐", null, 680000, storeAvatar],
      ["tsingtao", "Bia Thanh Đảo lon", null, 25000, storeAvatar],
      ["heineken", "Heineken trắng 330ml", null, 22000, storeAvatar],
    ],
  },
  { slug: "braised", name: "Món kho", products: [
    ["beef", "Bò sốt tương gói 300g", null, 260000, storeAvatar],
    ["duck", "Vịt sốt tương nguyên con", null, 350000, storeAvatar],
  ] },
  { slug: "dumplings", name: "Sủi cảo thủ công", products: [
    ["pork-onion", "Sủi cảo thịt heo và hành lá 1kg", null, 160000, storeAvatar],
    ["chive-pork", "Sủi cảo thịt heo và hẹ 1kg", null, 140000, storeAvatar],
  ] },
  { slug: "soft-drinks", name: "Đồ uống · Nước tinh khiết", products: [
    ["lavie", "Nước khoáng La Vie 500ml", null, 7000, storeAvatar],
    ["coke", "Coca-Cola 320ml", null, 15000, storeAvatar],
    ["redbull", "Red Bull Trung Quốc 250ml", null, 32000, storeAvatar],
  ] },
  { slug: "snacks", name: "Đồ ăn vặt Trung Quốc", products: [
    ["lays", "Khoai tây chiên Lay's", null, 25000, storeAvatar],
    ["sunflower", "Hạt hướng dương ChaCha", null, 38000, storeAvatar],
  ] },
  { slug: "noodles", name: "Mì ăn liền · Mì sợi", products: [
    ["noodle", "Mì bò kho Kang Shifu", null, 18000, storeAvatar],
    ["vermicelli", "Miến Long Khẩu", null, 27000, storeAvatar],
  ] },
  { slug: "seasoning", name: "Gia vị · Rau muối · Lương thực và dầu ăn", products: [
    ["soy", "Nước tương nhạt nhãn vàng Haitian 500ml", null, 38000, storeAvatar],
    ["vinegar", "Giấm lâu năm Sơn Tây 420ml", null, 38000, storeAvatar],
  ] },
  { slug: "daily", name: "Đồ dùng sinh hoạt", products: [
    ["knife", "Dao chặt gia dụng Shibazi", null, 650000, storeAvatar],
    ["toothpaste", "Kem đánh răng Crest", null, 79000, storeAvatar],
  ] },
  { slug: "vietnam", name: "Đặc sản Việt Nam", products: [
    ["g7", "Cà phê G7 336g", null, 90000, storeAvatar],
    ["cashew", "Hạt điều lớn Việt Nam 500g", null, 180000, storeAvatar],
  ] },
  { slug: "other", name: "Sản phẩm khác", products: [
    ["jelly", "Thạch Thái Lan", null, 600000, storeAvatar],
    ["durex", "Durex Invisible hộp 3 chiếc", null, 119000, storeAvatar],
  ] },
];
