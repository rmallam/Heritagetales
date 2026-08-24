export interface Variant {
  name: string;
  price: number;
  in_stock: boolean;
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
  in_stock: boolean;
  created_at: string;
}
