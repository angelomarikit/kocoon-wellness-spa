import { MessageCircle, Phone } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Container } from '@/components/common/Container'
import { Reveal } from '@/components/common/Reveal'
import { buildMessengerLink, formatPhoneDisplay, toTelHref } from '@/lib/constants'
import type { BookingCtaContent, SiteSettings } from '@/types'

interface BookingCtaProps {
  content: BookingCtaContent
  settings: SiteSettings
}

export function BookingCta({ content, settings }: BookingCtaProps) {
  const primary = settings.phoneGlobe || settings.phone

  return (
    <section id="booking" className="relative overflow-hidden border-y border-gold/15">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-bg to-bg" />
      <div className="pointer-events-none absolute inset-0 low-poly-overlay opacity-30" />
      <Container className="relative section-pad text-center">
        <Reveal>
          <h2 className="font-display text-3xl text-cream sm:text-5xl">{content.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted sm:text-lg">{content.description}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href={toTelHref(primary)} size="lg">
              <Phone className="h-4 w-4" />
              {content.primaryButton}
            </Button>
            <Button href="#contact" variant="secondary" size="lg">
              {content.secondaryButton}
            </Button>
            {settings.messengerUrl ? (
              <Button
                href={buildMessengerLink(settings.messengerUrl)}
                variant="outline"
                size="lg"
              >
                <MessageCircle className="h-4 w-4" />
                {content.tertiaryButton}
              </Button>
            ) : (
              <Button href="#contact" variant="outline" size="lg">
                <MessageCircle className="h-4 w-4" />
                {content.tertiaryButton}
              </Button>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm tracking-wide text-gold">
            <a href={toTelHref(primary)} className="transition hover:text-gold-soft">
              Globe {formatPhoneDisplay(primary)}
            </a>
            {settings.phoneSmart && (
              <a href={toTelHref(settings.phoneSmart)} className="transition hover:text-gold-soft">
                Smart {formatPhoneDisplay(settings.phoneSmart)}
              </a>
            )}
            {settings.secondaryPhone && (
              <a
                href={toTelHref(settings.secondaryPhone)}
                className="transition hover:text-gold-soft"
              >
                Parañaque {formatPhoneDisplay(settings.secondaryPhone)}
              </a>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
