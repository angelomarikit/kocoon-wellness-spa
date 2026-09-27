import { Facebook, Instagram, MapPin, Phone } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { formatPhoneDisplay, toTelHref } from '@/lib/constants'
import type { PageContent, SiteSettings } from '@/types'

interface FooterProps {
  settings: SiteSettings
  content: PageContent
}

const QUICK_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#team', label: 'Our Team' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
]

export function Footer({ settings, content }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-bg-elevated">
      <Container className="section-pad !pb-10 !pt-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <img
              src={settings.logoUrl || '/logo.png'}
              alt="Kocoon Wellness Spa"
              className="mb-5 h-16 w-auto max-w-[220px] bg-transparent object-contain object-left"
              width={220}
              height={64}
            />
            <p className="text-sm leading-relaxed text-muted">{content.footer.description}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-muted-light transition hover:text-gold">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Services
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-light">
              <li>
                <a href="#services" className="hover:text-gold">
                  Auto Massage Chair
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-gold">
                  Traditional Massage
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-gold">
                  Massage Plus & Deluxe
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-gold">
                  Hand & Foot Spa
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-muted-light">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  <span className="block text-xs font-medium uppercase tracking-wider text-gold/80">
                    {settings.addressLabel || 'Baguio City'}
                  </span>
                  {settings.address}
                </span>
              </li>
              {settings.secondaryAddress && (
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>
                    <span className="block text-xs font-medium uppercase tracking-wider text-gold/80">
                      {settings.secondaryAddressLabel || 'Branch'}
                    </span>
                    {settings.secondaryAddress}
                  </span>
                </li>
              )}
              <li className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-gold/80">
                  {settings.addressLabel || 'Baguio'} Numbers
                </p>
                <a
                  href={toTelHref(settings.phoneGlobe || settings.phone)}
                  className="flex items-center gap-2 hover:text-gold"
                >
                  <Phone className="h-4 w-4 text-gold" />
                  Globe {formatPhoneDisplay(settings.phoneGlobe || settings.phone)}
                </a>
                {settings.phoneSmart && (
                  <a
                    href={toTelHref(settings.phoneSmart)}
                    className="flex items-center gap-2 hover:text-gold"
                  >
                    <Phone className="h-4 w-4 text-gold" />
                    Smart {formatPhoneDisplay(settings.phoneSmart)}
                  </a>
                )}
              </li>
              {settings.secondaryPhone && (
                <li className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-gold/80">
                    {settings.secondaryAddressLabel || 'Parañaque'} Number
                  </p>
                  <a
                    href={toTelHref(settings.secondaryPhone)}
                    className="flex items-center gap-2 hover:text-gold"
                  >
                    <Phone className="h-4 w-4 text-gold" />
                    {settings.secondaryPhoneLabel || 'Smart / TNT'}{' '}
                    {formatPhoneDisplay(settings.secondaryPhone)}
                  </a>
                </li>
              )}
            </ul>
            <div className="mt-5 flex gap-3">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="rounded-full border border-border p-2 text-muted transition hover:border-gold/40 hover:text-gold"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="rounded-full border border-border p-2 text-muted transition hover:border-gold/40 hover:text-gold"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-center text-xs text-muted sm:flex-row sm:text-left">
          <p>
            © {year} {settings.businessName}. All Rights Reserved.
          </p>
          <a href="/admin" className="transition hover:text-gold">
            Admin
          </a>
        </div>
      </Container>
    </footer>
  )
}
