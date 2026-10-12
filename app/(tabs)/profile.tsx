// ============================================================
// AGTURONG — Profile Screen
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  MapPin,
  ClipboardList,
  Phone,
  LogOut,
  ChevronRight,
  Info,
} from 'lucide-react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
} from '../../constants/theme';
import { useAuth } from '../../store/auth';
import { Button, Divider } from '../../components/ui';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>My Account</Text>

      {/* User Card */}
      <View style={[styles.profileCard, Shadow.md]}>
        {user ? (
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.full_name
                  ? profile.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : user.email?.[0].toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName} numberOfLines={1}>
                {profile?.full_name || 'Valued Customer'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user.email}
              </Text>
              {profile?.phone_number && (
                <Text style={styles.userPhone}>{profile.phone_number}</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.guestContent}>
            <View style={styles.guestIconCircle}>
              <User size={32} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.guestTitle}>Welcome to AGTURONG</Text>
              <Text style={styles.guestSubtitle}>
                Sign in to track orders, save delivery addresses, and enjoy seamless checkout.
              </Text>
              <View style={styles.authButtonsRow}>
                <Button
                  title="Sign In"
                  onPress={() => router.push('/(auth)/signin')}
                  variant="primary"
                  size="sm"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Register"
                  onPress={() => router.push('/(auth)/signup')}
                  variant="outline"
                  size="sm"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Quick Stats / Location Banner */}
      <View style={styles.locationBanner}>
        <MapPin size={18} color={Colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Serving Alaminos City</Text>
          <Text style={styles.bannerSubtitle}>
            Fast deliveries across Poblacion, Lucap, San Jose, & surrounding barangays.
          </Text>
        </View>
      </View>

      {/* Section: Account & Orders */}
      <Text style={styles.sectionHeader}>Activity & Orders</Text>
      <View style={[styles.menuGroup, Shadow.sm]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/orders')}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF0EA' }]}>
              <ClipboardList size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>My Orders</Text>
          </View>
          <ChevronRight size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        <Divider />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/address')}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#EBF3FF' }]}>
              <MapPin size={20} color="#2563EB" />
            </View>
            <Text style={styles.menuItemText}>Delivery Addresses</Text>
          </View>
          <ChevronRight size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Section: Support & Info */}
      <Text style={styles.sectionHeader}>Support & App</Text>
      <View style={[styles.menuGroup, Shadow.sm]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            Alert.alert(
              'Agturong Customer Support',
              'For order inquiries, delivery updates, or restaurant partnerships in Alaminos City:\n\nHotline: (075) 551-2345\nMobile: 0917-123-4567\nEmail: support@agturong.ph'
            );
          }}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
              <Phone size={20} color="#16A34A" />
            </View>
            <Text style={styles.menuItemText}>Customer Support</Text>
          </View>
          <ChevronRight size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        <Divider />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            Alert.alert(
              'About AGTURONG',
              'AGTURONG is a homegrown food delivery platform dedicated to connecting food lovers with local restaurants, eateries, and food artisans in Alaminos City, Pangasinan.\n\nVersion 1.0.0 (MVP)'
            );
          }}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF8E1' }]}>
              <Info size={20} color="#D97706" />
            </View>
            <Text style={styles.menuItemText}>About AGTURONG</Text>
          </View>
          <ChevronRight size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Sign Out Button (if logged in) */}
      {user && (
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      )}

      {/* App Version Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>AGTURONG Food Delivery — Alaminos City</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ for Pangasinenses</Text>
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
    paddingBottom: Spacing.xxxl,
  },
  screenTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    paddingVertical: Spacing.lg,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userPhone: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  guestContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  guestIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF0EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  guestTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  guestSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#FFE0CF',
  },
  bannerTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primaryDark,
  },
  bannerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  menuGroup: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  footerSubtext: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
