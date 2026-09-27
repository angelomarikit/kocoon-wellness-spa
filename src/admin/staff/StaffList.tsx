import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ImageUpload } from '@/components/common/ImageUpload'
import { Modal } from '@/components/common/Modal'
import { staffService } from '@/services'
import type { StaffMember } from '@/types'

export function StaffList() {
  const [items, setItems] = useState<StaffMember[]>([])
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function refresh() {
    setItems(await staffService.list(true))
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">Staff</h1>
          <p className="mt-1 text-sm text-muted">Manage therapists and wellness team profiles.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="aspect-[4/3] w-full bg-bg">
              {item.imageUrl && !item.imageUrl.startsWith('blob:') ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted">
                  No photo — re-upload
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-cream">{item.name}</h3>
              <p className="text-sm text-gold">{item.position}</p>
              <p className="mt-1 text-xs text-muted">{item.specialty}</p>
              <p className="mt-2 text-xs text-muted-light">
                {item.active ? 'Active' : 'Hidden'}
                {item.featured ? ' · Featured' : ''}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-md border border-border p-2 text-muted hover:text-cream"
                  onClick={() => setEditing(item)}
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-md border border-border p-2 text-muted hover:text-cream"
                  onClick={() => setDeleteId(item.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
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
        title={editing ? 'Edit Staff' : 'Add Staff'}
      >
        <StaffForm
          initial={editing}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSaved={async () => {
            setCreating(false)
            setEditing(null)
            toast.success('Staff saved')
            await refresh()
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete staff member?"
        message="This profile will be removed from the website."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return
          await staffService.remove(deleteId)
          setDeleteId(null)
          toast.success('Staff deleted')
          await refresh()
        }}
      />
    </div>
  )
}

function StaffForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: StaffMember | null
  onSaved: () => void
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    position: initial?.position ?? '',
    specialty: initial?.specialty ?? '',
    bio: initial?.bio ?? '',
    credentials: initial?.credentials ?? '',
    yearsExperience: initial?.yearsExperience ?? 1,
    imageUrl: initial?.imageUrl ?? '',
    socialUrl: initial?.socialUrl ?? '',
    featured: initial?.featured ?? false,
    active: initial?.active ?? true,
    sortOrder: initial?.sortOrder ?? 99,
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (initial) await staffService.update(initial.id, form)
      else await staffService.create(form)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="grid gap-4">
      <ImageUpload
        label="Photo"
        folder="staff"
        value={form.imageUrl}
        onChange={(url) => setForm({ ...form, imageUrl: url })}
      />
      <label className="text-sm">
        <span className="mb-1.5 block text-muted-light">Full Name</span>
        <input
          className="field-input"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">Position</span>
          <input
            className="field-input"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">Specialty</span>
          <input
            className="field-input"
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
          />
        </label>
      </div>
      <label className="text-sm">
        <span className="mb-1.5 block text-muted-light">Introduction</span>
        <textarea
          className="field-input"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">Credentials</span>
          <input
            className="field-input"
            value={form.credentials}
            onChange={(e) => setForm({ ...form, credentials: e.target.value })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-light">Years of Experience</span>
          <input
            className="field-input"
            type="number"
            min={0}
            value={form.yearsExperience}
            onChange={(e) => setForm({ ...form, yearsExperience: Number(e.target.value) })}
          />
        </label>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Active
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
