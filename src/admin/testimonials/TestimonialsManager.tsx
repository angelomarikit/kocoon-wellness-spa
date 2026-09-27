import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Modal } from '@/components/common/Modal'
import { testimonialService } from '@/services'
import type { Testimonial } from '@/types'

export function TestimonialsManager() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function refresh() {
    setItems(await testimonialService.list(true))
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">Testimonials</h1>
          <p className="mt-1 text-sm text-muted">Publish guest feedback on the website.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <p className="font-medium text-cream">{item.clientName}</p>
              <p className="text-xs text-gold">{item.rating}/5 · {item.date}</p>
              <p className="mt-2 text-sm text-muted">{item.message}</p>
              <p className="mt-2 text-xs text-muted-light">
                {item.published ? 'Published' : 'Draft'}
                {item.featured ? ' · Featured' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-border p-2 text-muted"
                onClick={() => setEditing(item)}
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-md border border-border p-2 text-muted"
                onClick={() => setDeleteId(item.id)}
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={creating || !!editing}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        title={editing ? 'Edit Testimonial' : 'Add Testimonial'}
      >
        <TestimonialForm
          initial={editing}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSaved={async () => {
            setCreating(false)
            setEditing(null)
            toast.success('Testimonial saved')
            await refresh()
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete testimonial?"
        message="This testimonial will be removed."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return
          await testimonialService.remove(deleteId)
          setDeleteId(null)
          toast.success('Deleted')
          await refresh()
        }}
      />
    </div>
  )
}

function TestimonialForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Testimonial | null
  onSaved: () => void
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    clientName: initial?.clientName ?? '',
    rating: initial?.rating ?? 5,
    message: initial?.message ?? '',
    imageUrl: initial?.imageUrl ?? '',
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    featured: initial?.featured ?? false,
    published: initial?.published ?? true,
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (initial) await testimonialService.update(initial.id, form)
      else await testimonialService.create(form)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="grid gap-4">
      <label className="text-sm">
        <span className="mb-1.5 block text-muted-light">Client Name</span>
        <input
          className="field-input"
          required
          value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">Rating</span>
          <input
            className="field-input"
            type="number"
            min={1}
            max={5}
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">Date</span>
          <input
            className="field-input"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>
      </div>
      <label className="text-sm">
        <span className="mb-1.5 block text-muted-light">Testimonial</span>
        <textarea
          className="field-input min-h-28"
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
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
