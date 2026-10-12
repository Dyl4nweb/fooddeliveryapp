// ============================================================
// AGTURONG — Supabase Client
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// -------------------------------------------------------
// IMPORTANT: Replace these with your actual Supabase project credentials.
// You can find them in your Supabase dashboard → Settings → API.
// -------------------------------------------------------
const SUPABASE_URL = 'https://fqsgiiytjqttcgbctriu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxc2dpaXl0anF0dGNnYmN0cml1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTc3MDIwOSwiZXhwIjoyMTA3MzQ2MjA5fQ._i_1qL_MroxXjNNwjClwideBdFbqKw5SpF1ABig9mFM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
