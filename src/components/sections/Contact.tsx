import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, Facebook, MapPin, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/Button'
import { Container } from '@/components/common/Container'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import { BACLARAN_MESSENGER_URL, buildMessengerLink, formatPhoneDisplay, toTelHref } from '@/lib/constants'
import { inquiryService } from '@/services'
import type { Service, SiteSettings } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  email: z.union([z.string().email('Please enter a valid email'), z.literal('')]),
  branch: z.enum(['Baguio', 'Baclaran'], {
    message: 'Please select a branch',
  }),
  service: z.string().min(1, 'Please select a service'),
  preferredDate: z.string().min(1, 'Please choose a preferred date'),
  message: z.string().min(5, 'Please add a short message'),
})

type FormValues = z.infer<typeof schema>

interface ContactProps {
  settings: SiteSettings
  services: Service[]
}

function resolveMessengerUrl(settings: SiteSettings, branch: 'Baguio' | 'Baclaran'): string {
  if (branch === 'Baclaran') {
    const baclaran = (settings.messengerUrlBaclaran || settings.facebookUrlBaclaran || '').trim()
    // Never fall back to Baguio Messenger for Baclaran — wrong inbox
    if (!baclaran || baclaran.includes('1342439362286859')) return BACLARAN_MESSENGER_URL
    return baclaran
  }
  return settings.messengerUrl || settings.facebookUrl
}

