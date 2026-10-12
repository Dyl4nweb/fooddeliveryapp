// ============================================================
// AGTURONG — Data Hooks (Supabase queries with caching & fallback)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Restaurant, FoodItem, Category, Order, DeliveryAddress } from '../types';
import {
  MOCK_CATEGORIES,
  MOCK_RESTAURANTS,
  MOCK_FOOD_ITEMS,
  MOCK_DEFAULT_ADDRESS,
} from '../lib/mockData';

// Cache keys
const CACHE_RESTAURANTS = '@agturong_cache_restaurants';
const CACHE_CATEGORIES = '@agturong_cache_categories';
const CACHE_FOOD_ITEMS = '@agturong_cache_food_items';
const CACHE_ORDERS = '@agturong_cache_orders';
const CACHE_ADDRESSES = '@agturong_cache_addresses';

// ----------- Generic cache helpers -----------

async function getCached<T>(key: string): Promise<T | null> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T;
  } catch {}
  return null;
}

async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

// ----------- useRestaurants -----------

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cached = await getCached<Restaurant[]>(CACHE_RESTAURANTS);
      if (cached && cached.length > 0) {
        setRestaurants(cached);
      }

      const { data, error: err } = await supabase
        .from('restaurants')
        .select('*')
        .order('name');

      if (err) throw err;
      if (data && data.length > 0) {
        setRestaurants(data as Restaurant[]);
        await setCache(CACHE_RESTAURANTS, data);
      }
    } catch (e: any) {
      // Graceful fallback to mock data
      setRestaurants(MOCK_RESTAURANTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { restaurants, loading, error, refetch: fetch };
}

// ----------- useRestaurant (single) -----------

export function useRestaurant(id: string) {
  const defaultRest = MOCK_RESTAURANTS.find((r) => r.id === id) || MOCK_RESTAURANTS[0];
  const defaultItems = MOCK_FOOD_ITEMS.filter((f) => f.restaurant_id === defaultRest?.id);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(defaultRest || null);
  const [menuItems, setMenuItems] = useState<FoodItem[]>(defaultItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [restResult, menuResult] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', id).single(),
        supabase
          .from('food_items')
          .select('*, category:categories(*)')
          .eq('restaurant_id', id)
          .order('sort_order'),
      ]);

      if (restResult.error) throw restResult.error;
      if (menuResult.error) throw menuResult.error;

      if (restResult.data) {
        setRestaurant(restResult.data as Restaurant);
      }
      if (menuResult.data) {
        setMenuItems(menuResult.data as FoodItem[]);
      }
    } catch (e: any) {
      // Fallback to mock item
      const mock = MOCK_RESTAURANTS.find((r) => r.id === id) || MOCK_RESTAURANTS[0];
      setRestaurant(mock);
      const items = MOCK_FOOD_ITEMS.filter((f) => f.restaurant_id === mock.id).map(
        (f) => ({
          ...f,
          category: MOCK_CATEGORIES.find((c) => c.id === f.category_id),
        })
      );
      setMenuItems(items);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { restaurant, menuItems, loading, error, refetch: fetch };
}

// ----------- useCategories -----------

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cached = await getCached<Category[]>(CACHE_CATEGORIES);
      if (cached && cached.length > 0) setCategories(cached);

      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');

      if (err) throw err;
      if (data && data.length > 0) {
        setCategories(data as Category[]);
        await setCache(CACHE_CATEGORIES, data);
      }
    } catch (e: any) {
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { categories, loading, error, refetch: fetch };
}

// ----------- useFoodItems -----------

