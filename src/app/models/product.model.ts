export type ProductStatus = 'active' | 'inactive' | 'draft';
export type ProductCategory = 'electronics' | 'clothing' | 'food' | 'books' | 'other';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  status: ProductStatus;
  createdAt: string;
}
