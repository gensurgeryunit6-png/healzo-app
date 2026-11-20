import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Publishable (public) key only. Never put a service-role / secret key in the app.
export const SUPABASE_URL = 'https://pnncnljakqrqzocahxhs.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_cga5rEYY_gFG3KZ2Kpvb9g_ZoHKiYJd';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: Platform.OS === 'web' && typeof window === 'undefined' ? undefined : AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
