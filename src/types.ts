export interface Product {
  id: number;
  name: string;
  variety: string;
  description: string;
  price: number;
  stock: number;
  available: number;
  image_url: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedWeight: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  address: string;
  phone: string;
  total: number;
  delivery_charge: number;
  promo_code?: string;
  status: string;
  created_at: string;
  items: string;
  tracking_id?: string;
  estimated_delivery?: string;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  code: string;
  discount_percent: number;
  active: number;
  image_url: string;
}

export interface Testimonial {
  id: number;
  name: string;
  rating: number;
  review: string;
  date: string;
}

export interface ProductReview {
  id: number;
  product_id: number | string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}
