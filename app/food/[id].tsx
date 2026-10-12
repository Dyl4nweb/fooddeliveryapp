// ============================================================
// AGTURONG — Food Detail Screen
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ShoppingBag, Store, Plus, Minus } from 'lucide-react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
} from '../../constants/theme';
import { useFoodItem } from '../../hooks/useData';
import { useCart } from '../../store/cart';
import { LoadingScreen, ErrorState } from '../../components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { item, loading, error, refetch } = useFoodItem(id || '');
  const { state, addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  if (loading && !item) {
    return <LoadingScreen message="Loading dish details..." />;
  }

  if (error || !item) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButtonTop}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <ErrorState
          message={error || 'Food item not found'}
          onRetry={refetch}
        />
      </View>
    );
  }

  const restaurantName = item.restaurant?.name || 'Restaurant';
  const totalPrice = item.price * quantity;

  const handleAddToCart = () => {
    // If cart has items from a different restaurant, confirm
    if (state.restaurantId && state.restaurantId !== item.restaurant_id && state.items.length > 0) {
      Alert.alert(
        'Start new basket?',
        `Your cart contains items from ${state.restaurantName}. Would you like to clear it and add this item from ${restaurantName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start New Basket',
            style: 'destructive',
            onPress: () => {
              addItem({
                food_item_id: item.id,
                restaurant_id: item.restaurant_id,
                name: item.name,
                price: item.price,
                quantity,
                image_url: item.image_url,
                restaurant_name: restaurantName,
                special_instructions: instructions.trim() || undefined,
              });
              router.back();
            },
          },
        ]
      );
      return;
    }

    addItem({
      food_item_id: item.id,
      restaurant_id: item.restaurant_id,
      name: item.name,
      price: item.price,
      quantity,
      image_url: item.image_url,
      restaurant_name: restaurantName,
      special_instructions: instructions.trim() || undefined,
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Food Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                item.image_url ||
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
            }}
            style={styles.foodImage}
            contentFit="cover"
          />
          {/* Back button */}
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + Spacing.sm }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.content}>
          {/* Restaurant link */}
          <TouchableOpacity
            style={styles.restaurantRow}
            onPress={() => router.push(`/restaurant/${item.restaurant_id}`)}
            activeOpacity={0.7}
          >
            <Store size={14} color={Colors.primary} />
            <Text style={styles.restaurantText}>{restaurantName}</Text>
          </TouchableOpacity>

          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodPrice}>₱{item.price.toFixed(0)}</Text>

          {item.description ? (
            <Text style={styles.foodDescription}>{item.description}</Text>
          ) : null}

          {/* Special Instructions */}
          <View style={styles.instructionSection}>
            <Text style={styles.instructionLabel}>Special Instructions</Text>
            <TextInput
              style={styles.instructionInput}
              placeholder="e.g. Less spicy, separate sauce, extra napkins..."
              placeholderTextColor={Colors.textTertiary}
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomBar,
          Shadow.lg,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            activeOpacity={0.7}
          >
            <Minus
              size={18}
              color={quantity <= 1 ? Colors.textTertiary : Colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.qtyNumber}>{quantity}</Text>

          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => q + 1)}
            activeOpacity={0.7}
          >
            <Plus size={18} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <ShoppingBag size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>
            Add to Cart — ₱{totalPrice.toFixed(0)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButtonTop: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: Colors.surfaceSecondary,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.xl,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  restaurantText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  foodName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  foodPrice: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  foodDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: Spacing.md,
  },
  instructionSection: {
    marginTop: Spacing.xxl,
  },
  instructionLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  instructionInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 80,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xs,
  },
  qtyBtn: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyNumber: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  addButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
