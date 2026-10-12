// ============================================================
// AGTURONG — Home Screen
// ============================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MapPin,
  ChevronDown,
  Search,
  Utensils,
  Pizza,
  Sandwich,
  Coffee,
  IceCream,
  Drumstick,
  CupSoda,
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useRestaurants, useCategories, useFoodItems } from '../../hooks/useData';
import { useAuth } from '../../store/auth';
import { FoodCard } from '../../components/FoodCard';
import { RestaurantCard } from '../../components/RestaurantCard';
import { ErrorState, Skeleton } from '../../components/ui';

const CATEGORY_ICONS: Record<string, any> = {
  'Filipino Food': Utensils,
  'Rice Meals': Drumstick,
  Burgers: Sandwich,
  Pizza: Pizza,
  Snacks: Coffee,
  Desserts: IceCream,
  Drinks: CupSoda,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { restaurants, loading: loadingRest, error: errorRest, refetch: refetchRest } = useRestaurants();
  const { categories, loading: loadingCat } = useCategories();
  const { items: featuredItems, loading: loadingFeatured } = useFoodItems({ featured: true });
  const { items: popularItems, loading: loadingPopular } = useFoodItems({ popular: true });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchRest();
    setRefreshing(false);
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <View>
            <Text style={styles.brandName}>AGTURONG</Text>
            <TouchableOpacity
              style={styles.addressSelector}
              onPress={() => router.push('/address')}
              activeOpacity={0.7}
            >
              <MapPin size={12} color={Colors.primary} />
              <Text style={styles.addressText} numberOfLines={1}>
                Alaminos City, Pangasinan
              </Text>
              <ChevronDown size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Hello, {firstName}! 👋</Text>
        <Text style={styles.welcomeSubtext}>What would you like to eat today?</Text>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={[styles.searchBar, Shadow.sm]}
        onPress={() => router.push('/(tabs)/search')}
        activeOpacity={0.7}
      >
        <Search size={18} color={Colors.textTertiary} />
        <Text style={styles.searchPlaceholder}>Search food or restaurants...</Text>
      </TouchableOpacity>

      {/* Promo Banner */}
      <View style={styles.promoBanner}>
        <Image
          source={require('../../assets/images/hero-banner.jpg')}
          style={styles.promoBannerImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.promoBannerOverlay}>
          <Text style={styles.promoTitle}>Free Delivery!</Text>
          <Text style={styles.promoSubtitle}>On your first order</Text>
          <View style={styles.promoButton}>
            <Text style={styles.promoButtonText}>Order Now</Text>
          </View>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((cat) => {
            const IconComponent = CATEGORY_ICONS[cat.name] || Utensils;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/search',
                    params: { categoryId: cat.id, categoryName: cat.name },
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.categoryIconWrapper}>
                  <IconComponent size={24} color={Colors.primary} />
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
          {loadingCat &&
            [1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.categoryItem}>
                <Skeleton width={56} height={56} borderRadius={BorderRadius.xl} />
                <Skeleton
                  width={50}
                  height={12}
                  style={{ marginTop: Spacing.sm }}
                />
              </View>
            ))}
        </ScrollView>
      </View>

      {/* Featured Restaurants */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Restaurants</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {loadingRest ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                width={260}
                height={200}
                borderRadius={BorderRadius.xl}
                style={{ marginRight: Spacing.md }}
              />
            ))}
          </ScrollView>
        ) : errorRest ? (
          <ErrorState message={errorRest} onRetry={refetchRest} />
        ) : (
          <FlatList
            data={restaurants.filter((r) => r.is_active).slice(0, 8)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <RestaurantCard restaurant={item} variant="featured" />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingRight: Spacing.lg }}
          />
        )}
      </View>

      {/* Popular Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Popular Right Now</Text>
        </View>
        {loadingPopular ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                width={170}
                height={200}
                borderRadius={BorderRadius.xl}
                style={{ marginRight: Spacing.md }}
              />
            ))}
          </ScrollView>
        ) : (
          <FlatList
            data={popularItems.slice(0, 10)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <FoodCard item={item} variant="vertical" />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingRight: Spacing.lg }}
          />
        )}
      </View>

      {/* Featured Food */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⭐ Recommended for You</Text>
        </View>
        {loadingFeatured ? (
          <View>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                width={'100%' as any}
                height={100}
                borderRadius={BorderRadius.xl}
                style={{ marginBottom: Spacing.md }}
              />
            ))}
          </View>
        ) : (
          featuredItems.slice(0, 6).map((item) => (
            <FoodCard key={item.id} item={item} variant="horizontal" />
          ))
        )}
      </View>

      {/* All Restaurants */}
      <View style={[styles.section, { marginBottom: Spacing.xxxl }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Restaurants</Text>
        </View>
        {restaurants
          .filter((r) => r.is_active)
          .map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              variant="list"
            />
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
  },
  brandName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  addressSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    maxWidth: 180,
  },

  // Welcome
  welcomeSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  welcomeText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  welcomeSubtext: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textTertiary,
  },

  // Promo Banner
  promoBanner: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xxl,
    height: 160,
    position: 'relative',
  },
  promoBannerImage: {
    width: '100%',
    height: '100%',
  },
  promoBannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textInverse,
  },
  promoSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textInverse,
    opacity: 0.9,
    marginTop: 2,
  },
  promoButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
  },
  promoButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },

  // Categories
  categoriesContainer: {
    paddingRight: Spacing.lg,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: Spacing.lg,
    width: 68,
  },
  categoryIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  seeAll: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
});
