import { createClient } from '@supabase/supabase-js';

// Accessing environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validation: Ensure keys exist before creating the client
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing. Check your Vercel settings.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
