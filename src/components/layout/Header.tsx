import { useEffect, useState } from 'react'
import { Menu, Phone, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookAppointmentModal } from '@/components/common/BookAppointmentModal'
import { Button } from '@/components/common/Button'
import { Container } from '@/components/common/Container'
import { formatPhoneDisplay, toTelHref } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { SiteSettings } from '@/types'

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#team', label: 'Our Team' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
]

interface HeaderProps {
  settings: SiteSettings
}

export function Header({ settings }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)

  const baguioPhone = settings.phoneGlobe || settings.phone
  const baclaranPhone = settings.secondaryPhone

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  function openBooking() {
    setMobileOpen(false)
    setBookingOpen(true)
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled
            ? 'border-b border-gold/15 bg-bg/80 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl'
            : 'bg-transparent',
        )}
      >
        <Container className="flex h-[4.5rem] items-center justify-between gap-4 py-3 sm:h-20">
          <a href="#home" className="flex shrink-0 items-center gap-3" aria-label="Kocoon Wellness Spa home">
            <img
              src={settings.logoUrl || '/logo.png'}
              alt="Kocoon Wellness Spa"
              className="h-12 w-auto max-w-[200px] bg-transparent object-contain object-left sm:h-14 sm:max-w-[240px]"
              width={240}
              height={56}
            />
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-light transition hover:text-gold"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden />
              <div className="flex flex-col gap-0.5 text-[11px] leading-tight text-muted-light lg:text-xs">
                <a href={toTelHref(baguioPhone)} className="transition hover:text-gold">
                  <span className="text-gold/90">Baguio</span>{' '}
                  {formatPhoneDisplay(baguioPhone)}
                </a>
                {baclaranPhone && (
                  <a href={toTelHref(baclaranPhone)} className="transition hover:text-gold">
                    <span className="text-gold/90">Baclaran</span>{' '}
                    {formatPhoneDisplay(baclaranPhone)}
                  </a>
                )}
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={openBooking}
            >
              Book Appointment
            </Button>
            <button
              type="button"
              className="inline-flex rounded-md border border-white/10 p-2 text-cream lg:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close menu overlay"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              aria-label="Mobile"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col border-l border-gold/20 bg-bg-elevated px-6 pb-8 pt-24"
            >
              <div className="flex flex-1 flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-cream transition hover:bg-gold/10 hover:text-gold"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="space-y-3 border-t border-border pt-5">
                <a
                  href={toTelHref(baguioPhone)}
                  className="flex items-center gap-2 text-sm text-muted-light"
                >
                  <Phone className="h-4 w-4 text-gold" />
                  Baguio {formatPhoneDisplay(baguioPhone)}
                </a>
                {baclaranPhone && (
                  <a
                    href={toTelHref(baclaranPhone)}
                    className="flex items-center gap-2 text-sm text-muted-light"
                  >
                    <Phone className="h-4 w-4 text-gold" />
                    Baclaran {formatPhoneDisplay(baclaranPhone)}
                  </a>
                )}
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-sm bg-gold px-6 py-3 text-sm font-medium text-bg transition hover:bg-gold-light"
                  onClick={openBooking}
                >
                  Book Appointment
                </button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <BookAppointmentModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        settings={settings}
      />
    </>
  )
}
