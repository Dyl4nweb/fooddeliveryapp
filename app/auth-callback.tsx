// ============================================================
// AGTURONG — OAuth Callback Screen
// Handles deep link redirect from Google OAuth & Supabase
// ============================================================

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Colors, FontSize, FontWeight, Spacing } from '../constants/theme';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams();

  useEffect(() => {
    let isMounted = true;

    async function processCallback() {
      try {
        const code = params.code;
        if (typeof code === 'string') {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging OAuth code:', error);
          }
        }
      } catch (err) {
        console.error('Error processing auth callback:', err);
      } finally {
        if (isMounted) {
          // Replace to home screen
          router.replace('/');
        }
      }
    }

    processCallback();

    return () => {
      isMounted = false;
    };
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Signing you in to AGTURONG...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
});
