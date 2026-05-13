/**
 * Supabase docs use `@/utils/supabase/server` — re-export from the real implementation.
 * Prefer importing from `@/lib/supabase/server` in new code.
 */
export { createClient, createServerSupabaseClient, type CookieStore } from "@/lib/supabase/server";
