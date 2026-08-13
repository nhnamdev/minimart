export interface Product {
  id: string;
  categoryId: string;
  slug?: string;
  sku?: string | null;
  name: string;
  description?: string;
  price: number;
  image: string;
  soldOut?: boolean;
}

export interface Category {
  id: string;
  slug?: string;
  name: string;
  products: Product[];
}

export type CartQuantities = Record<string, number>;

export type LanguageCode = "vi" | "en" | "zh-Hans" | "zh-Hant";

export interface SiteContent {
  id: string;
  name: string;
  tagline: string | null;
  openingHours: string | null;
  address: string | null;
  phone: string;
  currencyCode: string;
  timezone: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  deliveryImageUrl: string | null;
  pickupImageUrl: string | null;
  productPlaceholderUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface StorefrontData {
  language: LanguageCode;
  site: SiteContent;
  categories: Category[];
}

export interface CheckoutDetails {
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  note?: string;
  discountCode?: string;
}

export interface SavedOrderReference {
  orderCode: string;
  customerPhone: string;
}

export interface CustomerOrderItem {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CustomerOrder {
  orderCode: string;
  fulfillmentMode: "delivery" | "pickup";
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  total: number;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
  items: CustomerOrderItem[];
}
