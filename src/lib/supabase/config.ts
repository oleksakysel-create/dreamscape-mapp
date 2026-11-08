export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** When false the app runs in local-only mode (guest + demo) — no network calls are made. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
