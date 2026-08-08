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

export interface AdminData {
  languages: LanguageCode[];
  site: AdminSite;
  categories: AdminCategory[];
  products: AdminProduct[];
}
