// ============================================================
// AGTURONG — Auth Store (Context + Supabase Auth)
// ============================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

WebBrowser.maybeCompleteAuthSession();

const DEMO_USER_STORAGE_KEY = 'agturong_demo_user_v1';

const DEMO_USER_PROFILE: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'juan.delacruz@agturong.ph',
  full_name: 'Juan dela Cruz (Alaminos City)',
  phone_number: '+63 917 890 1234',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user);
      } else {
        // Check for persisted demo session
        try {
          const stored = await AsyncStorage.getItem(DEMO_USER_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as UserProfile;
            setProfile(parsed);
            setUser({
              id: parsed.id,
              email: parsed.email,
              app_metadata: {},
              user_metadata: { full_name: parsed.full_name },
              aud: 'authenticated',
              created_at: parsed.created_at,
            } as User);
          }
        } catch (e) {
          console.warn('Error loading demo user:', e);
        }
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id, session.user);
        } else {
          // If no supabase session, check demo user
          const stored = await AsyncStorage.getItem(DEMO_USER_STORAGE_KEY).catch(() => null);
          if (!stored) {
            setProfile(null);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, authUser?: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching profile:', error.message);
      }

      if (data) {
        setProfile(data as UserProfile);
      } else {
        // Automatically create user profile if not yet created (e.g. Google OAuth sign-in)
        const currentUser = authUser || user || (await supabase.auth.getUser()).data.user;
        if (currentUser) {
          const fallbackName =
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            currentUser.email?.split('@')[0] ||
            'Agturong Customer';
          const newProfile = {
            id: currentUser.id,
            email: currentUser.email || '',
            full_name: fallbackName,
            avatar_url: currentUser.user_metadata?.avatar_url || null,
          };
          const { data: created, error: insertErr } = await supabase
            .from('profiles')
            .upsert(newProfile)
            .select()
            .single();

          if (!insertErr && created) {
            setProfile(created as UserProfile);
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
        });
        if (profileError) console.error('Profile creation error:', profileError);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
      // In SDK 57: ExecutionEnvironment.StoreClient reliably detects Expo Go
      const isExpoGo =
        Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

      // In Expo Go on iOS, Safari only recognizes exp:// links.
      // In standalone / development builds, it uses the registered agturong:// scheme.
      const redirectTo = isExpoGo
        ? Linking.createURL('auth-callback')
        : 'agturong://auth-callback';

      console.log('🔗 [OAuth] isExpoGo:', isExpoGo, 'redirectTo:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No authentication URL received from Supabase.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const code = parsed.queryParams?.code;

        if (typeof code === 'string') {
          const { data: sessionData, error: sessionErr } =
            await supabase.auth.exchangeCodeForSession(code);
          if (sessionErr) throw sessionErr;
          if (sessionData.user) {
            await fetchProfile(sessionData.user.id, sessionData.user);
          }
        } else if (result.url.includes('access_token=')) {
          // Fallback if tokens returned directly in hash
          const hashIdx = result.url.indexOf('#');
          const fragment = result.url.substring(hashIdx + 1);
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionErr } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            if (sessionErr) throw sessionErr;
            if (sessionData.user) {
              await fetchProfile(sessionData.user.id, sessionData.user);
            }
          }
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { error: error as Error };
    }
  };

  const signInDemo = async () => {
    try {
      await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(DEMO_USER_PROFILE));
      setProfile(DEMO_USER_PROFILE);
      setUser({
        id: DEMO_USER_PROFILE.id,
        email: DEMO_USER_PROFILE.email,
        app_metadata: {},
        user_metadata: { full_name: DEMO_USER_PROFILE.full_name },
        aud: 'authenticated',
        created_at: DEMO_USER_PROFILE.created_at,
      } as User);
    } catch (e) {
      console.error('Error signing in demo user:', e);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(DEMO_USER_STORAGE_KEY).catch(() => {});
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (
    updates: Partial<UserProfile>
  ): Promise<{ error: Error | null }> => {
    try {
      if (!user) throw new Error('Not authenticated');

      // If demo user, update local demo profile
      if (user.id === DEMO_USER_PROFILE.id && profile) {
        const updated = { ...profile, ...updates };
        setProfile(updated);
        await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(updated));
        return { error: null };
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshProfile = async () => {
    if (user && user.id !== DEMO_USER_PROFILE.id) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signInDemo,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