export function Contact({ settings, services }: ContactProps) {
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      service: '',
      preferredDate: '',
      message: '',
    },
  })

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const pageLink = resolveMessengerUrl(settings, values.branch)
      if (!pageLink) {
        toast.error(
          `Please add the ${values.branch} Facebook / Messenger link in Admin → Contact & Location first.`,
        )
        return
      }

      const fullMessage = [
        `Hello Kocoon Wellness Spa (${values.branch} branch)!`,
        `Name: ${values.name}`,
        `Phone: ${values.phone}`,
        values.email ? `Email: ${values.email}` : null,
        `Service: ${values.service}`,
        `Preferred date: ${values.preferredDate}`,
        `Message: ${values.message}`,
      ]
        .filter((line) => line !== null)
        .join('\n')

      // Short line for Messenger prefill (Facebook often strips long text= payloads)
      const shortPrefill = `Hi Kocoon (${values.branch})! ${values.name} · ${values.phone} · ${values.service} · ${values.preferredDate}`

      const messengerHref = buildMessengerLink(pageLink, shortPrefill)

      await inquiryService.create({
        name: values.name,
        phone: values.phone,
        email: values.email || '',
        service: values.service,
        preferredDate: values.preferredDate,
        message: values.message,
        branch: values.branch,
      })

      try {
        await navigator.clipboard.writeText(fullMessage)
      } catch {
        // Clipboard may be blocked; Messenger still opens
      }

      toast.success(
        'Messenger opened. Tap Send in Messenger — the spa only sees it after you send. Full details were copied if you need to paste.',
        { duration: 8000 },
      )

      // New tab keeps the website open; visitor must still press Send in Messenger
      window.open(messengerHref, '_blank', 'noopener,noreferrer')
    } catch {
      toast.error('Something went wrong. Please try again or call us.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="section-pad relative bg-bg-elevated">
      <Container>
        <SectionHeading
          eyebrow="Visit Us"
          title="Location & Contact"
          subtitle="Find us in Baguio City or Baclaran, Parañaque — message us on Facebook to book."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="space-y-6">
              <div className="rounded-2xl border border-gold/15 bg-surface p-6">
                <h3 className="font-display text-2xl text-cream">{settings.businessName}</h3>
                <ul className="mt-5 space-y-4 text-sm text-muted-light">
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>
                      <span className="block text-xs font-medium uppercase tracking-wider text-gold/80">
                        {settings.addressLabel || 'Baguio City'}
                      </span>
                      {settings.address}
                    </span>
                  </li>
                  {settings.secondaryAddress && (
                    <li className="flex gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>
                        <span className="block text-xs font-medium uppercase tracking-wider text-gold/80">
                          {settings.secondaryAddressLabel || 'Baclaran'}
                        </span>
                        {settings.secondaryAddress}
                      </span>
                    </li>
                  )}
                  <li className="space-y-2">
                    <span className="block text-xs font-medium uppercase tracking-wider text-gold/80">
                      {settings.addressLabel || 'Baguio'} Numbers
                    </span>
                    <a
                      href={toTelHref(settings.phoneGlobe || settings.phone)}
                      className="flex items-center gap-3 transition hover:text-gold"
                    >
                      <Phone className="h-4 w-4 text-gold" />
                      Globe {formatPhoneDisplay(settings.phoneGlobe || settings.phone)}
                    </a>
                    {settings.phoneSmart && (
                      <a
                        href={toTelHref(settings.phoneSmart)}
                        className="flex items-center gap-3 transition hover:text-gold"
                      >
                        <Phone className="h-4 w-4 text-gold" />
                        Smart {formatPhoneDisplay(settings.phoneSmart)}
                      </a>
                    )}
                  </li>
                  {settings.secondaryPhone && (
                    <li className="space-y-2">
                      <span className="block text-xs font-medium uppercase tracking-wider text-gold/80">
                        Baclaran Number
                      </span>
                      <a
                        href={toTelHref(settings.secondaryPhone)}
                        className="flex items-center gap-3 transition hover:text-gold"
                      >
                        <Phone className="h-4 w-4 text-gold" />
                        {settings.secondaryPhoneLabel || 'Smart / TNT'}{' '}
                        {formatPhoneDisplay(settings.secondaryPhone)}
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border border-gold/15 bg-surface p-6">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold">
                  <Clock className="h-4 w-4" />
                  Business Hours
                </h4>
                <ul className="space-y-2 text-sm">
                  {settings.businessHours.map((h) => (
                    <li key={h.day} className="flex justify-between gap-4 text-muted-light">
                      <span>{h.day}</span>
                      <span>{h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-2xl border border-gold/15 bg-surface p-6 sm:p-8"
              noValidate
            >
              <h3 className="font-display text-2xl text-cream">Send an Inquiry</h3>
              <p className="mt-2 text-sm text-muted">
                Choose a branch, then continue in Facebook Messenger and tap{' '}
                <span className="text-cream">Send</span> — that is what delivers the booking to the
                spa’s Page inbox.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Name" error={errors.name?.message}>
                  <input className="field-input" {...register('name')} autoComplete="name" />
                </Field>
                <Field label="Phone" error={errors.phone?.message}>
                  <input className="field-input" {...register('phone')} autoComplete="tel" />
                </Field>
                <Field label="Email (optional)" error={errors.email?.message} className="sm:col-span-2">
                  <input
                    className="field-input"
                    type="email"
                    {...register('email')}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Branch" error={errors.branch?.message} className="sm:col-span-2">
                  <select className="field-input" {...register('branch')}>
                    <option value="">Select a branch</option>
                    <option value="Baguio">Baguio — 116 Purok Bubon, Loakan Proper</option>
                    <option value="Baclaran">
                      Baclaran — 1947 J. Gabriel Street, Parañaque City
                    </option>
                  </select>
                </Field>
                <Field label="Service Interested In" error={errors.service?.message}>
                  <select className="field-input" {...register('service')}>
                    <option value="">Select a service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Preferred Date" error={errors.preferredDate?.message}>
                  <input className="field-input" type="date" {...register('preferredDate')} />
                </Field>
                <Field label="Message" error={errors.message?.message} className="sm:col-span-2">
                  <textarea className="field-input min-h-28" rows={4} {...register('message')} />
                </Field>
              </div>

              <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={submitting}>
                <Facebook className="h-4 w-4" />
                {submitting ? 'Opening Messenger…' : 'Message on Facebook'}
              </Button>
              <p className="mt-3 text-xs text-muted">
                Messenger will open in a new tab. If the message box is empty, paste (the form copies
                your details) then tap Send. Nothing appears in the Facebook inbox until you send.
              </p>
            </form>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block text-sm ${className ?? ''}`}>
      <span className="mb-1.5 block text-muted-light">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-300">{error}</span>}
    </label>
  )
}
