import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/common/Button'
import { inquiryService, siteService } from '@/services'
import type { Inquiry, SiteSettings } from '@/types'

export function ContactLocationManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void Promise.all([siteService.getSettings(), inquiryService.list()]).then(([s, i]) => {
      setSettings(s)
      setInquiries(i)
    })
  }, [])

  async function save() {
    if (!settings) return
    setSaving(true)
    try {
      const next = await siteService.updateSettings(settings)
      setSettings(next)
      toast.success('Contact & location saved to cloud')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!settings) return <p className="text-muted">Loading…</p>

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">Contact & Location</h1>
          <p className="mt-1 text-sm text-muted">Business contact details, hours, and inquiries.</p>
        </div>
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <section className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2 sm:p-6">
        <label className="text-sm sm:col-span-2">
          <span className="mb-1.5 block text-muted-light">Google Maps Link</span>
          <input
            className="field-input"
            value={settings.googleMapsUrl}
            onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">Facebook URL (Baguio)</span>
          <input
            className="field-input"
            value={settings.facebookUrl}
            onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
            placeholder="https://facebook.com/YourBaguioPage"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">Facebook URL (Baclaran)</span>
          <input
            className="field-input"
            value={settings.facebookUrlBaclaran ?? ''}
            onChange={(e) => setSettings({ ...settings, facebookUrlBaclaran: e.target.value })}
            placeholder="https://facebook.com/YourBaclaranPage"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">Instagram URL</span>
          <input
            className="field-input"
            value={settings.instagramUrl}
            onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">Messenger / m.me (Baguio)</span>
          <input
            className="field-input"
            value={settings.messengerUrl}
            onChange={(e) => setSettings({ ...settings, messengerUrl: e.target.value })}
            placeholder="https://www.facebook.com/messages/t/1141805542359287"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1.5 block text-muted-light">Messenger / m.me (Baclaran / Manila)</span>
          <input
            className="field-input"
            value={settings.messengerUrlBaclaran ?? ''}
            onChange={(e) => setSettings({ ...settings, messengerUrlBaclaran: e.target.value })}
            placeholder="https://www.facebook.com/messages/t/1342439362286839"
          />
        </label>
        <p className="text-xs text-muted sm:col-span-2">
          Baguio must use{' '}
          <code className="text-cream">https://www.facebook.com/messages/t/1141805542359287</code>.
          Manila / Baclaran must use{' '}
          <code className="text-cream">https://www.facebook.com/messages/t/1342439362286839</code>.
          Guests still need to tap <strong className="text-cream">Send</strong> in Messenger for the
          message to reach the Page inbox. Test while logged in as a personal account (not as the Page).
        </p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold">
          Business Hours
        </h2>
        <div className="space-y-3">
          {settings.businessHours.map((hour, idx) => (
            <div key={hour.day} className="grid gap-2 sm:grid-cols-4 sm:items-center">
              <p className="text-sm text-cream">{hour.day}</p>
              <input
                className="field-input"
                value={hour.open}
                disabled={hour.closed}
                onChange={(e) => {
                  const businessHours = [...settings.businessHours]
                  businessHours[idx] = { ...hour, open: e.target.value }
                  setSettings({ ...settings, businessHours })
                }}
              />
              <input
                className="field-input"
                value={hour.close}
                disabled={hour.closed}
                onChange={(e) => {
                  const businessHours = [...settings.businessHours]
                  businessHours[idx] = { ...hour, close: e.target.value }
                  setSettings({ ...settings, businessHours })
                }}
              />
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={hour.closed}
                  onChange={(e) => {
                    const businessHours = [...settings.businessHours]
                    businessHours[idx] = { ...hour, closed: e.target.checked }
                    setSettings({ ...settings, businessHours })
                  }}
                />
                Closed
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold">
          Recent Inquiries
        </h2>
        {inquiries.length === 0 ? (
          <p className="text-sm text-muted">No inquiries yet.</p>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div key={inq.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-cream">{inq.name}</p>
                    <p className="text-xs text-muted">
                      {inq.email} · {inq.phone}
                    </p>
                  </div>
                  <select
                    className="field-input w-auto text-xs"
                    value={inq.status}
                    onChange={(e) => {
                      void inquiryService
                        .updateStatus(inq.id, e.target.value as Inquiry['status'])
                        .then(async () => {
                          setInquiries(await inquiryService.list())
                          toast.success('Status updated')
                        })
                    }}
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <p className="mt-2 text-sm text-muted-light">
                  {inq.branch ? `${inq.branch} · ` : ''}
                  {inq.service} · Preferred: {inq.preferredDate}
                </p>
                <p className="mt-1 text-sm text-muted">{inq.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
