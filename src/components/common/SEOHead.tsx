import { Helmet } from 'react-helmet-async'
import type { SEOSettings, SiteSettings } from '@/types'
import { SITE_URL } from '@/lib/constants'

interface SEOHeadProps {
  seo: SEOSettings
  settings: SiteSettings
}

/** Social crawlers need an absolute https URL for og:image. */
function toAbsoluteUrl(pathOrUrl: string): string {
  const raw = pathOrUrl.trim()
  if (!raw) return `${SITE_URL.replace(/\/$/, '')}/og-image.jpg`
  if (/^https?:\/\//i.test(raw)) return raw
  const base = SITE_URL.replace(/\/$/, '')
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`
}

export function SEOHead({ seo, settings }: SEOHeadProps) {
  const canonical = seo.canonicalUrl || SITE_URL
  const title = seo.title
  const description = seo.metaDescription
  const ogImage = toAbsoluteUrl(seo.ogImage || '/og-image.jpg' || settings.logoUrl)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: settings.businessName,
    description,
    telephone: [settings.phoneGlobe || settings.phone, settings.phoneSmart, settings.secondaryPhone]
      .filter(Boolean)
      .join(' / '),
    email: settings.email,
    url: canonical,
    image: ogImage,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address || '116 Purok Bubon, Loakan Proper',
      addressLocality: 'Baguio City',
      addressCountry: 'PH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      addressCountry: 'PH',
    },
    openingHoursSpecification: settings.businessHours
      .filter((h) => !h.closed)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.day,
        opens: h.open,
        closes: h.close,
      })),
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={seo.keywords.join(', ')} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={seo.ogTitle || title} />
      <meta property="og:description" content={seo.ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={`${settings.businessName} storefront`} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.ogTitle || title} />
      <meta name="twitter:description" content={seo.ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  )
}
