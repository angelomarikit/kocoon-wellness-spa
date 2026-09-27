import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Dismiss"
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-card"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 id="confirm-title" className="font-display text-xl text-cream">
              {title}
            </h3>
            <p id="confirm-desc" className="mt-2 text-sm text-muted">
              {message}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={onCancel}>
                {cancelLabel}
              </Button>
              <Button
                variant={danger ? 'outline' : 'primary'}
                className={danger ? 'border-red-400/50 text-red-300 hover:bg-red-500/10' : ''}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
