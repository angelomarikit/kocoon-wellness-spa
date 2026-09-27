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
import {
  buildMessengerLink,
  formatInquiryMessengerText,
  formatPhoneDisplay,
  messengerUrlForBranch,
  openMessengerChat,
  toTelHref,
} from '@/lib/constants'
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
      const draft = formatInquiryMessengerText({
        branch: values.branch,
        name: values.name,
        phone: values.phone,
        email: values.email,
        service: values.service,
        preferredDate: values.preferredDate,
        message: values.message,
      })

      // m.me/{pageId}?text=… autofills the Messenger compose box for both branches
      const messengerHref = buildMessengerLink(messengerUrlForBranch(values.branch), draft)

      openMessengerChat(messengerHref)
      void navigator.clipboard.writeText(draft).catch(() => undefined)

      toast.success(
        `${values.branch}: your details should appear in Messenger — review and tap Send.`,
        { duration: 9000 },
      )

      void inquiryService
        .create({
          name: values.name,
          phone: values.phone,
          email: values.email || '',
          service: values.service,
          preferredDate: values.preferredDate,
          message: values.message,
          branch: values.branch,
        })
        .catch((err) => console.warn('[contact] inquiry save failed', err))
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
                Messenger opens with your inquiry filled in. Review the text, then tap{' '}
                <span className="text-cream">Send</span> so it reaches the spa’s Page inbox. If the
                box is empty, paste (details are also copied) and send.
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
