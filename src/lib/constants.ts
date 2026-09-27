/** Site slug used to scope all data to Kocoon Wellness Spa within a shared Supabase project. */
export const SITE_SLUG = (import.meta.env.VITE_SITE_SLUG as string | undefined) ?? 'kocoon-wellness-spa'

export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://kocoon-wellness-spa.vercel.app'

export const BAGUIO_GLOBE = '09151232418'
export const BAGUIO_SMART = '09622188796'
export const PARANAQUE_PHONE = '09104893903'

/** Primary site phone (Baguio Globe). */
export const DEFAULT_PHONE = BAGUIO_GLOBE
export const DEFAULT_PHONE_TEL = `tel:${BAGUIO_GLOBE}`

export const DEFAULT_ADDRESS = '116 Purok Bubon, Loakan Proper, Baguio City'
export const DEFAULT_BUSINESS_NAME = 'Kocoon Wellness Spa'

export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('09')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }
  return phone
}

/**
 * Build a Facebook Messenger deep link (no Facebook App required).
 * Accepts m.me URL, facebook.com/messages/t/{id}, facebook page URL, or page ID.
 * Prefills the chat text when provided so form details appear in Messenger.
 */
export function buildMessengerLink(pageUrlOrId: string, prefilledText?: string): string {
  const raw = pageUrlOrId.trim()
  if (!raw) return ''

  let base = raw.split('#')[0].split('?')[0]

  const threadMatch = base.match(/facebook\.com\/messages\/t\/(\d+)/i)
  const mMeMatch = base.match(/m\.me\/([^/?#]+)/i)
  const pageMatch = base.match(/facebook\.com\/(?:profile\.php\?id=)?([^/?#]+)/i)

  if (threadMatch?.[1]) {
    base = `https://m.me/${threadMatch[1]}`
  } else if (mMeMatch?.[1]) {
    base = `https://m.me/${mMeMatch[1]}`
  } else if (/facebook\.com\//i.test(base) && pageMatch?.[1] && pageMatch[1] !== 'messages') {
    base = `https://m.me/${pageMatch[1]}`
  } else if (!/^https?:\/\//i.test(base)) {
    base = `https://m.me/${base.replace(/^@/, '')}`
  }

  if (!prefilledText?.trim()) return base
  return `${base}?text=${encodeURIComponent(prefilledText.trim())}`
}
