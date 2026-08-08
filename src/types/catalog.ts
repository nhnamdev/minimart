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
}
