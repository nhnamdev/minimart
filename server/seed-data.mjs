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

export const catalogTranslations = {
  categories: {
    social: {
      en: "Save Photos ➕ Add Friends",
      "zh-Hans": "保存图片 ➕ 添加好友",
      "zh-Hant": "儲存圖片 ➕ 新增好友",
    },
    services: {
      en: "Vietnam Mobile SIM Cards",
      "zh-Hans": "越南手机SIM卡",
      "zh-Hant": "越南手機SIM卡",
    },
    betel: { en: "Betel Nut", "zh-Hans": "槟榔", "zh-Hant": "檳榔" },
    cigarettes: { en: "Genuine Cigarettes", "zh-Hans": "正品香烟", "zh-Hant": "正品香菸" },
    drinks: {
      en: "Chinese Liquor · Imported Wine · Beer · Tea",
      "zh-Hans": "中国白酒 · 洋酒 · 啤酒 · 茶",
      "zh-Hant": "中國白酒 · 洋酒 · 啤酒 · 茶",
    },
    braised: { en: "Braised Dishes", "zh-Hans": "卤味", "zh-Hant": "滷味" },
    dumplings: { en: "Handmade Dumplings", "zh-Hans": "手工水饺", "zh-Hant": "手工水餃" },
    "soft-drinks": {
      en: "Beverages · Purified Water",
      "zh-Hans": "饮料 · 纯净水",
      "zh-Hant": "飲料 · 純淨水",
    },
    snacks: { en: "Chinese Snacks", "zh-Hans": "中国零食", "zh-Hant": "中國零食" },
    noodles: {
      en: "Instant Noodles · Noodles",
      "zh-Hans": "方便面 · 面条",
      "zh-Hant": "泡麵 · 麵條",
    },
    seasoning: {
      en: "Seasonings · Pickled Vegetables · Staples & Cooking Oil",
      "zh-Hans": "调味料 · 腌菜 · 粮油",
      "zh-Hant": "調味料 · 醃菜 · 糧油",
    },
    daily: { en: "Household Essentials", "zh-Hans": "生活用品", "zh-Hant": "生活用品" },
    vietnam: { en: "Vietnamese Specialties", "zh-Hans": "越南特产", "zh-Hant": "越南特產" },
    other: { en: "Other Products", "zh-Hans": "其他商品", "zh-Hant": "其他商品" },
  },
  products: {
    wechat: {
      en: { name: "WeChat", description: null },
      "zh-Hans": { name: "微信", description: null },
      "zh-Hant": { name: "微信", description: null },
    },
    zalo: {
      en: { name: "Zalo", description: null },
      "zh-Hans": { name: "Zalo", description: null },
      "zh-Hant": { name: "Zalo", description: null },
    },
    whatsapp: {
      en: { name: "WhatsApp", description: null },
      "zh-Hans": { name: "WhatsApp", description: null },
      "zh-Hant": { name: "WhatsApp", description: null },
    },
    sim: {
      en: {
        name: "Vietnam Mobile SIM Card",
        description: "6GB of data per day, VND 60,000 monthly fee, regular calls and texts, no real-name registration required",
      },
      "zh-Hans": {
        name: "越南手机SIM卡",
        description: "每天6GB流量，月费60,000越南盾，可正常通话和收发短信，无需实名登记",
      },
      "zh-Hant": {
        name: "越南手機SIM卡",
        description: "每天6GB流量，月費60,000越南盾，可正常通話和收發簡訊，無需實名登記",
      },
    },
    usb: {
      en: { name: "ADATA 64GB USB Flash Drive", description: null },
      "zh-Hans": { name: "ADATA 64GB U盘", description: null },
      "zh-Hant": { name: "ADATA 64GB 隨身碟", description: null },
    },
    airport: {
      en: { name: "Premium Airport Pickup Car", description: "New vehicle, driver and fuel included" },
      "zh-Hans": { name: "商务车机场接送", description: "新车，含司机和燃油" },
      "zh-Hant": { name: "商務車機場接送", description: "新車，含司機和燃油" },
    },
    cards: {
      en: { name: "Double K Playing Cards ♠️", description: null },
      "zh-Hans": { name: "Double K 扑克牌 ♠️", description: null },
      "zh-Hant": { name: "Double K 撲克牌 ♠️", description: null },
    },
    "hecheng-50": {
      en: { name: "Hecheng Tianxia Betel Nut 50 RMB", description: null },
      "zh-Hans": { name: "和成天下槟榔 50元", description: null },
      "zh-Hant": { name: "和成天下檳榔 50元", description: null },
    },
    "hecheng-100": {
      en: { name: "Hecheng Tianxia Betel Nut 100 RMB", description: null },
      "zh-Hans": { name: "和成天下槟榔 100元", description: null },
      "zh-Hant": { name: "和成天下檳榔 100元", description: null },
    },
    "hecheng-200": {
      en: { name: "Hecheng Tianxia Betel Nut 200 RMB", description: null },
      "zh-Hans": { name: "和成天下槟榔 200元", description: null },
      "zh-Hant": { name: "和成天下檳榔 200元", description: null },
    },
    zhangxinfa: {
      en: { name: "Zhang Xin Fa Betel Nut 50 RMB", description: null },
      "zh-Hans": { name: "张新发槟榔 50元", description: null },
      "zh-Hant": { name: "張新發檳榔 50元", description: null },
    },
    goji: {
      en: { name: "Goji Betel Nut 50 RMB", description: null },
      "zh-Hans": { name: "枸杞槟榔 50元", description: null },
      "zh-Hant": { name: "枸杞檳榔 50元", description: null },
    },
    "lotus-hard": {
      en: { name: "Lotus Cigarettes (Hard Pack)", description: null },
      "zh-Hans": { name: "荷花香烟（硬盒）", description: null },
      "zh-Hant": { name: "荷花香菸（硬盒）", description: null },
    },
    "lotus-soft": {
      en: { name: "Lotus Cigarettes (Soft Pack)", description: null },
      "zh-Hans": { name: "荷花香烟（软包）", description: null },
      "zh-Hant": { name: "荷花香菸（軟包）", description: null },
    },
    furongwang: {
      en: { name: "Furongwang Cigarettes (Hard Pack)", description: null },
      "zh-Hans": { name: "芙蓉王香烟（硬盒）", description: null },
      "zh-Hant": { name: "芙蓉王香菸（硬盒）", description: null },
    },
    nanjing: {
      en: { name: "Nanjing Xuanhemen Cigarettes", description: null },
      "zh-Hans": { name: "南京炫赫门香烟", description: null },
      "zh-Hant": { name: "南京炫赫門香菸", description: null },
    },
    wine: {
      en: { name: "Everyday Red Wine in Vietnam ⭐⭐⭐⭐⭐", description: null },
      "zh-Hans": { name: "越南日常饮用红酒 ⭐⭐⭐⭐⭐", description: null },
      "zh-Hant": { name: "越南日常飲用紅酒 ⭐⭐⭐⭐⭐", description: null },
    },
    tsingtao: {
      en: { name: "Tsingtao Beer Can", description: null },
      "zh-Hans": { name: "青岛啤酒（罐装）", description: null },
      "zh-Hant": { name: "青島啤酒（罐裝）", description: null },
    },
    heineken: {
      en: { name: "Heineken Silver 330ml", description: null },
      "zh-Hans": { name: "喜力银星 330毫升", description: null },
      "zh-Hant": { name: "喜力銀星 330毫升", description: null },
    },
    beef: {
      en: { name: "Braised Beef in Soy Sauce 300g Pack", description: null },
      "zh-Hans": { name: "酱牛肉 300克装", description: null },
      "zh-Hant": { name: "醬牛肉 300克裝", description: null },
    },
    duck: {
      en: { name: "Whole Braised Duck in Soy Sauce", description: null },
      "zh-Hans": { name: "整只酱鸭", description: null },
      "zh-Hant": { name: "整隻醬鴨", description: null },
    },
    "pork-onion": {
      en: { name: "Pork and Scallion Dumplings 1kg", description: null },
      "zh-Hans": { name: "猪肉大葱水饺 1公斤", description: null },
      "zh-Hant": { name: "豬肉青蔥水餃 1公斤", description: null },
    },
    "chive-pork": {
      en: { name: "Pork and Chive Dumplings 1kg", description: null },
      "zh-Hans": { name: "猪肉韭菜水饺 1公斤", description: null },
      "zh-Hant": { name: "豬肉韭菜水餃 1公斤", description: null },
    },
    lavie: {
      en: { name: "La Vie Mineral Water 500ml", description: null },
      "zh-Hans": { name: "La Vie 矿泉水 500毫升", description: null },
      "zh-Hant": { name: "La Vie 礦泉水 500毫升", description: null },
    },
    coke: {
      en: { name: "Coca-Cola 320ml", description: null },
      "zh-Hans": { name: "可口可乐 320毫升", description: null },
      "zh-Hant": { name: "可口可樂 320毫升", description: null },
    },
    redbull: {
      en: { name: "Chinese Red Bull 250ml", description: null },
      "zh-Hans": { name: "中国红牛 250毫升", description: null },
      "zh-Hant": { name: "中國紅牛 250毫升", description: null },
    },
    lays: {
      en: { name: "Lay's Potato Chips", description: null },
      "zh-Hans": { name: "乐事薯片", description: null },
      "zh-Hant": { name: "樂事洋芋片", description: null },
    },
    sunflower: {
      en: { name: "ChaCha Sunflower Seeds", description: null },
      "zh-Hans": { name: "洽洽香瓜子", description: null },
      "zh-Hant": { name: "洽洽香瓜子", description: null },
    },
    noodle: {
      en: { name: "Master Kong Braised Beef Noodles", description: null },
      "zh-Hans": { name: "康师傅红烧牛肉面", description: null },
      "zh-Hant": { name: "康師傅紅燒牛肉麵", description: null },
    },
    vermicelli: {
      en: { name: "Longkou Vermicelli", description: null },
      "zh-Hans": { name: "龙口粉丝", description: null },
      "zh-Hant": { name: "龍口粉絲", description: null },
    },
    soy: {
      en: { name: "Haitian Gold Label Light Soy Sauce 500ml", description: null },
      "zh-Hans": { name: "海天金标生抽 500毫升", description: null },
      "zh-Hant": { name: "海天金標生抽 500毫升", description: null },
    },
    vinegar: {
      en: { name: "Shanxi Mature Vinegar 420ml", description: null },
      "zh-Hans": { name: "山西老陈醋 420毫升", description: null },
      "zh-Hant": { name: "山西老陳醋 420毫升", description: null },
    },
    knife: {
      en: { name: "Shibazi Household Cleaver", description: null },
      "zh-Hans": { name: "十八子作家用砍骨刀", description: null },
      "zh-Hant": { name: "十八子作家用砍骨刀", description: null },
    },
    toothpaste: {
      en: { name: "Crest Toothpaste", description: null },
      "zh-Hans": { name: "佳洁士牙膏", description: null },
      "zh-Hant": { name: "佳潔士牙膏", description: null },
    },
    g7: {
      en: { name: "G7 Coffee 336g", description: null },
      "zh-Hans": { name: "G7 咖啡 336克", description: null },
      "zh-Hant": { name: "G7 咖啡 336克", description: null },
    },
    cashew: {
      en: { name: "Large Vietnamese Cashews 500g", description: null },
      "zh-Hans": { name: "越南大颗腰果 500克", description: null },
      "zh-Hant": { name: "越南大顆腰果 500克", description: null },
    },
    jelly: {
      en: { name: "Thai Jelly", description: null },
      "zh-Hans": { name: "泰国果冻", description: null },
      "zh-Hant": { name: "泰國果凍", description: null },
    },
    durex: {
      en: { name: "Durex Invisible 3-Pack", description: null },
      "zh-Hans": { name: "杜蕾斯隐形装 3只", description: null },
      "zh-Hant": { name: "杜蕾斯隱形裝 3入", description: null },
    },
  },
};

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
