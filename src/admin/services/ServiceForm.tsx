import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { ImageUpload } from '@/components/common/ImageUpload'
import { slugify } from '@/lib/utils'
import { serviceService } from '@/services'
import type { Service } from '@/types'

const TABS = ['Basic Information', 'Pricing', 'Media', 'Description', 'Benefits', 'Publishing'] as const

interface ServiceFormProps {
  initial?: Service | null
  onSaved: () => void
  onCancel: () => void
}

export function ServiceForm({ initial, onSaved, onCancel }: ServiceFormProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Basic Information')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    category: initial?.category ?? 'Traditional Massage',
    shortDescription: initial?.shortDescription ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? 0,
    discountedPrice: initial?.discountedPrice ?? null as number | null,
    duration: initial?.duration ?? 60,
    durationLabel: initial?.durationLabel ?? '',
    imageUrl: initial?.imageUrl ?? '',
    galleryImageUrl: initial?.galleryImageUrl ?? '',
    benefits: initial?.benefits?.join('\n') ?? '',
    inclusions: initial?.inclusions?.join('\n') ?? '',
    featured: initial?.featured ?? false,
    active: initial?.active ?? true,
    sortOrder: initial?.sortOrder ?? 99,
    ctaLabel: initial?.ctaLabel ?? 'View Details',
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        category: form.category,
        shortDescription: form.shortDescription,
        description: form.description,
        price: Number(form.price),
        discountedPrice:
          form.discountedPrice === null || form.discountedPrice === ('' as unknown as number)
            ? null
            : Number(form.discountedPrice),
        duration: Number(form.duration),
        durationLabel: form.durationLabel,
        imageUrl: form.imageUrl,
        galleryImageUrl: form.galleryImageUrl || form.imageUrl,
        benefits: form.benefits
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        inclusions: form.inclusions
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        featured: form.featured,
        active: form.active,
        sortOrder: Number(form.sortOrder),
        ctaLabel: form.ctaLabel,
      }

      if (initial) {
        await serviceService.update(initial.id, payload)
      } else {
        await serviceService.create(payload)
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-xs ${
              tab === t ? 'bg-gold/15 text-gold' : 'text-muted hover:text-cream'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Basic Information' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            <span className="mb-1.5 block text-muted-light">Service Name</span>
            <input
              className="field-input"
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: initial ? form.slug : slugify(e.target.value),
                })
              }
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">Slug</span>
            <input
              className="field-input"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">Category</span>
            <input
              className="field-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1.5 block text-muted-light">Short Description</span>
            <textarea
              className="field-input"
              required
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            />
          </label>
        </div>
      )}

      {tab === 'Pricing' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm sm:col-span-3">
            <span className="mb-1.5 block text-muted-light">
              Duration Label (shown on website, e.g. 1 / 1.5 / 2 Hours)
            </span>
            <input
              className="field-input"
              value={form.durationLabel}
              onChange={(e) => setForm({ ...form, durationLabel: e.target.value })}
              placeholder="1 / 1.5 / 2 Hours"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">Duration minutes (internal)</span>
            <input
              className="field-input"
              type="number"
              min={15}
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">Price (₱, optional / internal)</span>
            <input
              className="field-input"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">Discounted Price</span>
            <input
              className="field-input"
              type="number"
              min={0}
              value={form.discountedPrice ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  discountedPrice: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
          </label>
          <p className="text-xs text-muted sm:col-span-3">
            Prices are kept for admin use only and are not shown on the public website.
          </p>
        </div>
      )}

      {tab === 'Media' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUpload
            label="Thumbnail"
            folder="services"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
          />
          <ImageUpload
            label="Gallery / Detail Image"
            folder="services"
            value={form.galleryImageUrl}
            onChange={(url) => setForm({ ...form, galleryImageUrl: url })}
          />
        </div>
      )}

      {tab === 'Description' && (
        <div className="grid gap-4">
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">Full Description</span>
            <textarea
              className="field-input min-h-36"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">CTA Label</span>
            <input
              className="field-input"
              value={form.ctaLabel}
              onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
            />
          </label>
        </div>
      )}

      {tab === 'Benefits' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">Benefits (one per line)</span>
            <textarea
              className="field-input min-h-36"
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">Inclusions (one per line)</span>
            <textarea
              className="field-input min-h-36"
              value={form.inclusions}
              onChange={(e) => setForm({ ...form, inclusions: e.target.value })}
            />
          </label>
        </div>
      )}

      {tab === 'Publishing' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm text-cream">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-cream">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-light">Sort Order</span>
            <input
              className="field-input"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </label>
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Service'}
        </Button>
      </div>
    </form>
  )
}
