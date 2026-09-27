export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  location?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

export type UnitType = 'kg' | 'crate' | 'bundle' | 'box' | 'bag' | 'litre' | 'piece' | 'tonne';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  product_count?: number;
}

export interface Product {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_location: string;
  category_id: string;
  category_name: string;
  title: string;
  description: string;
  price: number;
  unit: UnitType;
  stock_quantity: number;
  location: string;
  image_url: string;
  images: string[];
  is_available: boolean;
  is_organic: boolean;
  harvest_date: string;
  rating: number;
  reviews_count: number;
  is_favorited?: boolean;
  created_at: string;
  updated_at: string;
  seller?: {
    id: string;
    name: string;
    location?: string;
    bio?: string;
    avatar_url?: string;
    created_at: string;
  } | null;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  image_url: string;
  unit_price: number;
  unit: UnitType;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  seller_id: string;
  seller_name: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  phone: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  buyer_id: string;
  buyer_name: string;
  seller_id: string;
  seller_name: string;
  product_id?: string;
  product_title?: string;
  last_message: string;
  last_message_at: string;
  unread_by: string[];
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  text: string;
  created_at: string;
}

export interface DashboardStats {
  role: 'buyer' | 'seller';
  stats: {
    totalProducts?: number;
    activeListings?: number;
    totalOrders?: number;
    pendingOrders?: number;
    completedOrders?: number;
    totalSales?: number;
    favoriteProducts?: number;
  };
  recentOrders: Order[];
}
