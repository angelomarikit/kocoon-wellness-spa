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
 * Upload a site image to the dedicated kocoon-media bucket.
 * Path: kocoon-wellness-spa/{folder}/{timestamp}-{id}.{ext}
 * Falls back to a local data URL if Supabase is not configured / upload fails.
 */
export async function uploadSiteImage(
  file: File,
  folder: UploadFolder = 'content',
): Promise<{ url: string; via: 'supabase' | 'local' }> {
  const prepared = await fileToPersistentUrl(file)
  const sb = getSupabaseClient()

  if (!sb || !isSupabaseConfigured()) {
    return { url: prepared, via: 'local' }
  }

  const ext = extensionFor(file)
  const path = `${SITE_SLUG}/${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
  const blob = dataUrlToBlob(prepared)
  const contentType = blob.type || file.type || 'image/jpeg'

  const { error } = await sb.storage.from(KOCOON_MEDIA_BUCKET).upload(path, blob, {
    cacheControl: '31536000',
    upsert: false,
    contentType,
  })

  if (error) {
    console.warn('[storage] upload failed, using local fallback:', error.message)
    return { url: prepared, via: 'local' }
  }

  const { data } = sb.storage.from(KOCOON_MEDIA_BUCKET).getPublicUrl(path)
  if (!data?.publicUrl) {
    return { url: prepared, via: 'local' }
  }

  return { url: data.publicUrl, via: 'supabase' }
}
