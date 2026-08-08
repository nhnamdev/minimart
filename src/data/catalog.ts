import type { Category } from "@/types/catalog";

const image = (file: string) => `/images/order-multi/${file}`;

export const categories: Category[] = [
  {
    id: "social",
    name: "保存图片➕好友",
    products: [
      { id: "wechat", categoryId: "social", name: "微信", price: 1, image: image("product-02.jpeg") },
      { id: "zalo", categoryId: "social", name: "Zalo", price: 1, image: image("product-01.jpeg") },
      { id: "whatsapp", categoryId: "social", name: "WhatsApp", price: 1, image: image("product-09.jpeg") },
    ],
  },
  {
    id: "services",
    name: "越南电话卡",
    products: [
      { id: "sim", categoryId: "services", name: "越南电话卡", description: "流量每天6GB 月租6万越南盾 电话短信正常使用，免实名", price: 250000, image: image("product-05.jpeg") },
      { id: "usb", categoryId: "services", name: "ADATA U盘64g", price: 420000, image: image("product-04.jpeg") },
      { id: "airport", categoryId: "services", name: "商务车接机", description: "全新车，包司机包油", price: 2000000, image: image("product-03.jpeg") },
    ],
  },
  {
    id: "betel",
    name: "槟榔",
    products: [
      { id: "cards", categoryId: "betel", name: "双k 扑克♠️", price: 20000, image: image("product-06.jpg") },
      { id: "hecheng-50", categoryId: "betel", name: "和成天下 50元", price: 230000, image: image("product-08.webp") },
      { id: "hecheng-100", categoryId: "betel", name: "和成天下 100元", price: 450000, image: image("product-07.jpg") },
      { id: "hecheng-200", categoryId: "betel", name: "和成天下 200元", price: 780000, image: image("store-avatar.jpg") },
      { id: "zhangxinfa", categoryId: "betel", name: "张新发 50元", price: 210000, image: image("store-avatar.jpg") },
      { id: "goji", categoryId: "betel", name: "枸杞槟榔 50元", price: 230000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "cigarettes",
    name: "保真香烟",
    products: [
      { id: "lotus-hard", categoryId: "cigarettes", name: "荷花（硬）", price: 2200000, image: image("store-avatar.jpg") },
      { id: "lotus-soft", categoryId: "cigarettes", name: "软荷花", price: 2400000, image: image("store-avatar.jpg") },
      { id: "furongwang", categoryId: "cigarettes", name: "芙蓉王（硬）", price: 1400000, image: image("store-avatar.jpg") },
      { id: "nanjing", categoryId: "cigarettes", name: "南京炫赫门", price: 1300000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "drinks",
    name: "中国白酒 洋酒 啤酒 茶叶",
    products: [
      { id: "wine", categoryId: "drinks", name: "越南口粮红酒推荐五🌟", price: 680000, image: image("store-avatar.jpg") },
      { id: "tsingtao", categoryId: "drinks", name: "青岛啤酒（罐装", price: 25000, image: image("store-avatar.jpg") },
      { id: "heineken", categoryId: "drinks", name: "Heineken 白 330ml", price: 22000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "braised",
    name: "卤味",
    products: [
      { id: "beef", categoryId: "braised", name: "酱牛肉 300g包", price: 260000, image: image("store-avatar.jpg") },
      { id: "duck", categoryId: "braised", name: "酱板鸭 1只", price: 350000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "dumplings",
    name: "纯手工水饺",
    products: [
      { id: "pork-onion", categoryId: "dumplings", name: "猪肉大葱 1kg", price: 160000, image: image("store-avatar.jpg") },
      { id: "chive-pork", categoryId: "dumplings", name: "韭菜猪肉 1kg", price: 140000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "soft-drinks",
    name: "饮料 纯净水",
    products: [
      { id: "lavie", categoryId: "soft-drinks", name: "lavie500ml矿泉水", price: 7000, image: image("store-avatar.jpg") },
      { id: "coke", categoryId: "soft-drinks", name: "可口可乐 320ml", price: 15000, image: image("store-avatar.jpg") },
      { id: "redbull", categoryId: "soft-drinks", name: "中国红牛250mL", price: 32000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "snacks",
    name: "中国零食",
    products: [
      { id: "lays", categoryId: "snacks", name: "乐事薯片", price: 25000, image: image("store-avatar.jpg") },
      { id: "sunflower", categoryId: "snacks", name: "洽洽香瓜子", price: 38000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "noodles",
    name: "方便面 面条",
    products: [
      { id: "noodle", categoryId: "noodles", name: "康师傅红烧牛肉面", price: 18000, image: image("store-avatar.jpg") },
      { id: "vermicelli", categoryId: "noodles", name: "龙口粉丝", price: 27000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "seasoning",
    name: "调料 榨菜 粮油",
    products: [
      { id: "soy", categoryId: "seasoning", name: "海天金标生抽500ml", price: 38000, image: image("store-avatar.jpg") },
      { id: "vinegar", categoryId: "seasoning", name: "山西陈醋 420ml", price: 38000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "daily",
    name: "生活用品",
    products: [
      { id: "knife", categoryId: "daily", name: "十八子作家用斩切刀", price: 650000, image: image("store-avatar.jpg") },
      { id: "toothpaste", categoryId: "daily", name: "佳洁士牙膏", price: 79000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "vietnam",
    name: "越南特产",
    products: [
      { id: "g7", categoryId: "vietnam", name: "G7咖啡336g", price: 90000, image: image("store-avatar.jpg") },
      { id: "cashew", categoryId: "vietnam", name: "越南大腰果500g", price: 180000, image: image("store-avatar.jpg") },
    ],
  },
  {
    id: "other",
    name: "lo wo o",
    products: [
      { id: "jelly", categoryId: "other", name: "泰国果冻", price: 600000, image: image("store-avatar.jpg") },
      { id: "durex", categoryId: "other", name: "durex invisible3只", price: 119000, image: image("store-avatar.jpg") },
    ],
  },
];

export const products = categories.flatMap((category) => category.products);

export function formatVnd(value: number) {
  return `₫${new Intl.NumberFormat("en-US").format(value)}`;
}
