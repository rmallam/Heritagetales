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
  tags: string[];
  is_active: boolean;
  stock_count: number;
  created_at: string;
}

export interface DiscountRule {
  id: number;
  tag: string;
  discount_percentage: number;
  is_active: boolean;
}

export interface Wishlist {
  id: number;
  user_id: string;
  item_id: number;
  created_at: string;
}

export interface Review {
  id: number;
  item_id: number;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}
