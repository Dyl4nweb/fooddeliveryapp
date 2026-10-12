// ============================================================
// AGTURONG — Root Layout with Custom Animated Splash Screen
// ============================================================

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../store/auth';
import { CartProvider } from '../store/cart';
import { Colors } from '../constants/theme';
import { AnimatedSplashScreen } from '../components/AnimatedSplashScreen';

// Note: We do NOT call SplashScreen.preventAutoHideAsync() at top-level on Android,
// because Expo Go / Android can permanently freeze on the native logo if hideAsync()
// encounters any race condition or rejected promise during root mount.

export default function RootLayout() {
  const [splashFinished, setSplashFinished] = useState(false);

  const handleFinishSplash = React.useCallback(() => {
    setSplashFinished(true);
  }, []);

  useEffect(() => {
    // 1. Immediately request native splash screen to hide
    SplashScreen.hideAsync().catch(() => {});

    // 2. Safety retry for Android in case first call occurred before window attached
    const retryTimer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 200);

    // 3. Hard fallback: Guarantee main app is revealed after 2.6s max on all devices
    const fallbackTimer = setTimeout(() => {
      setSplashFinished(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 2600);

    return () => {
      clearTimeout(retryTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <View style={styles.rootContainer}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="(auth)"
              options={{
                animation: 'slide_from_bottom',
                presentation: 'modal',
              }}
            />
            <Stack.Screen name="restaurant/[id]" />
            <Stack.Screen name="food/[id]" />
            <Stack.Screen
              name="checkout/index"
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="order/[id]" />
            <Stack.Screen name="order/confirmation" />
            <Stack.Screen
              name="address/index"
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="auth-callback"
              options={{ animation: 'none' }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>

          {/* Animated Motorcycle Splash Screen */}
          {!splashFinished && (
            <AnimatedSplashScreen onFinish={handleFinishSplash} />
          )}
        </View>
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
