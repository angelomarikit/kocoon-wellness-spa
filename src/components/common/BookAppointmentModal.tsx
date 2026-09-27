import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { formatPhoneDisplay, toTelHref } from '@/lib/constants'
import type { SiteSettings } from '@/types'

interface BookAppointmentModalProps {
  open: boolean
  onClose: () => void
  settings: SiteSettings
}

function toWhatsAppHref(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const intl = digits.startsWith('0') ? `63${digits.slice(1)}` : digits
  return `https://wa.me/${intl}`
}

export function BookAppointmentModal({ open, onClose, settings }: BookAppointmentModalProps) {
  const baguioSmart = settings.phoneSmart || '09622188796'
  const baguioGlobe = settings.phoneGlobe || settings.phone || '09151232418'
  const baclaranPhone = settings.secondaryPhone || '09104893903'
  const baguioEmail = settings.email || 'kocoonwellnessspa@gmail.com'
  const baclaranEmail = settings.secondaryEmail || 'kocoonmanila@gmail.com'

  return (
    <Modal open={open} onClose={onClose} title="Message Us" size="md">
      <div className="space-y-6">
        <p className="text-sm text-muted">
          Choose a branch and reach us through your preferred channel.
        </p>

        <div className="rounded-xl border border-gold/20 bg-bg/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gold" />
            <h4 className="font-display text-xl text-cream">Baguio</h4>
          </div>
          <ul className="space-y-3 text-sm text-muted-light">
            <li>
              <a
                href={toWhatsAppHref(baguioSmart)}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 transition hover:text-gold"
              >
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-gold/80">
                    Smart / WhatsApp
                  </span>
                  {formatPhoneDisplay(baguioSmart)}
                </span>
              </a>
            </li>
            <li>
              <a
                href={toTelHref(baguioGlobe)}
                className="flex items-start gap-3 transition hover:text-gold"
              >
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-gold/80">
                    Globe / Viber / Telegram
                  </span>
                  {formatPhoneDisplay(baguioGlobe)}
                </span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${baguioEmail}`}
                className="flex items-start gap-3 transition hover:text-gold"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-gold/80">Email</span>
                  {baguioEmail}
                </span>
              </a>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-gold/20 bg-bg/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gold" />
            <h4 className="font-display text-xl text-cream">Baclaran</h4>
          </div>
          <ul className="space-y-3 text-sm text-muted-light">
            <li>
              <a
                href={toWhatsAppHref(baclaranPhone)}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 transition hover:text-gold"
              >
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-gold/80">
                    Smart / TNT / Viber / Telegram / WhatsApp
                  </span>
                  {formatPhoneDisplay(baclaranPhone)}
                </span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${baclaranEmail}`}
                className="flex items-start gap-3 transition hover:text-gold"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-gold/80">Email</span>
                  {baclaranEmail}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}
