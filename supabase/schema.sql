-- ============================================================
-- AGTURONG — Supabase Database Schema & Seed Data
-- Alaminos City, Pangasinan Food Delivery Application
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. PROFILES (extends auth.users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------
-- 2. CATEGORIES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'Utensils',
  sort_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------
-- 3. RESTAURANTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  cover_image_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_accepting_orders BOOLEAN DEFAULT TRUE NOT NULL,
  rating NUMERIC(2,1) DEFAULT 4.5 NOT NULL,
  review_count INT DEFAULT 0 NOT NULL,
  delivery_fee NUMERIC(8,2) DEFAULT 49.00 NOT NULL,
  estimated_delivery_minutes INT DEFAULT 30 NOT NULL,
  service_area TEXT DEFAULT 'Alaminos City' NOT NULL,
  operating_hours TEXT DEFAULT '8:00 AM - 9:00 PM' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------
-- 4. FOOD ITEMS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.food_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '' NOT NULL,
  price NUMERIC(8,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------
-- 5. DELIVERY ADDRESSES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT DEFAULT 'Home' NOT NULL,
  address_line TEXT NOT NULL,
  barangay TEXT NOT NULL,
  city TEXT DEFAULT 'Alaminos City' NOT NULL,
  province TEXT DEFAULT 'Pangasinan' NOT NULL,
  landmark TEXT,
  contact_number TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------
-- 6. ORDERS
-- ------------------------------------------------------------
CREATE TYPE public.order_status_type AS ENUM (
  'pending',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE RESTRICT NOT NULL,
  delivery_address_id UUID REFERENCES public.delivery_addresses(id) ON DELETE SET NULL,
  status public.order_status_type DEFAULT 'pending' NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(8,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'cod' NOT NULL,
  special_instructions TEXT,
  delivery_address_snapshot TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------
-- 7. ORDER ITEMS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE RESTRICT NOT NULL,
  food_name TEXT NOT NULL,
  food_image_url TEXT,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(8,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Categories & Restaurants & Food Items are viewable by all
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Public read food items" ON public.food_items FOR SELECT USING (true);

-- Profiles: users can select and update their own
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Delivery Addresses: users can manage their own
CREATE POLICY "Users can manage own addresses" ON public.delivery_addresses FOR ALL USING (auth.uid() = user_id);

-- Orders: users can view and insert their own orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: users can view items belonging to their orders
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- ------------------------------------------------------------
-- REALTIME SUBSCRIPTIONS
-- ------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ------------------------------------------------------------
-- AUTO-SYNC NEW AUTH USER TO PROFILES
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Customer'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- SEED DATA (Alaminos City, Pangasinan)
-- ------------------------------------------------------------
INSERT INTO public.categories (id, name, icon, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Filipino Food', 'Utensils', 1),
  ('22222222-2222-2222-2222-222222222222', 'Rice Meals', 'Drumstick', 2),
  ('33333333-3333-3333-3333-333333333333', 'Seafood & Grill', 'Fish', 3),
  ('44444444-4444-4444-4444-444444444444', 'Burgers', 'Sandwich', 4),
  ('55555555-5555-5555-5555-555555555555', 'Desserts', 'IceCream', 5),
  ('66666666-6666-6666-6666-666666666666', 'Drinks', 'CupSoda', 6)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.restaurants (
  id, name, description, address, cover_image_url, is_active, is_accepting_orders,
  rating, review_count, delivery_fee, estimated_delivery_minutes, service_area, operating_hours
) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Alaminos Longganisa Hub & Diner',
  'Home of authentic, garlicky Alaminos longganisa silog and heritage Pangasinan recipes.',
  'Quezon Ave, Poblacion, Alaminos City',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  true, true, 4.9, 248, 39.00, 25, 'Poblacion & nearby barangays', '7:00 AM - 9:00 PM'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Hundred Islands Grill & Seafoods',
  'Fresh seafood harvested daily, signature grilled Dagupan bangus, and buttery garlic prawns.',
  'Lucap Wharf Road, Brgy. Lucap, Alaminos City',
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  true, true, 4.8, 184, 49.00, 35, 'All Alaminos Barangays', '10:00 AM - 10:00 PM'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Ka Inato Chicken Inasal & Sisig',
  'Smoky charcoal-grilled chicken inasal marinated in calamansi, lemongrass, and annatto.',
  'Marcos Ave, Brgy. Palamis, Alaminos City',
  'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80',
  true, true, 4.7, 142, 39.00, 30, 'Palamis, San Jose, Poblacion', '9:00 AM - 9:00 PM'
),
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'Lucap Wharf Cafe & Bakeshop',
  'Specialty coffee, iced caramel macchiato, artisanal pastries, and loaded halo-halo.',
  'Wharf Promenade, Brgy. Lucap, Alaminos City',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
  true, true, 4.9, 96, 45.00, 25, 'Lucap, Poblacion, San Jose', '8:00 AM - 8:00 PM'
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'Pangasinan Delicacies & Kakanin Hub',
  'Traditional freshly cooked Tupig, royal bibingka, puto calasiao, and native hot chocolate.',
  'National Highway, Brgy. Tanaytay, Alaminos City',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  true, true, 4.8, 110, 35.00, 20, 'Tanaytay, Poblacion', '6:00 AM - 7:00 PM'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.food_items (
  id, restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, is_popular, sort_order
) VALUES
(
  uuid_generate_v4(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '22222222-2222-2222-2222-222222222222',
  'Signature Alaminos Longganisa Silog',
  '3 pcs authentic garlicky Alaminos longganisa served with garlic sinangag rice, fried egg, and spiced cane vinegar.',
  155.00,
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
  true, true, true, 1
),
(
  uuid_generate_v4(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Pangasinan Crispy Bagnet with KBL',
  'Ultra-crispy deep-fried pork belly served with Kamatis, Bagoong Monamon, and Lasuna (KBL) relish.',
  240.00,
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  true, true, true, 2
),
(
  uuid_generate_v4(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  'Charcoal-Grilled Boneless Bangus',
  'Plump milkfish stuffed with fresh tomatoes, onions, and ginger, grilled to perfection over charcoal.',
  260.00,
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
  true, true, true, 1
),
(
  uuid_generate_v4(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  'Garlic Butter Prawns Platter',
  'Succulent tiger prawns sautéed in rich garlic butter sauce with toasted garlic bits and spring onions.',
  320.00,
  'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&q=80',
  true, true, true, 2
),
(
  uuid_generate_v4(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '22222222-2222-2222-2222-222222222222',
  'Chicken Inasal Pecho Large Meal',
  'Juicy chicken breast & wing grilled with inasal glaze, served with unlimited chicken oil and garlic rice.',
  185.00,
  'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80',
  true, true, true, 1
),
(
  uuid_generate_v4(),
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '66666666-6666-6666-6666-666666666666',
  'Iced Spanish Latte (16oz)',
  'Espresso brewed with condensed milk and fresh creamy milk over ice. Sweet, smooth, and energizing.',
  135.00,
  'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&q=80',
  true, true, true, 1
),
(
  uuid_generate_v4(),
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '55555555-5555-5555-5555-555555555555',
  'Special Halo-Halo Overload',
  'Finely shaved ice with ube halaya, leche flan, sweetened beans, nata de coco, pinipig, and ube ice cream.',
  145.00,
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80',
  true, true, true, 2
),
(
  uuid_generate_v4(),
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '55555555-5555-5555-5555-555555555555',
  'Alaminos Native Grilled Tupig (6 pcs)',
  'Glutinous rice with fresh grated young coconut and molasses wrapped in banana leaves, char-grilled.',
  120.00,
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
  true, true, true, 1
);
