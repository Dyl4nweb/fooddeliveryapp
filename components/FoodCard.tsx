// ============================================================
// AGTURONG — Food Card Component
// ============================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { FoodItem } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../constants/theme';
import { useCart } from '../store/cart';

interface FoodCardProps {
  item?: FoodItem;
  food?: FoodItem;
  variant?: 'horizontal' | 'vertical';
  restaurantName?: string;
}

export function FoodCard({ item, food, variant = 'vertical', restaurantName }: FoodCardProps) {
  const foodItem = item || food;
  const { addItem } = useCart();

  if (!foodItem) return null;

  const handlePress = () => {
    router.push(`/food/${foodItem.id}`);
  };

  const handleAddToCart = () => {
    addItem({
      food_item_id: foodItem.id,
      restaurant_id: foodItem.restaurant_id,
      name: foodItem.name,
      price: foodItem.price,
      quantity: 1,
      image_url: foodItem.image_url,
      restaurant_name: restaurantName || foodItem.restaurant?.name || '',
    });
  };

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        style={[styles.horizontalCard, Shadow.md]}
      >
        <Image
          source={{ uri: foodItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' }}
          style={styles.horizontalImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.horizontalContent}>
          <Text style={styles.foodName} numberOfLines={2}>
            {foodItem.name}
          </Text>
          {foodItem.restaurant && (
            <Text style={styles.restaurantLabel} numberOfLines={1}>
              {foodItem.restaurant.name}
            </Text>
          )}
          <View style={styles.horizontalFooter}>
            <Text style={styles.price}>₱{foodItem.price.toFixed(0)}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
              activeOpacity={0.7}
            >
              <Plus size={16} color={Colors.textOnPrimary} strokeWidth={3} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[styles.verticalCard, Shadow.md]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: foodItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' }}
          style={styles.verticalImage}
          contentFit="cover"
          transition={200}
        />
        {!foodItem.is_available && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
      </View>
      <View style={styles.verticalContent}>
        <Text style={styles.foodName} numberOfLines={2}>
          {foodItem.name}
        </Text>
        {foodItem.restaurant && (
          <Text style={styles.restaurantLabel} numberOfLines={1}>
            {foodItem.restaurant.name}
          </Text>
        )}
        <View style={styles.verticalFooter}>
          <Text style={styles.price}>₱{foodItem.price.toFixed(0)}</Text>
          {foodItem.is_available && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
              activeOpacity={0.7}
            >
              <Plus size={16} color={Colors.textOnPrimary} strokeWidth={3} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Vertical card
  verticalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    width: 170,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  verticalImage: {
    width: '100%',
    height: 120,
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableText: {
    color: Colors.textInverse,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  verticalContent: {
    padding: Spacing.md,
  },
  verticalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },

  // Horizontal card
  horizontalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  horizontalImage: {
    width: 100,
    height: 100,
  },
  horizontalContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  horizontalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Shared
  foodName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    lineHeight: 20,
  },
  restaurantLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
