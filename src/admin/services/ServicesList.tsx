import { useEffect, useState } from 'react'
import { Copy, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Modal } from '@/components/common/Modal'
import { ServiceForm } from '@/admin/services/ServiceForm'
import { formatDuration } from '@/lib/utils'
import { serviceService } from '@/services'
import type { Service } from '@/types'

export function ServicesList() {
  const [items, setItems] = useState<Service[]>([])
  const [editing, setEditing] = useState<Service | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function refresh() {
    setItems(await serviceService.list(true))
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">Services</h1>
          <p className="mt-1 text-sm text-muted">
            Manage spa treatments by category. Prices stay internal and are hidden on the public site.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <img src={item.imageUrl} alt="" className="h-12 w-16 rounded object-cover" />
                </td>
                <td className="px-4 py-3 text-cream">{item.name}</td>
                <td className="px-4 py-3 text-muted">{item.category}</td>
                <td className="px-4 py-3 text-muted">
                  {item.durationLabel || formatDuration(item.duration)}
                </td>
                <td className="px-4 py-3">
                  <span className={item.active ? 'text-emerald-300' : 'text-muted'}>
                    {item.active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{item.featured ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  <RowActions
                    item={item}
                    onEdit={() => setEditing(item)}
                    onToggle={async () => {
                      await serviceService.update(item.id, { active: !item.active })
                      toast.success(item.active ? 'Service hidden' : 'Service activated')
                      await refresh()
                    }}
                    onDuplicate={async () => {
                      await serviceService.duplicate(item.id)
                      toast.success('Service duplicated')
                      await refresh()
                    }}
                    onDelete={() => setDeleteId(item.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex gap-3">
              <img src={item.imageUrl} alt="" className="h-16 w-20 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-cream">{item.name}</p>
                <p className="text-sm text-gold">
                  {item.durationLabel || formatDuration(item.duration)}
                </p>
                <p className="text-xs text-muted">{item.category}</p>
              </div>
            </div>
            <div className="mt-3">
              <RowActions
                item={item}
                onEdit={() => setEditing(item)}
                onToggle={async () => {
                  await serviceService.update(item.id, { active: !item.active })
                  await refresh()
                }}
                onDuplicate={async () => {
                  await serviceService.duplicate(item.id)
                  await refresh()
                }}
                onDelete={() => setDeleteId(item.id)}
              />
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
        title={editing ? 'Edit Service' : 'Add Service'}
        size="xl"
      >
        <ServiceForm
          initial={editing}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSaved={async () => {
            setCreating(false)
            setEditing(null)
            toast.success('Service saved')
            await refresh()
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete service?"
        message="This will permanently remove the service from the website."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return
          await serviceService.remove(deleteId)
          setDeleteId(null)
          toast.success('Service deleted')
          await refresh()
        }}
      />
    </div>
  )
}

function RowActions({
  item,
  onEdit,
  onToggle,
  onDuplicate,
  onDelete,
}: {
  item: Service
  onEdit: () => void
  onToggle: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex flex-wrap gap-1">
      <IconBtn label="Edit" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </IconBtn>
      <IconBtn label="Duplicate" onClick={onDuplicate}>
        <Copy className="h-4 w-4" />
      </IconBtn>
      <IconBtn label={item.active ? 'Hide' : 'Show'} onClick={onToggle}>
        {item.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </IconBtn>
      <IconBtn label="Delete" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </IconBtn>
    </div>
  )
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-md border border-border p-2 text-muted transition hover:border-gold/30 hover:text-cream"
    >
      {children}
    </button>
  )
}
