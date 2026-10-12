// ============================================================
// AGTURONG — Cart Screen
// ============================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ShoppingCart, Trash2 } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useCart } from '../../store/cart';
import { useAuth } from '../../store/auth';
import { Button, EmptyState, QuantitySelector, Divider } from '../../components/ui';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { state, updateQuantity, removeItem, clearCart, subtotal, deliveryFee, total, totalItems } =
    useCart();
  const { user } = useAuth();

  const handleRemoveItem = (foodItemId: string, name: string) => {
    Alert.alert('Remove Item', `Remove ${name} from cart?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeItem(foodItemId),
      },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: clearCart,
      },
    ]);
  };

  const handleCheckout = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to place an order.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/signin') },
      ]);
      return;
    }
    router.push('/checkout');
  };

  if (state.items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.title}>My Cart</Text>
        <EmptyState
          icon={<ShoppingCart size={48} color={Colors.textTertiary} />}
          title="Your cart is empty"
          message="Add some delicious food from our restaurants to get started!"
          actionLabel="Browse Food"
          onAction={() => router.push('/')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        <TouchableOpacity onPress={handleClearCart} activeOpacity={0.7}>
          <Trash2 size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {/* Restaurant Info */}
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantLabel}>Ordering from</Text>
        <Text style={styles.restaurantName}>{state.restaurantName}</Text>
      </View>

      {/* Items */}
      <ScrollView
        style={styles.itemsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemsContent}
      >
        {state.items.map((item, index) => (
          <View key={item.food_item_id}>
            <View style={styles.cartItem}>
              <Image
                source={{
                  uri: item.image_url || 'https://placehold.co/80x80/FF6B35/white?text=Food',
                }}
                style={styles.itemImage}
                contentFit="cover"
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemPrice}>₱{item.price.toFixed(0)}</Text>
                {item.special_instructions && (
                  <Text style={styles.itemNote} numberOfLines={1}>
                    Note: {item.special_instructions}
                  </Text>
                )}
                <View style={styles.itemActions}>
                  <QuantitySelector
                    quantity={item.quantity}
                    onIncrease={() => updateQuantity(item.food_item_id, item.quantity + 1)}
                    onDecrease={() => {
                      if (item.quantity <= 1) {
                        handleRemoveItem(item.food_item_id, item.name);
                      } else {
                        updateQuantity(item.food_item_id, item.quantity - 1);
                      }
                    }}
                    min={0}
                  />
                  <Text style={styles.itemSubtotal}>
                    ₱{(item.price * item.quantity).toFixed(0)}
                  </Text>
                </View>
              </View>
            </View>
            {index < state.items.length - 1 && <Divider style={{ marginVertical: Spacing.md }} />}
          </View>
        ))}
      </ScrollView>

      {/* Summary & Checkout */}
      <View style={[styles.checkoutSection, Shadow.lg]}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({totalItems} items)</Text>
          <Text style={styles.summaryValue}>₱{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>₱{deliveryFee.toFixed(2)}</Text>
        </View>
        <Divider style={{ marginVertical: Spacing.md }} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
        </View>

        <Button
          title={`Checkout — ₱${total.toFixed(0)}`}
          onPress={handleCheckout}
          variant="primary"
          size="lg"
          fullWidth
          style={{ marginTop: Spacing.lg }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  restaurantInfo: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  restaurantLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  restaurantName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    marginTop: 2,
  },
  itemsContainer: {
    flex: 1,
  },
  itemsContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  cartItem: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  itemPrice: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemNote: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  itemSubtotal: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },

  // Checkout Section
  checkoutSection: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  totalLabel: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  totalValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
});
