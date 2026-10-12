// ============================================================
// AGTURONG — Order Details & Live Tracking Screen
// ============================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  PackageCheck,
  MapPin,
  Phone,
} from 'lucide-react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
  ORDER_STATUS_MAP,
} from '../../constants/theme';
import { useOrder } from '../../hooks/useData';
import { OrderStatus } from '../../types';
import { StatusBadge, Divider } from '../../components/ui';

const TIMELINE_STEPS: {
  status: OrderStatus;
  title: string;
  description: string;
  icon: any;
}[] = [
  {
    status: 'pending',
    title: 'Order Placed',
    description: 'Waiting for restaurant confirmation',
    icon: Clock,
  },
  {
    status: 'confirmed',
    title: 'Order Confirmed',
    description: 'Restaurant has accepted your order',
    icon: CheckCircle2,
  },
  {
    status: 'preparing',
    title: 'Preparing Food',
    description: 'Chef is cooking your meals',
    icon: ChefHat,
  },
  {
    status: 'out_for_delivery',
    title: 'Out for Delivery',
    description: 'Agturong rider is on the way to you',
    icon: Bike,
  },
  {
    status: 'delivered',
    title: 'Order Delivered',
    description: 'Enjoy your food!',
    icon: PackageCheck,
  },
];

const STATUS_ORDER: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'delivered',
];

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { order } = useOrder(id || '');

  // Demo fallback order if order ID is not in live DB
  const displayOrder = order || {
    id: id || 'DEMO-12345',
    user_id: 'demo-user',
    restaurant_id: 'demo-rest',
    delivery_address_id: null,
    status: 'preparing' as OrderStatus,
    subtotal: 350,
    delivery_fee: 49,
    total: 399,
    payment_method: 'cod' as const,
    special_instructions: 'Less ice please',
    delivery_address_snapshot: 'Quezon Avenue, Poblacion, Alaminos City, Pangasinan',
    contact_number: '0917-123-4567',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    restaurant: {
      name: 'Alaminos Longganisa Hub',
      address: 'Poblacion, Alaminos City',
    },
    items: [
      {
        id: '1',
        order_id: id || 'DEMO',
        food_item_id: 'f1',
        food_name: 'Garlic Longganisa Rice Bowl',
        food_image_url: null,
        quantity: 2,
        unit_price: 150,
        subtotal: 300,
        special_instructions: null,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        order_id: id || 'DEMO',
        food_item_id: 'f2',
        food_name: 'Iced Calamansi Honey Drink',
        food_image_url: null,
        quantity: 1,
        unit_price: 50,
        subtotal: 50,
        special_instructions: null,
        created_at: new Date().toISOString(),
      },
    ],
  };

  const statusIndex = STATUS_ORDER.indexOf(displayOrder.status);
  const statusInfo = ORDER_STATUS_MAP[displayOrder.status] || ORDER_STATUS_MAP.pending;

  const handleCallSupport = () => {
    Alert.alert('Contact Support', 'Call Agturong rider or dispatch support at (075) 551-2345?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL('tel:0755512345') },
    ]);
  };

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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerSub}>#{displayOrder.id.slice(0, 8).toUpperCase()}</Text>
        </View>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={handleCallSupport}
          activeOpacity={0.7}
        >
          <Phone size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Current Status Hero Banner */}
        <View style={[styles.statusBanner, Shadow.sm]}>
          <View style={styles.statusBannerHeader}>
            <Text style={styles.restaurantName}>
              {displayOrder.restaurant?.name || 'Restaurant'}
            </Text>
            <StatusBadge
              status={displayOrder.status}
              label={statusInfo.label}
              color={statusInfo.color}
              bgColor={statusInfo.bgColor}
            />
          </View>
          <Text style={styles.statusDescription}>{statusInfo.description}</Text>
        </View>

        {/* Live Timeline */}
        <View style={[styles.sectionCard, Shadow.sm]}>
          <Text style={styles.sectionTitle}>Delivery Progress</Text>
          <View style={styles.timeline}>
            {TIMELINE_STEPS.map((step, idx) => {
              const stepIdx = STATUS_ORDER.indexOf(step.status);
              const isCompleted = statusIndex >= stepIdx;
              const isCurrent = displayOrder.status === step.status;
              const StepIcon = step.icon;

              return (
                <View key={step.status} style={styles.timelineRow}>
                  {/* Left Column: Icon & Connector Line */}
                  <View style={styles.timelineIndicator}>
                    <View
                      style={[
                        styles.timelineCircle,
                        isCompleted && styles.timelineCircleCompleted,
                        isCurrent && styles.timelineCircleCurrent,
                      ]}
                    >
                      <StepIcon
                        size={16}
                        color={isCompleted ? '#FFFFFF' : Colors.textTertiary}
                      />
                    </View>
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          statusIndex > stepIdx && styles.timelineLineCompleted,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Column: Title & Description */}
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineTitle,
                        isCompleted && styles.timelineTitleCompleted,
                      ]}
                    >
                      {step.title}
                    </Text>
                    <Text style={styles.timelineDescription}>
                      {step.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Delivery Address Details */}
        <View style={[styles.sectionCard, Shadow.sm]}>
          <View style={styles.sectionHeaderRow}>
            <MapPin size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Delivery Destination</Text>
          </View>
          <Text style={styles.addressSnapshotText}>
            {displayOrder.delivery_address_snapshot}
          </Text>
          <Text style={styles.contactText}>
            Contact: {displayOrder.contact_number}
          </Text>
          {displayOrder.special_instructions && (
            <Text style={styles.instructionsText}>
              Notes: {displayOrder.special_instructions}
            </Text>
          )}
        </View>

        {/* Order Items Breakdown */}
        <View style={[styles.sectionCard, Shadow.sm]}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.itemsList}>
            {displayOrder.items?.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyText}>{item.quantity}x</Text>
                </View>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.food_name}
                </Text>
                <Text style={styles.itemPrice}>₱{item.subtotal.toFixed(0)}</Text>
              </View>
            ))}
          </View>

          <Divider style={{ marginVertical: Spacing.md }} />

          {/* Pricing summary */}
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Subtotal</Text>
            <Text style={styles.calcValue}>₱{displayOrder.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Delivery Fee</Text>
            <Text style={styles.calcValue}>₱{displayOrder.delivery_fee.toFixed(2)}</Text>
          </View>
          <Divider style={{ marginVertical: Spacing.xs }} />
          <View style={styles.calcRow}>
            <Text style={styles.totalLabel}>Total (Cash on Delivery)</Text>
            <Text style={styles.totalValue}>₱{displayOrder.total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  statusBanner: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  statusBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    flex: 1,
  },
  statusDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  timeline: {
    paddingLeft: Spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIndicator: {
    alignItems: 'center',
    width: 32,
  },
  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  timelineCircleCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timelineCircleCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  timelineLine: {
    width: 2,
    height: 38,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.primary,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  timelineTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
  },
  timelineTitleCompleted: {
    color: Colors.text,
    fontWeight: FontWeight.bold,
  },
  timelineDescription: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addressSnapshotText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  contactText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  instructionsText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  itemsList: {
    gap: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  qtyBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  qtyText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },
  itemName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    flex: 1,
  },
  itemPrice: {
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
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
});
