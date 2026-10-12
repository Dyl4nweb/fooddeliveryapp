// ============================================================
// AGTURONG — Order Confirmation Screen
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Clock, MapPin } from 'lucide-react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
} from '../../constants/theme';
import { Button } from '../../components/ui';

export default function OrderConfirmationScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <CheckCircle2 size={64} color={Colors.success} strokeWidth={2.2} />
        </View>

        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your order has been placed and transmitted to the kitchen.
        </Text>

        {orderId ? (
          <View style={styles.orderIdBadge}>
            <Text style={styles.orderIdLabel}>Order Reference</Text>
            <Text style={styles.orderIdText}>#{orderId.slice(0, 8).toUpperCase()}</Text>
          </View>
        ) : null}

        {/* Info card */}
        <View style={[styles.infoCard, Shadow.sm]}>
          <View style={styles.infoRow}>
            <Clock size={18} color={Colors.primary} />
            <Text style={styles.infoText}>
              Estimated Delivery: 25 - 40 minutes
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={18} color={Colors.primary} />
            <Text style={styles.infoText}>
              Delivering to your location in Alaminos City
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.bottomActions}>
        {orderId && (
          <Button
            title="Track Order Status"
            onPress={() => router.replace(`/order/${orderId}`)}
            variant="primary"
            size="lg"
            fullWidth
          />
        )}
        <Button
          title="Back to Home"
          onPress={() => router.replace('/')}
          variant="outline"
          size="lg"
          fullWidth
          style={{ marginTop: Spacing.sm }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    lineHeight: 22,
  },
  orderIdBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  orderIdLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  orderIdText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  bottomActions: {
    paddingVertical: Spacing.lg,
  },
});
