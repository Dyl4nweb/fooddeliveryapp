// ============================================================
// AGTURONG — Orders Screen
// ============================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ClipboardList, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow, ORDER_STATUS_MAP } from '../../constants/theme';
import { useAuth } from '../../store/auth';
import { useOrders } from '../../hooks/useData';
import { EmptyState, LoadingScreen, ErrorState, StatusBadge } from '../../components/ui';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { orders, loading, error, refetch } = useOrders(user?.id);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.title}>My Orders</Text>
        <EmptyState
          icon={<ClipboardList size={48} color={Colors.textTertiary} />}
          title="Sign in to view orders"
          message="Keep track of your food deliveries and order history."
          actionLabel="Sign In"
          onAction={() => router.push('/(auth)/signin')}
        />
      </View>
    );
  }

  if (loading && orders.length === 0) {
    return <LoadingScreen message="Loading orders..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>My Orders</Text>

      {error && <ErrorState message={error} onRetry={refetch} />}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {orders.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={48} color={Colors.textTertiary} />}
            title="No orders yet"
            message="Your order history will appear here once you place your first order."
            actionLabel="Browse Restaurants"
            onAction={() => router.push('/')}
          />
        ) : (
          orders.map((order) => {
            const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;
            return (
              <TouchableOpacity
                key={order.id}
                style={[styles.orderCard, Shadow.md]}
                onPress={() => router.push(`/order/${order.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderRestaurant}>
                    <Image
                      source={{
                        uri:
                          order.restaurant?.cover_image_url ||
                          'https://placehold.co/48x48/FF6B35/white?text=R',
                      }}
                      style={styles.restaurantLogo}
                      contentFit="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.restaurantName} numberOfLines={1}>
                        {order.restaurant?.name || 'Restaurant'}
                      </Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.created_at).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={Colors.textTertiary} />
                </View>

                <View style={styles.orderItems}>
                  <Text style={styles.orderItemsText} numberOfLines={1}>
                    {order.items?.map((i) => `${i.quantity}x ${i.food_name}`).join(', ') ||
                      'Order items'}
                  </Text>
                </View>

                <View style={styles.orderFooter}>
                  <StatusBadge
                    status={order.status}
                    label={statusInfo.label}
                    color={statusInfo.color}
                    bgColor={statusInfo.bgColor}
                  />
                  <Text style={styles.orderTotal}>₱{order.total.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderRestaurant: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  restaurantLogo: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
  },
  restaurantName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  orderDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  orderItems: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  orderItemsText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  orderTotal: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
});
