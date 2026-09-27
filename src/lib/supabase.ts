/**
 * Supabase client for the SHARED Apex Pages project.
 * Always scope reads/writes to slug: kocoon-wellness-spa
 * Do NOT create a new Supabase project.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SITE_SLUG } from '@/lib/constants'

let client: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  return Boolean(url && key)
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL as string
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return client
}

export function getSiteScope() {
  return {
    slug: SITE_SLUG,
    /** Resolve UUID via get_project_id_by_slug(SITE_SLUG), then .eq('project_id', id) */
  }
}

/** Resolve this site's project UUID from the shared projects table (slug-locked). */
export async function resolveKocoonProjectId(): Promise<string | null> {
  const sb = getSupabaseClient()
  if (!sb) return null

  const { data, error } = await sb.rpc('get_project_id_by_slug', { p_slug: SITE_SLUG })
  if (error) {
    console.warn('[supabase] get_project_id_by_slug failed', error.message)
    return null
  }
  return (data as string | null) ?? null
}
