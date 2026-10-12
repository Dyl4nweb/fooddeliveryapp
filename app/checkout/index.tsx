// ============================================================
// AGTURONG — Checkout Screen
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Banknote,
  Clock,
} from 'lucide-react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
} from '../../constants/theme';
import { useCart } from '../../store/cart';
import { useAuth } from '../../store/auth';
import { useAddresses, createOrder } from '../../hooks/useData';
import { Button, Divider, EmptyState } from '../../components/ui';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { state, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { addresses } = useAddresses(user?.id);

  const [contactNumber, setContactNumber] = useState(profile?.phone_number || '0917-000-0000');
  const [instructions, setInstructions] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Selected or default address
  const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to complete your checkout.');
      return;
    }

    if (!defaultAddress && addresses.length === 0) {
      Alert.alert(
        'Delivery Address Required',
        'Please add a delivery address in Alaminos City before placing your order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Address', onPress: () => router.push('/address') },
        ]
      );
      return;
    }

    const addressSnapshot = defaultAddress
      ? `${defaultAddress.address_line}, Brgy. ${defaultAddress.barangay}, ${defaultAddress.city}${
          defaultAddress.landmark ? ` (Landmark: ${defaultAddress.landmark})` : ''
        }`
      : 'Poblacion, Alaminos City, Pangasinan';

    setIsPlacingOrder(true);

    try {
      const orderItems = state.items.map((item) => ({
        food_item_id: item.food_item_id,
        food_name: item.name,
        food_image_url: item.image_url,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        special_instructions: item.special_instructions,
      }));

      const { data: newOrder, error } = await createOrder({
        userId: user.id,
        restaurantId: state.restaurantId || 'unknown',
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        deliveryAddressId: defaultAddress?.id,
        deliveryAddressSnapshot: addressSnapshot,
        contactNumber: contactNumber.trim() || defaultAddress?.contact_number || '0917-000-0000',
        specialInstructions: instructions.trim() || undefined,
      });

      if (error) throw error;

      clearCart();

      // Navigate to confirmation
      router.replace({
        pathname: '/order/confirmation',
        params: { orderId: newOrder?.id || 'demo-order' },
      });
    } catch {
      // In case Supabase network fails (e.g. demo mode), provide demo confirmation
      Alert.alert(
        'Offline / Demo Mode',
        'Could not connect to live database, but your order simulation succeeded!',
        [
          {
            text: 'View Demo Order',
            onPress: () => {
              clearCart();
              router.replace({
                pathname: '/order/confirmation',
                params: { orderId: 'demo-' + Date.now().toString().slice(-6) },
              });
            },
          },
        ]
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <ArrowLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 22 }} />
        </View>
        <EmptyState
          title="Your cart is empty"
          message="Return to restaurants and select your favorite meal."
          actionLabel="Browse Restaurants"
          onAction={() => router.push('/')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Delivery Address Card */}
        <View style={[styles.sectionCard, Shadow.sm]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <MapPin size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/address')}
              activeOpacity={0.7}
            >
              <Text style={styles.editLink}>Change</Text>
            </TouchableOpacity>
          </View>

          {defaultAddress ? (
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>{defaultAddress.label}</Text>
              <Text style={styles.addressText}>{defaultAddress.address_line}</Text>
              <Text style={styles.addressSubtext}>
                Brgy. {defaultAddress.barangay}, {defaultAddress.city}
              </Text>
              {defaultAddress.landmark && (
                <Text style={styles.landmarkText}>
                  Landmark: {defaultAddress.landmark}
                </Text>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.noAddressButton}
              onPress={() => router.push('/address')}
              activeOpacity={0.7}
            >
              <Text style={styles.noAddressText}>
                + Add your delivery address in Alaminos City
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Estimated Delivery Time Banner */}
        <View style={styles.timeBanner}>
          <Clock size={18} color={Colors.primary} />
          <Text style={styles.timeBannerText}>
            Estimated delivery: 25 - 40 mins via AGTURONG Express
          </Text>
        </View>

        {/* Contact Phone Number */}
        <View style={[styles.sectionCard, Shadow.sm]}>
          <Text style={styles.sectionTitle}>Contact Number</Text>
          <TextInput
            style={styles.textInput}
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="0917-123-4567"
            keyboardType="phone-pad"
          />
          <Text style={styles.inputHelp}>
            Rider will call or SMS you when arriving at your location.
          </Text>
        </View>

        {/* Order Notes / Driver Instructions */}
        <View style={[styles.sectionCard, Shadow.sm]}>
          <Text style={styles.sectionTitle}>Delivery Notes (Optional)</Text>
          <TextInput
            style={[styles.textInput, { minHeight: 60 }]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="e.g. Ring the bell twice, leave with guard, call upon arrival..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Payment Method Card */}
        <View style={[styles.sectionCard, Shadow.sm]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Banknote size={20} color="#16A34A" />
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentBadgeText}>COD</Text>
            </View>
          </View>
          <Text style={styles.paymentDesc}>
            Cash on Delivery (COD) — Please prepare exact cash for the rider upon delivery.
          </Text>
        </View>

        {/* Items Summary */}
        <View style={[styles.sectionCard, Shadow.sm]}>
          <Text style={styles.sectionTitle}>
            Order Summary ({state.restaurantName})
          </Text>
          <View style={styles.itemsList}>
            {state.items.map((item) => (
              <View key={item.food_item_id} style={styles.summaryItemRow}>
                <View style={styles.itemQuantityBadge}>
                  <Text style={styles.itemQuantityText}>{item.quantity}x</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.special_instructions && (
                    <Text style={styles.summaryItemNote}>
                      Note: {item.special_instructions}
                    </Text>
                  )}
                </View>
                <Text style={styles.summaryItemPrice}>
                  ₱{(item.price * item.quantity).toFixed(0)}
                </Text>
              </View>
            ))}
          </View>

          <Divider style={{ marginVertical: Spacing.md }} />

          {/* Pricing Breakdown */}
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Subtotal</Text>
            <Text style={styles.calcValue}>₱{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Delivery Fee</Text>
            <Text style={styles.calcValue}>₱{deliveryFee.toFixed(2)}</Text>
          </View>
          <Divider style={{ marginVertical: Spacing.sm }} />
          <View style={styles.calcRow}>
            <Text style={styles.totalLabel}>Total Payment</Text>
            <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Bar */}
      <View
        style={[
          styles.bottomBar,
          Shadow.lg,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <View>
          <Text style={styles.barTotalLabel}>Total Amount</Text>
          <Text style={styles.barTotalValue}>₱{total.toFixed(2)}</Text>
        </View>

        <Button
          title="Place Order (COD)"
          onPress={handlePlaceOrder}
          loading={isPlacingOrder}
          variant="primary"
          size="lg"
          style={{ flex: 1, marginLeft: Spacing.lg }}
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
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: 120,
    gap: Spacing.md,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  editLink: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  addressInfo: {
    marginTop: Spacing.xs,
  },
  addressLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  addressText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginTop: 2,
  },
  addressSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  landmarkText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  noAddressButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: '#FFF4EC',
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  noAddressText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  timeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFF0EA',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  timeBannerText: {
    fontSize: FontSize.xs,
    color: Colors.primaryDark,
    fontWeight: FontWeight.medium,
  },
  textInput: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  inputHelp: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  paymentBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  paymentBadgeText: {
    color: '#16A34A',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  paymentDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  itemsList: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemQuantityBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  itemQuantityText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },
  summaryItemName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  summaryItemNote: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  summaryItemPrice: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  calcLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  calcValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  totalLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  totalValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
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
    justifyContent: 'space-between',
  },
  barTotalLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  barTotalValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
});
