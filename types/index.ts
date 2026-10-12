// ============================================================
// AGTURONG — Type Definitions
// ============================================================

// --- Database Models ---

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  cover_image_url: string | null;
  logo_url: string | null;
  is_active: boolean;
  is_accepting_orders: boolean;
  rating: number;
  review_count: number;
  delivery_fee: number;
  estimated_delivery_minutes: number;
  service_area: string;
  operating_hours: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface FoodItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined
  restaurant?: Restaurant;
  category?: Category;
}

export interface DeliveryAddress {
  id: string;
  user_id: string;
  label: string;
  address_line: string;
  barangay: string;
  city: string;
  province: string;
  landmark: string | null;
  contact_number: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  delivery_address_id: string | null;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: 'cod';
  special_instructions: string | null;
  delivery_address_snapshot: string;
  contact_number: string;
  created_at: string;
  updated_at: string;
  // Joined
  restaurant?: Restaurant;
  delivery_address?: DeliveryAddress;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  food_item_id: string;
  food_name: string;
  food_image_url: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_instructions: string | null;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

// --- Cart ---

export interface CartItem {
  food_item_id: string;
  restaurant_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  restaurant_name: string;
  special_instructions?: string;
}

// --- User Profile ---

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// --- App State ---

export interface AppState {
  isOnline: boolean;
  selectedAddress: DeliveryAddress | null;
}
