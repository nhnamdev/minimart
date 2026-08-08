import type { Category } from "@/types/catalog";

const image = (file: string) => `/images/order-multi/${file}`;
const placeholder = image("product-placeholder.jpg");

export const categories: Category[] = [
  {
    id: "social",
    name: "Lưu ảnh ➕ Thêm bạn",
    products: [
      { id: "wechat", categoryId: "social", name: "WeChat", price: 1, image: "/images/wechat.jpg" },
      { id: "zalo", categoryId: "social", name: "Zalo", price: 1, image: "/images/zalo.jpg" },
      { id: "whatsapp", categoryId: "social", name: "WhatsApp", price: 1, image: "/images/whatapp.jpg" },
    ],
  },
  {
    id: "services",
    name: "SIM điện thoại Việt Nam",
    products: [
      { id: "sim", categoryId: "services", name: "SIM điện thoại Việt Nam", description: "6GB dữ liệu mỗi ngày, phí duy trì 60.000₫/tháng, gọi điện và nhắn tin bình thường, không cần đăng ký chính chủ", price: 250000, image: image("product-05.jpeg") },
      { id: "usb", categoryId: "services", name: "USB ADATA 64GB", price: 420000, image: image("product-04.jpeg") },
      { id: "airport", categoryId: "services", name: "Xe thương gia đón sân bay", description: "Xe mới, bao gồm tài xế và nhiên liệu", price: 2000000, image: image("product-03.jpeg") },
    ],
  },
  {
    id: "betel",
    name: "Cau ăn",
    products: [
      { id: "cards", categoryId: "betel", name: "Bộ bài tây Double K ♠️", price: 20000, image: image("product-06.jpg") },
      { id: "hecheng-50", categoryId: "betel", name: "Cau Hòa Thành Thiên Hạ 50 tệ", price: 230000, image: image("product-08.webp") },
      { id: "hecheng-100", categoryId: "betel", name: "Cau Hòa Thành Thiên Hạ 100 tệ", price: 450000, image: image("product-07.jpg") },
      { id: "hecheng-200", categoryId: "betel", name: "Cau Hòa Thành Thiên Hạ 200 tệ", price: 780000, image: placeholder },
      { id: "zhangxinfa", categoryId: "betel", name: "Cau Trương Tân Phát 50 tệ", price: 210000, image: placeholder },
      { id: "goji", categoryId: "betel", name: "Cau kỷ tử 50 tệ", price: 230000, image: placeholder },
    ],
  },
  {
    id: "cigarettes",
    name: "Thuốc lá chính hãng",
    products: [
      { id: "lotus-hard", categoryId: "cigarettes", name: "Thuốc lá Hoa Sen (bao cứng)", price: 2200000, image: image("store-avatar.jpg") },
      { id: "lotus-soft", categoryId: "cigarettes", name: "Thuốc lá Hoa Sen (bao mềm)", price: 2400000, image: image("store-avatar.jpg") },
      { id: "furongwang", categoryId: "cigarettes", name: "Thuốc lá Phù Dung Vương (bao cứng)", price: 1400000, image: image("store-avatar.jpg") },
      { id: "nanjing", categoryId: "cigarettes", name: "Thuốc lá Nam Kinh Huyễn Hách Môn", price: 1300000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "drinks",
    name: "Rượu Trung Quốc · Rượu ngoại · Bia · Trà",
    products: [
      { id: "wine", categoryId: "drinks", name: "Rượu vang đỏ dùng hằng ngày tại Việt Nam ⭐⭐⭐⭐⭐", price: 680000, image: image("store-avatar.jpg") },
      { id: "tsingtao", categoryId: "drinks", name: "Bia Thanh Đảo lon", price: 25000, image: image("store-avatar.jpg") },
      { id: "heineken", categoryId: "drinks", name: "Heineken trắng 330ml", price: 22000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "braised",
    name: "Món kho",
    products: [
      { id: "beef", categoryId: "braised", name: "Bò sốt tương gói 300g", price: 260000, image: image("store-avatar.jpg") },
      { id: "duck", categoryId: "braised", name: "Vịt sốt tương nguyên con", price: 350000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "dumplings",
    name: "Sủi cảo thủ công",
    products: [
      { id: "pork-onion", categoryId: "dumplings", name: "Sủi cảo thịt heo và hành lá 1kg", price: 160000, image: image("store-avatar.jpg") },
      { id: "chive-pork", categoryId: "dumplings", name: "Sủi cảo thịt heo và hẹ 1kg", price: 140000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "soft-drinks",
    name: "Đồ uống · Nước tinh khiết",
    products: [
      { id: "lavie", categoryId: "soft-drinks", name: "Nước khoáng La Vie 500ml", price: 7000, image: image("store-avatar.jpg") },
      { id: "coke", categoryId: "soft-drinks", name: "Coca-Cola 320ml", price: 15000, image: image("store-avatar.jpg") },
      { id: "redbull", categoryId: "soft-drinks", name: "Red Bull Trung Quốc 250ml", price: 32000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "snacks",
    name: "Đồ ăn vặt Trung Quốc",
    products: [
      { id: "lays", categoryId: "snacks", name: "Khoai tây chiên Lay's", price: 25000, image: image("store-avatar.jpg") },
      { id: "sunflower", categoryId: "snacks", name: "Hạt hướng dương ChaCha", price: 38000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "noodles",
    name: "Mì ăn liền · Mì sợi",
    products: [
      { id: "noodle", categoryId: "noodles", name: "Mì bò kho Kang Shifu", price: 18000, image: image("store-avatar.jpg") },
      { id: "vermicelli", categoryId: "noodles", name: "Miến Long Khẩu", price: 27000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "seasoning",
    name: "Gia vị · Rau muối · Lương thực và dầu ăn",
    products: [
      { id: "soy", categoryId: "seasoning", name: "Nước tương nhạt nhãn vàng Haitian 500ml", price: 38000, image: image("store-avatar.jpg") },
      { id: "vinegar", categoryId: "seasoning", name: "Giấm lâu năm Sơn Tây 420ml", price: 38000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "daily",
    name: "Đồ dùng sinh hoạt",
    products: [
      { id: "knife", categoryId: "daily", name: "Dao chặt gia dụng Shibazi", price: 650000, image: image("store-avatar.jpg") },
      { id: "toothpaste", categoryId: "daily", name: "Kem đánh răng Crest", price: 79000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "vietnam",
    name: "Đặc sản Việt Nam",
    products: [
      { id: "g7", categoryId: "vietnam", name: "Cà phê G7 336g", price: 90000, image: image("store-avatar.jpg") },
      { id: "cashew", categoryId: "vietnam", name: "Hạt điều lớn Việt Nam 500g", price: 180000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "other",
    name: "Sản phẩm khác",
    products: [
      { id: "jelly", categoryId: "other", name: "Thạch Thái Lan", price: 600000, image: image("store-avatar.jpg") },
      { id: "durex", categoryId: "other", name: "Durex Invisible hộp 3 chiếc", price: 119000, image: image("store-avatar.jpg") },
    ],
  },
];

export const products = categories.flatMap((category) => category.products);

export function formatVnd(value: number) {
  return `₫${new Intl.NumberFormat("vi-VN").format(value)}`;
}
