import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Modal } from '@/components/common/Modal'
import { faqService } from '@/services'
import type { FAQItem } from '@/types'

export function FAQManager() {
  const [items, setItems] = useState<FAQItem[]>([])
  const [editing, setEditing] = useState<FAQItem | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function refresh() {
    setItems(await faqService.list(true))
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">FAQ</h1>
          <p className="mt-1 text-sm text-muted">Manage frequently asked questions.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:justify-between"
          >
            <div>
              <p className="font-medium text-cream">{item.question}</p>
              <p className="mt-1 text-sm text-muted">{item.answer}</p>
              <p className="mt-2 text-xs text-muted-light">
                Order {item.sortOrder} · {item.active ? 'Active' : 'Hidden'}
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
        title={editing ? 'Edit FAQ' : 'Add FAQ'}
      >
        <FAQForm
          initial={editing}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSaved={async () => {
            setCreating(false)
            setEditing(null)
            toast.success('FAQ saved')
            await refresh()
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete FAQ?"
        message="This question will be removed."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return
          await faqService.remove(deleteId)
          setDeleteId(null)
          toast.success('Deleted')
          await refresh()
        }}
      />
    </div>
  )
}

function FAQForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: FAQItem | null
  onSaved: () => void
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    question: initial?.question ?? '',
    answer: initial?.answer ?? '',
    active: initial?.active ?? true,
    sortOrder: initial?.sortOrder ?? 99,
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (initial) await faqService.update(initial.id, form)
      else await faqService.create(form)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="grid gap-4">
      <label className="text-sm">
        <span className="mb-1.5 block text-muted-light">Question</span>
        <input
          className="field-input"
          required
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block text-muted-light">Answer</span>
        <textarea
          className="field-input min-h-28"
          required
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Active
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
