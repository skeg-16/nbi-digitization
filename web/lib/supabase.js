import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables. Check your .env.local file.");
}

// Standard client for frontend usage (handles auth sessions)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Use the key provided (QMS anon key with RLS bypass)
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
