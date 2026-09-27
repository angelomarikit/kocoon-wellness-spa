import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/common/Button'
import { ImageUpload } from '@/components/common/ImageUpload'
import { siteService } from '@/services'
import type { SEOSettings } from '@/types'

export function SEOManager() {
  const [seo, setSeo] = useState<SEOSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [keywordsText, setKeywordsText] = useState('')

  useEffect(() => {
    void siteService.getSEO().then((data) => {
      setSeo(data)
      setKeywordsText(data.keywords.join(', '))
    })
  }, [])

  async function save() {
    if (!seo) return
    setSaving(true)
    try {
      const next = await siteService.updateSEO({
        ...seo,
        keywords: keywordsText
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      })
      setSeo(next)
      toast.success('SEO settings saved to cloud')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save SEO')
    } finally {
      setSaving(false)
    }
  }

  if (!seo) return <p className="text-muted">Loading…</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">SEO</h1>
          <p className="mt-1 text-sm text-muted">Search and social metadata for the public site.</p>
        </div>
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save SEO'}
        </Button>
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">Website Title</span>
          <input
            className="field-input"
            value={seo.title}
            onChange={(e) => setSeo({ ...seo, title: e.target.value })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">Meta Description</span>
          <textarea
            className="field-input min-h-24"
            value={seo.metaDescription}
            onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">SEO Keywords (comma-separated)</span>
          <textarea
            className="field-input min-h-20"
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">OG Title</span>
            <input
              className="field-input"
              value={seo.ogTitle}
              onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">Canonical URL</span>
            <input
              className="field-input"
              value={seo.canonicalUrl}
              onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
            />
          </label>
        </div>
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">OG Description</span>
          <textarea
            className="field-input"
            value={seo.ogDescription}
            onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
          />
        </label>
        <ImageUpload
          label="OG Image"
          folder="seo"
          value={seo.ogImage}
          onChange={(url) => setSeo({ ...seo, ogImage: url })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">Facebook URL</span>
            <input
              className="field-input"
              value={seo.facebookUrl}
              onChange={(e) => setSeo({ ...seo, facebookUrl: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">Instagram URL</span>
            <input
              className="field-input"
              value={seo.instagramUrl}
              onChange={(e) => setSeo({ ...seo, instagramUrl: e.target.value })}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
