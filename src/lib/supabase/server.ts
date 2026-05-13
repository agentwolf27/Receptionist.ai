import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  getSupabaseAnonOrPublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./env";

export type CookieStore = Awaited<ReturnType<typeof cookies>>;

function buildServerClient(cookieStore: CookieStore): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in .env.local."
    );
  }
  return createServerClient(getSupabaseUrl(), getSupabaseAnonOrPublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — middleware refreshes sessions.
        }
      },
    },
  });
}

/**
 * Supabase SSR client (matches Supabase docs): pass `await cookies()`.
 *
 * @example
 * const cookieStore = await cookies()
 * const supabase = createClient(cookieStore)
 */
export function createClient(cookieStore: CookieStore): SupabaseClient {
  return buildServerClient(cookieStore);
}

/** Convenience when you don't want to thread `cookies()` at the call site. */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  return buildServerClient(await cookies());
}
