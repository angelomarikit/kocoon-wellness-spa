import { SITE_SLUG } from '@/lib/constants'
import { fileToPersistentUrl } from '@/lib/imageUpload'
import {
  getSupabaseAnonKey,
  getSupabaseClient,
  getSupabaseUrl,
  isSupabaseConfigured,
} from '@/lib/supabase'

export const KOCOON_MEDIA_BUCKET = 'kocoon-media'

export type UploadFolder = 'logo' | 'hero' | 'services' | 'staff' | 'gallery' | 'seo' | 'content'

function extensionFor(file: File | Blob, fallbackName?: string): string {
  const fromName = fallbackName?.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]+$/.test(fromName) && fromName.length <= 5) return fromName
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  if (file.type === 'image/gif') return 'gif'
  return 'jpg'
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, data] = dataUrl.split(',')
  const mime = meta.match(/data:(.*?);/)?.[1] || 'image/jpeg'
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

async function compressForUpload(file: File): Promise<Blob> {
  try {
    const dataUrl = await fileToPersistentUrl(file, { maxEdge: 1600, quality: 0.82 })
    return dataUrlToBlob(dataUrl)
  } catch {
    return file
  }
}

/**
 * Upload via Storage REST API (more reliable than client wrapper for some key types).
 */
async function uploadViaRest(path: string, blob: Blob, contentType: string): Promise<void> {
  const base = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!base || !key) throw new Error('Supabase env vars missing')

  const endpoint = `${base.replace(/\/$/, '')}/storage/v1/object/${KOCOON_MEDIA_BUCKET}/${path}`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: blob,
  })

  if (!res.ok) {
    let detail = res.statusText
    try {
      const json = (await res.json()) as { message?: string; error?: string }
      detail = json.message || json.error || detail
    } catch {
      /* ignore */
    }
    throw new Error(detail || `HTTP ${res.status}`)
  }
}

/**
 * Production path: File → Supabase Storage (kocoon-media) → permanent public URL.
 */
export async function uploadSiteImage(
  file: File,
  folder: UploadFolder = 'content',
): Promise<{ url: string; via: 'supabase' }> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY on Vercel, then redeploy.',
    )
  }

  const base = getSupabaseUrl()!
  const key = getSupabaseAnonKey()!
  if (!key.startsWith('eyJ') && !key.startsWith('sb_')) {
    throw new Error(
      'VITE_SUPABASE_ANON_KEY looks invalid. In Supabase → Project Settings → API, copy the anon/public key.',
    )
  }

  const blob = await compressForUpload(file)
  const ext = extensionFor(blob, file.name)
  const path = `${SITE_SLUG}/${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
  const contentType = blob.type || file.type || 'image/jpeg'

  let lastError = ''

  // 1) Prefer REST upload (clearer errors, works with standard anon JWT)
  try {
    await uploadViaRest(path, blob, contentType)
  } catch (err) {
    lastError = err instanceof Error ? err.message : String(err)

    // 2) Fallback to supabase-js storage client
    const sb = getSupabaseClient()
    if (!sb) {
      throw new Error(formatStorageError(lastError))
    }
    const { error } = await sb.storage.from(KOCOON_MEDIA_BUCKET).upload(path, blob, {
      cacheControl: '31536000',
      upsert: true,
      contentType,
    })
    if (error) {
      throw new Error(formatStorageError(error.message || lastError))
    }
  }

  const publicUrl = `${base.replace(/\/$/, '')}/storage/v1/object/public/${KOCOON_MEDIA_BUCKET}/${path}`
  return { url: publicUrl, via: 'supabase' }
}

function formatStorageError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return (
      'Storage upload failed: network/CORS error. Confirm VITE_SUPABASE_URL is correct, ' +
      'use the anon public key from Supabase → Settings → API, run 002 + 003 storage SQL, ' +
      'and check the kocoon-media bucket exists.'
    )
  }
  if (lower.includes('row-level security') || lower.includes('policy') || lower.includes('403')) {
    return (
      'Storage upload blocked by policy. Run supabase/migrations/002_kocoon_storage_bucket.sql ' +
      'and 003_kocoon_cms_write_and_storage.sql.'
    )
  }
  if (lower.includes('bucket') || lower.includes('not found') || lower.includes('404')) {
    return (
      'Storage bucket kocoon-media not found. Run supabase/migrations/002_kocoon_storage_bucket.sql.'
    )
  }
  return `Storage upload failed: ${message}. Run 002 + 003 SQL if you have not yet.`
}

/** True when URL is a durable http(s) or site asset — safe across refresh. */
export function isDurableImageUrl(url: string | undefined | null): boolean {
  if (!url) return false
  if (url.startsWith('blob:')) return false
  if (url.startsWith('data:')) return false
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')
}
