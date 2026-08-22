export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  additional_images: string; // JSON string array
  created_at: string;
}