export function useFoodItems(params?: {
  categoryId?: string;
  restaurantId?: string;
  featured?: boolean;
  popular?: boolean;
  search?: string;
}) {
  const getInitialFiltered = () => {
    let result = [...MOCK_FOOD_ITEMS];
    if (params?.categoryId) result = result.filter((i) => i.category_id === params.categoryId);
    if (params?.restaurantId) result = result.filter((i) => i.restaurant_id === params.restaurantId);
    if (params?.featured) result = result.filter((i) => i.is_featured);
    if (params?.popular) result = result.filter((i) => i.is_popular);
    return result.map((item) => ({
      ...item,
      restaurant: MOCK_RESTAURANTS.find((r) => r.id === item.restaurant_id),
      category: MOCK_CATEGORIES.find((c) => c.id === item.category_id),
    }));
  };

  const [items, setItems] = useState<FoodItem[]>(getInitialFiltered);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('food_items')
        .select('*, restaurant:restaurants(*), category:categories(*)')
        .eq('is_available', true);

      if (params?.categoryId) query = query.eq('category_id', params.categoryId);
      if (params?.restaurantId) query = query.eq('restaurant_id', params.restaurantId);
      if (params?.featured) query = query.eq('is_featured', true);
      if (params?.popular) query = query.eq('is_popular', true);
      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }

      query = query.order('sort_order');

      const { data, error: err } = await query;

      if (err) throw err;
      if (data && data.length > 0) {
        setItems(data as FoodItem[]);
      } else {
        setItems(getInitialFiltered());
      }
    } catch (e: any) {
      setItems(getInitialFiltered());
    } finally {
      setLoading(false);
    }
  }, [params?.categoryId, params?.restaurantId, params?.featured, params?.popular, params?.search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { items, loading, error, refetch: fetch };
}

// ----------- useFoodItem (single) -----------

export function useFoodItem(id: string) {
  const mockFood =
    MOCK_FOOD_ITEMS.find((f) => f.id === id) || MOCK_FOOD_ITEMS[0];
  const initialFood = mockFood
    ? {
        ...mockFood,
        restaurant: MOCK_RESTAURANTS.find((r) => r.id === mockFood.restaurant_id),
        category: MOCK_CATEGORIES.find((c) => c.id === mockFood.category_id),
      }
    : null;

  const [item, setItem] = useState<FoodItem | null>(initialFood);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('food_items')
        .select('*, restaurant:restaurants(*), category:categories(*)')
        .eq('id', id)
        .single();

      if (err) throw err;
      if (data) setItem(data as FoodItem);
    } catch (e: any) {
      setItem(initialFood);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { item, loading, error, refetch: fetch };
}

