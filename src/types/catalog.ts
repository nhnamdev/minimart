export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  soldOut?: boolean;
}

export interface Category {
  id: string;
  name: string;
  products: Product[];
}

export type CartQuantities = Record<string, number>;
