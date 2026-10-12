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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    // Hide static splash immediately once JS bundle loads so the animated splash takes over
    SplashScreen.hideAsync().catch(() => {});
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
            <Stack.Screen name="+not-found" />
          </Stack>

          {/* Animated Motorcycle Splash Screen */}
          {!splashFinished && (
            <AnimatedSplashScreen onFinish={() => setSplashFinished(true)} />
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
