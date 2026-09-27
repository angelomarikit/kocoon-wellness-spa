import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/common/Button'
import { ImageUpload } from '@/components/common/ImageUpload'
import { siteService } from '@/services'
import type { PageContent } from '@/types'

const TABS = [
  'Hero',
  'Welcome',
  'About',
  'Why Choose Us',
  'Experience',
  'Booking CTA',
  'Footer',
] as const

type Tab = (typeof TABS)[number]

export function ContentManager() {
  const [tab, setTab] = useState<Tab>('Hero')
  const [content, setContent] = useState<PageContent | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void siteService.getPageContent().then(setContent)
  }, [])

  async function save() {
    if (!content) return
    setSaving(true)
    try {
      const next = await siteService.updatePageContent(content)
      setContent(next)
      toast.success('Page content saved to cloud')
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to save content. Check Supabase connection.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!content) return <p className="text-muted">Loading content…</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">Page Content</h1>
          <p className="mt-1 text-sm text-muted">
            Edit landing page sections. Saves go to Supabase so every browser (including Incognito) sees the same content.
          </p>
        </div>
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-2 text-sm ${
              tab === t ? 'bg-gold/15 text-gold' : 'text-muted hover:text-cream'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        {tab === 'Hero' && (
          <div className="grid gap-4">
            <Field label="Badge">
              <input
                className="field-input"
                value={content.hero.badge}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, badge: e.target.value } })
                }
              />
            </Field>
            <Field label="Title (use new lines for breaks)">
              <textarea
                className="field-input min-h-28"
                value={content.hero.title}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, title: e.target.value } })
                }
              />
            </Field>
            <Field label="Description">
              <textarea
                className="field-input min-h-24"
                value={content.hero.description}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, description: e.target.value },
                  })
                }
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary Button">
                <input
                  className="field-input"
                  value={content.hero.primaryButton}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, primaryButton: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Secondary Button">
                <input
                  className="field-input"
                  value={content.hero.secondaryButton}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, secondaryButton: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
            <ImageUpload
              label="Hero Image (poster / fallback)"
              folder="hero"
              value={content.hero.imageUrl}
              onChange={(url) =>
                setContent({ ...content, hero: { ...content.hero, imageUrl: url } })
              }
            />
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-light">Hero Video URL (autoplay, muted)</span>
              <input
                className="field-input"
                value={content.hero.videoUrl ?? ''}
                placeholder="/hero.mp4"
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, videoUrl: e.target.value } })
                }
              />
              <span className="mt-1 block text-xs text-muted">
                Leave blank to use the image only. Video should be landscape ~16:9 and ideally 1280px+
                wide.
              </span>
            </label>
          </div>
        )}

        {tab === 'Welcome' && (
          <div className="grid gap-4">
            <Field label="Heading">
              <input
                className="field-input"
                value={content.welcome.heading}
                onChange={(e) =>
                  setContent({
                    ...content,
                    welcome: { ...content.welcome, heading: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Subheading">
              <input
                className="field-input"
                value={content.welcome.subheading}
                onChange={(e) =>
                  setContent({
                    ...content,
                    welcome: { ...content.welcome, subheading: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Body">
              <textarea
                className="field-input min-h-32"
                value={content.welcome.body}
                onChange={(e) =>
                  setContent({
                    ...content,
                    welcome: { ...content.welcome, body: e.target.value },
                  })
                }
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CTA Label">
                <input
                  className="field-input"
                  value={content.welcome.ctaLabel}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      welcome: { ...content.welcome, ctaLabel: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="CTA Link">
                <input
                  className="field-input"
                  value={content.welcome.ctaHref}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      welcome: { ...content.welcome, ctaHref: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
            <ImageUpload
              label="Image"
              folder="hero"
              value={content.welcome.imageUrl}
              onChange={(url) =>
                setContent({ ...content, welcome: { ...content.welcome, imageUrl: url } })
              }
            />
          </div>
        )}

        {tab === 'About' && (
          <div className="grid gap-4">
            <Field label="Section Label">
              <input
                className="field-input"
                value={content.about.eyebrow}
                onChange={(e) =>
                  setContent({ ...content, about: { ...content.about, eyebrow: e.target.value } })
                }
              />
            </Field>
            <Field label="Title">
              <input
                className="field-input"
                value={content.about.title}
                onChange={(e) =>
                  setContent({ ...content, about: { ...content.about, title: e.target.value } })
                }
              />
            </Field>
            <Field label="Description">
              <textarea
                className="field-input min-h-24"
                value={content.about.description}
                onChange={(e) =>
                  setContent({
                    ...content,
                    about: { ...content.about, description: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Secondary Description">
              <textarea
                className="field-input min-h-24"
                value={content.about.secondaryDescription}
                onChange={(e) =>
                  setContent({
                    ...content,
                    about: { ...content.about, secondaryDescription: e.target.value },
                  })
                }
              />
            </Field>
            <ImageUpload
              label="About Image"
              folder="hero"
              value={content.about.imageUrl}
              onChange={(url) =>
                setContent({ ...content, about: { ...content.about, imageUrl: url } })
              }
            />
            <div>
              <p className="mb-3 text-sm font-medium text-muted-light">Statistics</p>
              <div className="space-y-3">
                {content.about.stats.map((stat, idx) => (
                  <div key={stat.id} className="grid gap-3 sm:grid-cols-2">
                    <input
                      className="field-input"
                      value={stat.value}
                      placeholder="Value"
                      onChange={(e) => {
                        const stats = [...content.about.stats]
                        stats[idx] = { ...stat, value: e.target.value }
                        setContent({ ...content, about: { ...content.about, stats } })
                      }}
                    />
                    <input
                      className="field-input"
                      value={stat.label}
                      placeholder="Label"
                      onChange={(e) => {
                        const stats = [...content.about.stats]
                        stats[idx] = { ...stat, label: e.target.value }
                        setContent({ ...content, about: { ...content.about, stats } })
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'Why Choose Us' && (
          <div className="grid gap-4">
            <Field label="Title">
              <input
                className="field-input"
                value={content.whyChoose.title}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whyChoose: { ...content.whyChoose, title: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Subtitle">
              <input
                className="field-input"
                value={content.whyChoose.subtitle}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whyChoose: { ...content.whyChoose, subtitle: e.target.value },
                  })
                }
              />
            </Field>
            {content.whyChoose.cards.map((card, idx) => (
              <div key={card.id} className="rounded-lg border border-border p-4">
                <p className="mb-3 text-xs uppercase tracking-wider text-gold">Card {idx + 1}</p>
                <div className="grid gap-3">
                  <input
                    className="field-input"
                    value={card.title}
                    onChange={(e) => {
                      const cards = [...content.whyChoose.cards]
                      cards[idx] = { ...card, title: e.target.value }
                      setContent({ ...content, whyChoose: { ...content.whyChoose, cards } })
                    }}
                  />
                  <textarea
                    className="field-input"
                    value={card.description}
                    onChange={(e) => {
                      const cards = [...content.whyChoose.cards]
                      cards[idx] = { ...card, description: e.target.value }
                      setContent({ ...content, whyChoose: { ...content.whyChoose, cards } })
                    }}
                  />
                  <input
                    className="field-input"
                    value={card.icon}
                    placeholder="Lucide icon name"
                    onChange={(e) => {
                      const cards = [...content.whyChoose.cards]
                      cards[idx] = { ...card, icon: e.target.value }
                      setContent({ ...content, whyChoose: { ...content.whyChoose, cards } })
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Experience' && (
          <div className="grid gap-4">
            <Field label="Title">
              <textarea
                className="field-input min-h-24"
                value={content.experience.title}
                onChange={(e) =>
                  setContent({
                    ...content,
                    experience: { ...content.experience, title: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Description">
              <textarea
                className="field-input min-h-24"
                value={content.experience.description}
                onChange={(e) =>
                  setContent({
                    ...content,
                    experience: { ...content.experience, description: e.target.value },
                  })
                }
              />
            </Field>
            <ImageUpload
              label="Background Image"
              folder="hero"
              value={content.experience.backgroundImageUrl}
              onChange={(url) =>
                setContent({
                  ...content,
                  experience: { ...content.experience, backgroundImageUrl: url },
                })
              }
            />
          </div>
        )}

        {tab === 'Booking CTA' && (
          <div className="grid gap-4">
            <Field label="Title">
              <input
                className="field-input"
                value={content.bookingCta.title}
                onChange={(e) =>
                  setContent({
                    ...content,
                    bookingCta: { ...content.bookingCta, title: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Description">
              <textarea
                className="field-input"
                value={content.bookingCta.description}
                onChange={(e) =>
                  setContent({
                    ...content,
                    bookingCta: { ...content.bookingCta, description: e.target.value },
                  })
                }
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Primary Button">
                <input
                  className="field-input"
                  value={content.bookingCta.primaryButton}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      bookingCta: { ...content.bookingCta, primaryButton: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Secondary Button">
                <input
                  className="field-input"
                  value={content.bookingCta.secondaryButton}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      bookingCta: { ...content.bookingCta, secondaryButton: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Tertiary Button">
                <input
                  className="field-input"
                  value={content.bookingCta.tertiaryButton}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      bookingCta: { ...content.bookingCta, tertiaryButton: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
          </div>
        )}

        {tab === 'Footer' && (
          <Field label="Footer Description">
            <textarea
              className="field-input min-h-28"
              value={content.footer.description}
              onChange={(e) =>
                setContent({
                  ...content,
                  footer: { ...content.footer, description: e.target.value },
                })
              }
            />
          </Field>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted-light">{label}</span>
      {children}
    </label>
  )
}
