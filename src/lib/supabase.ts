/**
 * Supabase client — always scope to slug: kocoon-wellness-spa
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SITE_SLUG } from '@/lib/constants'

let client: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  return Boolean(url?.trim() && key?.trim())
}

export function getSupabaseUrl(): string | null {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
  return url || null
}

export function getSupabaseAnonKey(): string | null {
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()
  return key || null
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (!client) {
    const url = getSupabaseUrl()!
    const key = getSupabaseAnonKey()!
    client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  }
  return client
}

export function getSiteScope() {
  return { slug: SITE_SLUG }
}

export async function withTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** Resolve this site's cms_sites.id by slug. */
export async function resolveKocoonSiteId(): Promise<string | null> {
  const sb = getSupabaseClient()
  if (!sb) return null

  try {
    return await withTimeout(
      (async () => {
        const { data, error } = await sb
          .from('cms_sites')
          .select('id')
          .eq('slug', SITE_SLUG)
          .maybeSingle()
        if (error || !data?.id) return null
        return data.id as string
      })(),
      3000,
    )
  } catch (err) {
    console.warn('[supabase] resolveKocoonSiteId failed', err)
    return null
  }
}

/** @deprecated use resolveKocoonSiteId */
export async function resolveKocoonProjectId(): Promise<string | null> {
  return resolveKocoonSiteId()
}
