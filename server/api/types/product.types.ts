export interface ProductResponse {
  id: string;
  barcode: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  category: string;
  subcategory: string;
  brand: string | null | undefined;
  rating: number;
  reviewCount: number;
  specifications: Record<string, any> | null;
  imageUrl: string;
  unit: string;
  isRecommended: boolean;
  salesCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
