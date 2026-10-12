// ============================================================
// AGTURONG — Restaurant Card Component
// ============================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Star, Clock } from 'lucide-react-native';
import { Restaurant } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../constants/theme';

interface RestaurantCardProps {
  restaurant: Restaurant;
  variant?: 'featured' | 'list';
}

export function RestaurantCard({ restaurant, variant = 'featured' }: RestaurantCardProps) {
  const handlePress = () => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  if (variant === 'list') {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        style={[styles.listCard, Shadow.md]}
      >
        <Image
          source={{
            uri: restaurant.cover_image_url || 'https://placehold.co/100x100/FF6B35/white?text=Restaurant',
          }}
          style={styles.listImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <Text style={styles.name} numberOfLines={1}>
              {restaurant.name}
            </Text>
            {!restaurant.is_accepting_orders && (
              <View style={styles.closedBadge}>
                <Text style={styles.closedText}>Closed</Text>
              </View>
            )}
          </View>
          <Text style={styles.description} numberOfLines={1}>
            {restaurant.description}
          </Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Star size={12} color={Colors.star} fill={Colors.star} />
              <Text style={styles.metaText}>
                {restaurant.rating.toFixed(1)} ({restaurant.review_count})
              </Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Clock size={12} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{restaurant.estimated_delivery_minutes} min</Text>
            </View>
            <View style={styles.metaDot} />
            <Text style={styles.deliveryFee}>₱{restaurant.delivery_fee.toFixed(0)} fee</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[styles.featuredCard, Shadow.md]}
    >
      <Image
        source={{
          uri: restaurant.cover_image_url || 'https://placehold.co/280x150/FF6B35/white?text=Restaurant',
        }}
        style={styles.featuredImage}
        contentFit="cover"
        transition={200}
      />
      {!restaurant.is_accepting_orders && (
        <View style={styles.closedOverlay}>
          <Text style={styles.closedOverlayText}>Currently Closed</Text>
        </View>
      )}
      <View style={styles.featuredContent}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {restaurant.description}
        </Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Star size={12} color={Colors.star} fill={Colors.star} />
            <Text style={styles.metaText}>
              {restaurant.rating.toFixed(1)}
            </Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Clock size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{restaurant.estimated_delivery_minutes} min</Text>
          </View>
          <View style={styles.metaDot} />
          <Text style={styles.deliveryFee}>₱{restaurant.delivery_fee.toFixed(0)} delivery</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Featured
  featuredCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    width: 260,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 140,
  },
  featuredContent: {
    padding: Spacing.md,
  },
  closedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closedOverlayText: {
    color: Colors.textInverse,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },

  // List
  listCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  listImage: {
    width: 100,
    height: 100,
  },
  listContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Shared
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    flex: 1,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textTertiary,
    marginHorizontal: Spacing.sm,
  },
  deliveryFee: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  closedBadge: {
    backgroundColor: Colors.errorLight,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  closedText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    fontWeight: FontWeight.semibold,
  },
});
