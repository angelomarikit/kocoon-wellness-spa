import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ImageUpload } from '@/components/common/ImageUpload'
import { Modal } from '@/components/common/Modal'
import { galleryService } from '@/services'
import type { GalleryCategory, GalleryItem } from '@/types'

const CATEGORIES: GalleryCategory[] = [
  'Spa Interior',
  'Treatment Rooms',
  'Services',
  'Team',
  'Wellness Experience',
]

export function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function refresh() {
    setItems(await galleryService.list(true))
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">Gallery</h1>
          <p className="mt-1 text-sm text-muted">Upload and organize spa images.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Upload Image
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-surface">
            <img src={item.imageUrl} alt={item.caption} className="aspect-square w-full object-cover" />
            <div className="p-3">
              <p className="truncate text-sm text-cream">{item.caption || 'Untitled'}</p>
              <p className="text-xs text-muted">
                {item.category} · {item.active ? 'Published' : 'Hidden'}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="rounded-md border border-border p-1.5 text-muted"
                  onClick={() => setEditing(item)}
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded-md border border-border p-1.5 text-muted"
                  onClick={() => setDeleteId(item.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={creating || !!editing}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        title={editing ? 'Edit Image' : 'Upload Image'}
      >
        <GalleryForm
          initial={editing}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSaved={async () => {
            setCreating(false)
            setEditing(null)
            toast.success('Gallery updated')
            await refresh()
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete image?"
        message="This image will be removed from the gallery."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return
          await galleryService.remove(deleteId)
          setDeleteId(null)
          toast.success('Image deleted')
          await refresh()
        }}
      />
    </div>
  )
}

function GalleryForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: GalleryItem | null
  onSaved: () => void
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    imageUrl: initial?.imageUrl ?? '',
    caption: initial?.caption ?? '',
    category: (initial?.category ?? 'Spa Interior') as GalleryCategory,
    featured: initial?.featured ?? false,
    active: initial?.active ?? true,
    sortOrder: initial?.sortOrder ?? 99,
    aspect: (initial?.aspect ?? 'square') as GalleryItem['aspect'],
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (initial) await galleryService.update(initial.id, form)
      else await galleryService.create(form)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="grid gap-4">
      <ImageUpload
        label="Image"
        folder="gallery"
        value={form.imageUrl}
        onChange={(url) => setForm({ ...form, imageUrl: url })}
      />
      <label className="text-sm">
        <span className="mb-1.5 block text-muted-light">Caption</span>
        <input
          className="field-input"
          value={form.caption}
          onChange={(e) => setForm({ ...form, caption: e.target.value })}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block text-muted-light">Category</span>
        <select
          className="field-input"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as GalleryCategory })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block text-muted-light">Gallery Tile Shape</span>
        <select
          className="field-input"
          value={form.aspect}
          onChange={(e) =>
            setForm({ ...form, aspect: e.target.value as GalleryItem['aspect'] })
          }
        >
          <option value="square">Square</option>
          <option value="portrait">Portrait (tall rectangle)</option>
          <option value="landscape">Landscape (wide rectangle)</option>
        </select>
      </label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Featured
        </label>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
