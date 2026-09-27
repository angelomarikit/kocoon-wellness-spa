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

/** Facebook Messenger thread links (facebook.com/messages/t/{pageId}). */
export const BAGUIO_MESSENGER_URL =
  'https://www.facebook.com/messages/t/1141805542359287'
export const BACLARAN_MESSENGER_URL =
  'https://www.facebook.com/messages/t/1342439362286839'
/** Typo that was shipping previously — migrate away from this ID. */
export const BACLARAN_MESSENGER_URL_LEGACY_TYPO =
  'https://www.facebook.com/messages/t/1342439362286859'

/** Staff / team branch tabs (public + admin). */
export const STAFF_BRANCHES = ['Baguio', 'Manila'] as const

export const STAFF_BRANCH_LABELS: Record<(typeof STAFF_BRANCHES)[number], string> = {
  Baguio: 'Baguio Branch',
  Manila: 'Manila Branch',
}

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
 * Build a Facebook Messenger deep link (no Facebook App / Graph API required).
 *
 * Autofill (form → message box) ONLY works with m.me/{pageId}?text=...
 * facebook.com/messages/t/{id} can open the chat but will NOT prefill text.
 *
 * Important: this only OPENS a chat with optional draft text. The visitor must
 * still tap Send for it to appear in the Page inbox.
 */
export function buildMessengerLink(pageUrlOrId: string, prefilledText?: string): string {
  const raw = pageUrlOrId.trim()
  if (!raw) return ''

  const cleaned = raw.split('#')[0].split('?')[0]

  const threadId = cleaned.match(/facebook\.com\/messages\/t\/(\d+)/i)?.[1]
  const mMeId = cleaned.match(/m\.me\/([^/?#]+)/i)?.[1]
  const pagePath = cleaned.match(/facebook\.com\/(?:profile\.php\?id=)?([^/?#]+)/i)?.[1]
  const bareId = !/^https?:\/\//i.test(cleaned) ? cleaned.replace(/^@/, '') : null

  const pageKey = threadId || mMeId || (pagePath && pagePath !== 'messages' ? pagePath : null) || bareId
  if (!pageKey) return ''

  const draft = prefilledText?.trim()
  if (draft) {
    // m.me + text= is the only reliable autofill path Facebook supports
    const text = draft.slice(0, 1000)
    return `https://m.me/${pageKey}?text=${encodeURIComponent(text)}`
  }

  // No draft: keep the public thread URL the spa shared
  if (threadId) return `https://www.facebook.com/messages/t/${threadId}`
  return `https://m.me/${pageKey}`
}

/** Canonical inquiry Messenger targets — ignore corrupted CMS values. */
export function messengerUrlForBranch(branch: 'Baguio' | 'Baclaran'): string {
  return branch === 'Baclaran' ? BACLARAN_MESSENGER_URL : BAGUIO_MESSENGER_URL
}

/** Build inquiry draft text for Messenger (clipboard / paste — always reliable). */
export function formatInquiryMessengerText(input: {
  branch: string
  name: string
  phone: string
  email?: string
  service: string
  preferredDate: string
  message: string
}): string {
  const lines = [
    `Hello Kocoon Wellness Spa (${input.branch} branch)!`,
    ``,
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
    input.email?.trim() ? `Email: ${input.email.trim()}` : null,
    `Service: ${input.service}`,
    `Preferred date: ${input.preferredDate}`,
    ``,
    `Message:`,
    input.message,
  ]
  return lines.filter((line) => line !== null).join('\n')
}

/**
 * Short one-line draft for m.me?text= (Facebook often ignores long / multi-line,
 * and ignores text= entirely when a chat already exists).
 */
export function formatInquiryMessengerTextShort(input: {
  branch: string
  name: string
  phone: string
  email?: string
  service: string
  preferredDate: string
  message: string
}): string {
  const parts = [
    `Hi Kocoon (${input.branch})!`,
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
    input.email?.trim() ? `Email: ${input.email.trim()}` : null,
    `Service: ${input.service}`,
    `Date: ${input.preferredDate}`,
    `Msg: ${input.message}`,
  ].filter((p): p is string => Boolean(p))
  return parts.join(' · ').slice(0, 280)
}

/** Open Messenger; fall back if the browser blocks window.open. */
export function openMessengerChat(url: string): boolean {
  if (!url) return false
  const popup = window.open(url, '_blank', 'noopener,noreferrer')
  if (popup) return true
  window.location.assign(url)
  return true
}
