import type { LanguageCode } from "@/types/catalog";

export interface AdminTranslation {
  name: string;
  description?: string;
  tagline?: string;
  openingHours?: string;
  address?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export type AdminTranslations = Partial<Record<LanguageCode, AdminTranslation>>;

export interface AdminSite {
  id: string;
  phone: string;
  currencyCode: string;
  timezone: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  translations: AdminTranslations;
}

export interface AdminCategory {
  id: string;
  slug: string;
  sortOrder: number;
  active: boolean;
  translations: AdminTranslations;
}

export interface AdminProduct {
  id: string;
  categoryId: string;
  slug: string;
  sku: string;
  price: number;
  imageUrl: string | null;
  soldOut: boolean;
  active: boolean;
  sortOrder: number;
  translations: AdminTranslations;
}

export type FulfillmentMode = "delivery" | "pickup";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";

export interface AdminOrderItem {
  id: string;
  productId: string | null;
  productName: string;
  productImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface AdminOrder {
  id: string;
  orderCode: string;
  languageCode: LanguageCode;
  fulfillmentMode: FulfillmentMode;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string | null;
  customerNote: string | null;
  currencyCode: string;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminData {
  languages: LanguageCode[];
  site: AdminSite;
  categories: AdminCategory[];
  products: AdminProduct[];
}
