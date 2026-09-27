import { SITE_SLUG } from '@/lib/constants'
import { fileToPersistentUrl } from '@/lib/imageUpload'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

export const KOCOON_MEDIA_BUCKET = 'kocoon-media'

export type UploadFolder = 'logo' | 'hero' | 'services' | 'staff' | 'gallery' | 'seo' | 'content'

function extensionFor(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
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

/**
 * Production path: File → Supabase Storage (kocoon-media) → permanent public URL.
 * When Supabase is configured, local data-URL fallback is NOT used (that breaks on refresh).
 */
export async function uploadSiteImage(
  file: File,
  folder: UploadFolder = 'content',
): Promise<{ url: string; via: 'supabase' }> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.',
    )
  }

  const sb = getSupabaseClient()
  if (!sb) {
    throw new Error('Supabase client failed to start. Check your env keys.')
  }

  // Compress for faster upload, then send as a real file to Storage
  const prepared = await fileToPersistentUrl(file)
  const blob = dataUrlToBlob(prepared)
  const ext = extensionFor(file)
  const path = `${SITE_SLUG}/${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
  const contentType = blob.type || file.type || 'image/jpeg'

  const { error } = await sb.storage.from(KOCOON_MEDIA_BUCKET).upload(path, blob, {
    cacheControl: '31536000',
    upsert: true,
    contentType,
  })

  if (error) {
    throw new Error(
      `Storage upload failed: ${error.message}. Run supabase/migrations/002_kocoon_storage_bucket.sql and 003_kocoon_cms_write_and_storage.sql.`,
    )
  }

  const { data } = sb.storage.from(KOCOON_MEDIA_BUCKET).getPublicUrl(path)
  if (!data?.publicUrl) {
    throw new Error('Upload succeeded but no public URL was returned.')
  }

  return { url: data.publicUrl, via: 'supabase' }
}

/** True when URL is a durable http(s) or site asset — safe across refresh. */
export function isDurableImageUrl(url: string | undefined | null): boolean {
  if (!url) return false
  if (url.startsWith('blob:')) return false
  if (url.startsWith('data:')) return false
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/')
  )
}
