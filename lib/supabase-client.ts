"use client"

// Create a single Supabase client instance for the entire application.
// This enables automatic session refresh and persistSession for "stay logged-in" behavior.

import { createClient } from "@supabase/supabase-js"

// Use environment variables for the Supabase URL and ANON KEY.
// The auth config includes `persistSession` to store and reuse the session
// and `autoRefreshToken` to automatically refresh the access token.

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
)