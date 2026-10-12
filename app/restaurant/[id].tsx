// ============================================================
// AGTURONG — Restaurant Detail Screen
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  MapPin,
  ShoppingBag,
} from 'lucide-react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
} from '../../constants/theme';
import { useRestaurant } from '../../hooks/useData';
import { useCart } from '../../store/cart';
import { FoodCard } from '../../components/FoodCard';
import { LoadingScreen, ErrorState } from '../../components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { restaurant, menuItems, loading, error, refetch } = useRestaurant(id || '');
  const { state, totalItems, subtotal } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract unique categories from menu items
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    menuItems.forEach((item) => {
      if (item.category) {
        map.set(item.category.id, item.category.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [menuItems]);

  // Filter menu items by selected category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return menuItems;
    return menuItems.filter((item) => item.category_id === selectedCategory);
  }, [menuItems, selectedCategory]);

  if (loading && !restaurant) {
    return <LoadingScreen message="Loading restaurant menu..." />;
  }

  if (error || !restaurant) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[styles.backButtonTop, { top: insets.top + Spacing.sm }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <ErrorState
          message={error || 'Restaurant not found'}
          onRetry={refetch}
        />
      </View>
    );
  }

  const isCartFromThisRestaurant =
    state.restaurantId === restaurant.id && state.items.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isCartFromThisRestaurant ? 120 : 60 }}
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image
            source={{
              uri:
                restaurant.cover_image_url ||
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
            }}
            style={styles.coverImage}
            contentFit="cover"
          />
          {/* Back button */}
          <TouchableOpacity
            style={[styles.overlayBackButton, { top: insets.top + Spacing.sm }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Restaurant Header Info */}
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{restaurant.name}</Text>
          </View>

          <Text style={styles.description}>{restaurant.description}</Text>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Star size={16} color={Colors.star} fill={Colors.star} />
              <Text style={styles.metricBold}>{restaurant.rating.toFixed(1)}</Text>
              <Text style={styles.metricLight}>({restaurant.review_count})</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Clock size={16} color={Colors.primary} />
              <Text style={styles.metricBold}>
                {restaurant.estimated_delivery_minutes} mins
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Bike size={16} color={Colors.primary} />
              <Text style={styles.metricBold}>₱{restaurant.delivery_fee.toFixed(0)}</Text>
              <Text style={styles.metricLight}>fee</Text>
            </View>
          </View>

          {/* Operating hours & Service area */}
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.textTertiary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {restaurant.address} • {restaurant.service_area}
            </Text>
          </View>
        </View>

        {/* Category Filter Chips */}
        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === 'all' && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory('all')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'all' && styles.categoryChipTextActive,
                ]}
              >
                All Items ({menuItems.length})
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat.id && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Menu Items List */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>
            {selectedCategory === 'all'
              ? 'Full Menu'
              : categories.find((c) => c.id === selectedCategory)?.name || 'Menu'}
          </Text>

          {filteredItems.length === 0 ? (
            <View style={styles.emptyMenu}>
              <Text style={styles.emptyMenuText}>No items available in this category.</Text>
            </View>
          ) : (
            filteredItems.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                variant="horizontal"
                restaurantName={restaurant.name}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      {isCartFromThisRestaurant && (
        <View
          style={[
            styles.floatingCartBar,
            Shadow.lg,
            { bottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <View style={styles.cartBarInfo}>
            <View style={styles.cartBadgeCircle}>
              <Text style={styles.cartBadgeNumber}>{totalItems}</Text>
            </View>
            <View>
              <Text style={styles.cartBarSubtotal}>₱{subtotal.toFixed(0)}</Text>
              <Text style={styles.cartBarSubtext}>Subtotal</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.cartBarButton}
            onPress={() => router.push('/(tabs)/cart')}
            activeOpacity={0.8}
          >
            <ShoppingBag size={18} color="#FFFFFF" />
            <Text style={styles.cartBarButtonText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButtonTop: {
    position: 'absolute',
    left: Spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverContainer: {
    width: SCREEN_WIDTH,
    height: 220,
    backgroundColor: Colors.surfaceSecondary,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlayBackButton: {
    position: 'absolute',
    left: Spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    flex: 1,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  metricBold: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  metricLight: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  locationText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    flex: 1,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  menuContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  menuTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyMenu: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyMenuText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  floatingCartBar: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.text,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartBarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cartBadgeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeNumber: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  cartBarSubtotal: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  cartBarSubtext: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
  },
  cartBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  cartBarButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
