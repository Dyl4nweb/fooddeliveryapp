// ============================================================
// AGTURONG — Cart Store (Context + AsyncStorage)
// ============================================================

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '../types';

const CART_STORAGE_KEY = '@agturong_cart';

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
}

type CartAction =
  | { type: 'SET_CART'; payload: CartState }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { food_item_id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SPECIAL_INSTRUCTIONS'; payload: { food_item_id: string; instructions: string } };

const initialState: CartState = {
  items: [],
  restaurantId: null,
  restaurantName: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_CART':
      return action.payload;

    case 'ADD_ITEM': {
      const newItem = action.payload;
      // If cart has items from a different restaurant, clear first
      if (state.restaurantId && state.restaurantId !== newItem.restaurant_id) {
        return {
          items: [newItem],
          restaurantId: newItem.restaurant_id,
          restaurantName: newItem.restaurant_name,
        };
      }
      // Check if item already exists
      const existingIndex = state.items.findIndex(
        (item) => item.food_item_id === newItem.food_item_id
      );
      if (existingIndex >= 0) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + newItem.quantity,
        };
        return { ...state, items: updated };
      }
      return {
        ...state,
        items: [...state.items, newItem],
        restaurantId: newItem.restaurant_id,
        restaurantName: newItem.restaurant_name,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { food_item_id, quantity } = action.payload;
      if (quantity <= 0) {
        const filtered = state.items.filter((item) => item.food_item_id !== food_item_id);
        if (filtered.length === 0) return initialState;
        return { ...state, items: filtered };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.food_item_id === food_item_id ? { ...item, quantity } : item
        ),
      };
    }

    case 'REMOVE_ITEM': {
      const filtered = state.items.filter((item) => item.food_item_id !== action.payload);
      if (filtered.length === 0) return initialState;
      return { ...state, items: filtered };
    }

    case 'SET_SPECIAL_INSTRUCTIONS': {
      const { food_item_id, instructions } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.food_item_id === food_item_id
            ? { ...item, special_instructions: instructions }
            : item
        ),
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

interface CartContextValue {
  state: CartState;
  addItem: (item: CartItem) => void;
  updateQuantity: (foodItemId: string, quantity: number) => void;
  removeItem: (foodItemId: string) => void;
  clearCart: () => void;
  setSpecialInstructions: (foodItemId: string, instructions: string) => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Persist cart on every change
  useEffect(() => {
    saveCart(state);
  }, [state]);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartState;
        dispatch({ type: 'SET_CART', payload: parsed });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async (cartState: CartState) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const updateQuantity = useCallback((foodItemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { food_item_id: foodItemId, quantity } });
  }, []);

  const removeItem = useCallback((foodItemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: foodItemId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const setSpecialInstructions = useCallback(
    (foodItemId: string, instructions: string) => {
      dispatch({
        type: 'SET_SPECIAL_INSTRUCTIONS',
        payload: { food_item_id: foodItemId, instructions },
      });
    },
    []
  );

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = state.items.length > 0 ? 39 : 0; // Flat ₱39 delivery fee
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        setSpecialInstructions,
        totalItems,
        subtotal,
        deliveryFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
