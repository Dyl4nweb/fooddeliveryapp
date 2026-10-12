// ============================================================
// AGTURONG — Sign In Screen
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Zap } from 'lucide-react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from '../../constants/theme';
import { useAuth } from '../../store/auth';
import { Button, Input, GoogleSignInButton } from '../../components/ui';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, signInWithGoogle, signInDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email.trim(), password);

    setLoading(false);

    if (signInError) {
      setError(signInError.message || 'Failed to sign in. Please verify your credentials.');
    } else {
      router.back();
    }
  };

  const handleDemoSignIn = async () => {
    setDemoLoading(true);
    setError(null);
    await signInDemo();
    setDemoLoading(false);
    router.replace('/');
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    const { error: googleError } = await signInWithGoogle();

    setGoogleLoading(false);

    if (googleError) {
      setError(googleError.message || 'Failed to sign in with Google.');
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar with Close */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.brandTitle}>Welcome Back</Text>
          <Text style={styles.brandSubtitle}>
            Sign in to AGTURONG to order your favorite Pangasinan meals
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error && (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>{error}</Text>
            </View>
          )}

          {/* 1-Tap Quick Access Login */}
          <TouchableOpacity
            style={styles.demoLoginBtn}
            onPress={handleDemoSignIn}
            disabled={demoLoading}
            activeOpacity={0.8}
          >
            <Zap size={18} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.demoLoginBtnText}>
              {demoLoading ? 'Accessing...' : '1-Tap Quick Access (Try App Now)'}
            </Text>
          </TouchableOpacity>

          {/* Quick Google Sign In */}
          <GoogleSignInButton
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            loading={googleLoading}
          />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with email</Text>
            <View style={styles.dividerLine} />
          </View>

          <Input
            label="Email Address"
            placeholder="juan@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(null);
            }}
            secureTextEntry
          />

          <Button
            title="Sign In"
            onPress={handleSignIn}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
            style={{ marginTop: Spacing.sm }}
          />

          {/* Quick link to register */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{"Don't have an account?"}</Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/signup')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}> Register here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: Spacing.md,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: Spacing.md,
  },
  brandTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  brandSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  form: {
    gap: Spacing.lg,
  },
  errorAlert: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  errorAlertText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: FontWeight.semibold,
  },
  demoLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  demoLoginBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
