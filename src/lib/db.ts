export interface Variant {
  name: string;
  price: number;
  stock_count: number;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  additional_images: string; // JSON string array
  variants: Variant[];
  is_active: boolean;
  stock_count: number;
  created_at: string;
}
