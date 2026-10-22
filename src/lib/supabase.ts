import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment or localStorage for user convenience
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const savedUrl = localStorage.getItem('ipnu_supabase_url');
  const savedKey = localStorage.getItem('ipnu_supabase_anon_key');

  const url = savedUrl || (envUrl && envUrl !== 'https://your-project-id.supabase.co' ? envUrl : '');
  const key = savedKey || (envKey && envKey !== 'your-anon-key-here' ? envKey : '');

  const isConfigured = Boolean(
    url && 
    key && 
    url.startsWith('https://') && 
    !url.includes('your-project-id') &&
    key !== 'your-anon-key-here'
  );

  return { url, key, isConfigured };
};

let cachedClient: SupabaseClient | null = null;
let cachedKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  const currentKey = `${url}_${key}`;
  if (cachedClient && cachedKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedKey = currentKey;
    return cachedClient;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('ipnu_supabase_url', url.trim());
  localStorage.setItem('ipnu_supabase_anon_key', key.trim());
  cachedClient = null;
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('ipnu_supabase_url');
  localStorage.removeItem('ipnu_supabase_anon_key');
  cachedClient = null;
};
