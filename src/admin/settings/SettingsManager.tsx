import { useEffect, useState } from 'react'
import { Lock, Unlock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/Button'
import { ImageUpload } from '@/components/common/ImageUpload'
import { SITE_SLUG } from '@/lib/constants'
import { siteService } from '@/services'
import type { SiteSettings } from '@/types'

export function SettingsManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [unlockSlug, setUnlockSlug] = useState(false)

  useEffect(() => {
    void siteService.getSettings().then(setSettings)
  }, [])

  async function save() {
    if (!settings) return
    setSaving(true)
    try {
      const next = await siteService.updateSettings({
        ...settings,
        slugLocked: !unlockSlug,
      })
      setSettings(next)
      setUnlockSlug(false)
      toast.success('Settings saved to cloud')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!settings) return <p className="text-muted">Loading…</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">Settings</h1>
          <p className="mt-1 text-sm text-muted">Business and brand configuration.</p>
        </div>
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid gap-6">
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold">
            Business
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              <span className="mb-1.5 block text-muted-light">Business Name</span>
              <input
                className="field-input"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1.5 flex items-center gap-2 text-muted-light">
                Business Slug
                {settings.slugLocked && !unlockSlug ? (
                  <Lock className="h-3.5 w-3.5 text-gold" />
                ) : (
                  <Unlock className="h-3.5 w-3.5 text-gold" />
                )}
              </span>
              <div className="flex gap-2">
                <input
                  className="field-input flex-1"
                  value={settings.slug}
                  disabled={settings.slugLocked && !unlockSlug}
                  onChange={(e) => setSettings({ ...settings, slug: e.target.value })}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setUnlockSlug((v) => !v)}
                >
                  {unlockSlug ? 'Lock' : 'Unlock'}
                </Button>
              </div>
              <span className="mt-1 block text-xs text-muted">
                Default: {SITE_SLUG}. Keep locked to avoid affecting other sites in the shared
                database.
              </span>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-light">Baguio Globe</span>
              <input
                className="field-input"
                value={settings.phoneGlobe ?? settings.phone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    phoneGlobe: e.target.value,
                    phone: e.target.value,
                  })
                }
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-light">Baguio Smart</span>
              <input
                className="field-input"
                value={settings.phoneSmart ?? ''}
                onChange={(e) => setSettings({ ...settings, phoneSmart: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-light">Parañaque Smart / TNT</span>
              <input
                className="field-input"
                value={settings.secondaryPhone ?? ''}
                onChange={(e) => setSettings({ ...settings, secondaryPhone: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-light">Parañaque Phone Label</span>
              <input
                className="field-input"
                value={settings.secondaryPhoneLabel ?? ''}
                onChange={(e) =>
                  setSettings({ ...settings, secondaryPhoneLabel: e.target.value })
                }
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-light">Baguio Email</span>
              <input
                className="field-input"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-light">Baclaran Email</span>
              <input
                className="field-input"
                type="email"
                value={settings.secondaryEmail ?? ''}
                onChange={(e) => setSettings({ ...settings, secondaryEmail: e.target.value })}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1.5 block text-muted-light">Primary Address (Baguio)</span>
              <input
                className="field-input"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-light">Primary Location Label</span>
              <input
                className="field-input"
                value={settings.addressLabel ?? ''}
                onChange={(e) => setSettings({ ...settings, addressLabel: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-light">Branch Location Label</span>
              <input
                className="field-input"
                value={settings.secondaryAddressLabel ?? ''}
                onChange={(e) =>
                  setSettings({ ...settings, secondaryAddressLabel: e.target.value })
                }
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1.5 block text-muted-light">Branch Address (Parañaque)</span>
              <input
                className="field-input"
                value={settings.secondaryAddress ?? ''}
                onChange={(e) => setSettings({ ...settings, secondaryAddress: e.target.value })}
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold">Brand</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUpload
              label="Logo"
              folder="logo"
              value={settings.logoUrl}
              onChange={(url) => setSettings({ ...settings, logoUrl: url })}
            />
            <ImageUpload
              label="Favicon"
              folder="logo"
              value={settings.faviconUrl}
              onChange={(url) => setSettings({ ...settings, faviconUrl: url })}
            />
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-light">Primary Gold</span>
              <input
                className="field-input"
                value={settings.primaryGold}
                onChange={(e) => setSettings({ ...settings, primaryGold: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-light">Background Color</span>
              <input
                className="field-input"
                value={settings.backgroundColor}
                onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  )
}
