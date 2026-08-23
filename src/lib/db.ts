export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  additional_images: string; // JSON string array
  is_active: boolean;
  in_stock: boolean;
  created_at: string;
}