// ----------- useOrders -----------

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Check local cache
      const cached = await getCached<Order[]>(CACHE_ORDERS);
      if (cached) setOrders(cached);

      const { data, error: err } = await supabase
        .from('orders')
        .select('*, restaurant:restaurants(*), items:order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      if (data) {
        setOrders(data as Order[]);
        await setCache(CACHE_ORDERS, data);
      }
    } catch (e: any) {
      // Keep cached if available
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Subscribe to realtime order updates
  useEffect(() => {
    if (!userId) return;

    try {
      const channel = supabase
        .channel('orders-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetch();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {}
  }, [userId, fetch]);

  return { orders, loading, error, refetch: fetch };
}

// ----------- useOrder (single) -----------

export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      // Try local cached orders first
      const cached = await getCached<Order[]>(CACHE_ORDERS);
      const found = cached?.find((o) => o.id === orderId);
      if (found) setOrder(found);

      const { data, error: err } = await supabase
        .from('orders')
        .select('*, restaurant:restaurants(*), items:order_items(*)')
        .eq('id', orderId)
        .single();

      if (err) throw err;
      if (data) setOrder(data as Order);
    } catch (e: any) {
      // If found in cache, stay with that
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { order, loading, error, refetch: fetch };
}

// ----------- useAddresses -----------

export function useAddresses(userId?: string) {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([MOCK_DEFAULT_ADDRESS]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) {
      setAddresses([MOCK_DEFAULT_ADDRESS]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const cached = await getCached<DeliveryAddress[]>(CACHE_ADDRESSES);
      if (cached && cached.length > 0) setAddresses(cached);

      const { data, error: err } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (err) throw err;
      if (data && data.length > 0) {
        setAddresses(data as DeliveryAddress[]);
        await setCache(CACHE_ADDRESSES, data);
      }
    } catch (e: any) {
      // Use cached or default
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { addresses, loading, error, refetch: fetch };
}

// ----------- useSearch -----------

export function useSearch(query: string) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!query || query.length < 2) {
      setRestaurants([]);
      setFoodItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [restResult, foodResult] = await Promise.all([
        supabase
          .from('restaurants')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .eq('is_active', true)
          .limit(10),
        supabase
          .from('food_items')
          .select('*, restaurant:restaurants(*), category:categories(*)')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .eq('is_available', true)
          .limit(20),
      ]);

      if (restResult.data && restResult.data.length > 0) {
        setRestaurants(restResult.data as Restaurant[]);
      } else {
        const q = query.toLowerCase();
        setRestaurants(
          MOCK_RESTAURANTS.filter(
            (r) =>
              r.name.toLowerCase().includes(q) ||
              r.description.toLowerCase().includes(q)
          )
        );
      }

      if (foodResult.data && foodResult.data.length > 0) {
        setFoodItems(foodResult.data as FoodItem[]);
      } else {
        const q = query.toLowerCase();
        const matched = MOCK_FOOD_ITEMS.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q)
        ).map((item) => ({
          ...item,
          restaurant: MOCK_RESTAURANTS.find((r) => r.id === item.restaurant_id),
          category: MOCK_CATEGORIES.find((c) => c.id === item.category_id),
        }));
        setFoodItems(matched);
      }
    } catch (e: any) {
      // Local search fallback
      const q = query.toLowerCase();
      setRestaurants(
        MOCK_RESTAURANTS.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q)
        )
      );
      setFoodItems(
        MOCK_FOOD_ITEMS.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q)
        ).map((item) => ({
          ...item,
          restaurant: MOCK_RESTAURANTS.find((r) => r.id === item.restaurant_id),
          category: MOCK_CATEGORIES.find((c) => c.id === item.category_id),
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return { restaurants, foodItems, loading, error };
}

// ----------- createOrder -----------

export async function createOrder(params: {
  userId: string;
  restaurantId: string;
  items: {
    food_item_id: string;
    food_name: string;
    food_image_url: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
    special_instructions?: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddressId?: string;
  deliveryAddressSnapshot: string;
  contactNumber: string;
  specialInstructions?: string;
}): Promise<{ data: Order | null; error: Error | null }> {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: params.userId,
        restaurant_id: params.restaurantId,
        delivery_address_id: params.deliveryAddressId || null,
        status: 'pending',
        subtotal: params.subtotal,
        delivery_fee: params.deliveryFee,
        total: params.total,
        payment_method: 'cod',
        special_instructions: params.specialInstructions || null,
        delivery_address_snapshot: params.deliveryAddressSnapshot,
        contact_number: params.contactNumber,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = params.items.map((item) => ({
      order_id: order.id,
      food_item_id: item.food_item_id,
      food_name: item.food_name,
      food_image_url: item.food_image_url,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
      special_instructions: item.special_instructions || null,
    }));

    await supabase.from('order_items').insert(orderItems);

    return { data: order as Order, error: null };
  } catch (error) {
    // Save to local cache as demo order
    const localOrder: Order = {
      id: 'demo-' + Date.now().toString(),
      user_id: params.userId,
      restaurant_id: params.restaurantId,
      delivery_address_id: params.deliveryAddressId || null,
      status: 'pending',
      subtotal: params.subtotal,
      delivery_fee: params.deliveryFee,
      total: params.total,
      payment_method: 'cod',
      special_instructions: params.specialInstructions || null,
      delivery_address_snapshot: params.deliveryAddressSnapshot,
      contact_number: params.contactNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      restaurant: MOCK_RESTAURANTS.find((r) => r.id === params.restaurantId),
      items: params.items.map((item, idx) => ({
        id: `local-item-${idx}`,
        order_id: 'demo-local',
        food_item_id: item.food_item_id,
        food_name: item.food_name,
        food_image_url: item.food_image_url,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        special_instructions: item.special_instructions || null,
        created_at: new Date().toISOString(),
      })),
    };

    try {
      const existing = (await getCached<Order[]>(CACHE_ORDERS)) || [];
      await setCache(CACHE_ORDERS, [localOrder, ...existing]);
    } catch {}

    return { data: localOrder, error: null };
  }
}
