// ============================================================
// AGTURONG — Search Screen
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useSearch, useCategories, useFoodItems } from '../../hooks/useData';
import { FoodCard } from '../../components/FoodCard';
import { RestaurantCard } from '../../components/RestaurantCard';
import { Chip, EmptyState } from '../../components/ui';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoryId?: string; categoryName?: string }>();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    params.categoryId || null
  );

  const { categories } = useCategories();
  const { restaurants, foodItems, loading: searchLoading } = useSearch(query);
  const { items: categoryItems, loading: catLoading } = useFoodItems({
    categoryId: selectedCategory || undefined,
  });

  const isSearching = query.length >= 2;
  const isFiltering = !!selectedCategory;

  const handleClearSearch = () => {
    setQuery('');
  };

  const handleCategoryPress = (catId: string) => {
    setSelectedCategory(selectedCategory === catId ? null : catId);
    setQuery('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Bar */}
      <View style={styles.searchHeader}>
        <View style={[styles.searchBar, Shadow.sm]}>
          <SearchIcon size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food, restaurants..."
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (text.length > 0) setSelectedCategory(null);
            }}
            autoFocus={!params.categoryId}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} activeOpacity={0.7}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesRow}
        contentContainerStyle={styles.categoriesContent}
      >
        <Chip
          label="All"
          selected={!selectedCategory}
          onPress={() => setSelectedCategory(null)}
        />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            selected={selectedCategory === cat.id}
            onPress={() => handleCategoryPress(cat.id)}
          />
        ))}
      </ScrollView>

      {/* Results */}
      <ScrollView
        style={styles.results}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
      >
        {(searchLoading || catLoading) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}

        {/* Search Results */}
        {isSearching && !searchLoading && (
          <>
            {restaurants.length === 0 && foodItems.length === 0 ? (
              <EmptyState
                title="No results found"
                message={`We couldn't find anything matching "${query}". Try a different keyword.`}
              />
            ) : (
              <>
                {/* Restaurant Results */}
                {restaurants.length > 0 && (
                  <View style={styles.resultSection}>
                    <Text style={styles.resultSectionTitle}>
                      Restaurants ({restaurants.length})
                    </Text>
                    {restaurants.map((r) => (
                      <RestaurantCard key={r.id} restaurant={r} variant="list" />
                    ))}
                  </View>
                )}

                {/* Food Results */}
                {foodItems.length > 0 && (
                  <View style={styles.resultSection}>
                    <Text style={styles.resultSectionTitle}>
                      Food Items ({foodItems.length})
                    </Text>
                    {foodItems.map((item) => (
                      <FoodCard key={item.id} item={item} variant="horizontal" />
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}

        {/* Category Results */}
        {isFiltering && !isSearching && !catLoading && (
          <>
            {categoryItems.length === 0 ? (
              <EmptyState
                title="No items in this category"
                message="Check back later for new additions!"
              />
            ) : (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>
                  {categories.find((c) => c.id === selectedCategory)?.name || 'Category'} (
                  {categoryItems.length})
                </Text>
                {categoryItems.map((item) => (
                  <FoodCard key={item.id} item={item} variant="horizontal" />
                ))}
              </View>
            )}
          </>
        )}

        {/* Default State */}
        {!isSearching && !isFiltering && !searchLoading && (
          <View style={styles.defaultState}>
            <Text style={styles.defaultTitle}>🔍</Text>
            <Text style={styles.defaultText}>
              Search for your favorite food or restaurant
            </Text>
            <Text style={styles.defaultSubtext}>
              Or filter by category above
            </Text>
          </View>
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
  searchHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  categoriesRow: {
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  results: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  loadingContainer: {
    padding: Spacing.section,
    alignItems: 'center',
  },
  resultSection: {
    marginBottom: Spacing.xl,
  },
  resultSectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  defaultState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  defaultTitle: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  defaultText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  defaultSubtext: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
});
