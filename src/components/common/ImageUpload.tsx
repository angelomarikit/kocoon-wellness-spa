import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  className?: string
  /**
   * Prepares for Supabase Storage path:
   * site-assets/kocoon-wellness-spa/{folder}/...
   * Currently accepts URL paste or local object URL preview.
   */
  folder?: 'logo' | 'hero' | 'services' | 'staff' | 'gallery' | 'seo'
}

export function ImageUpload({ value, onChange, label = 'Image', className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [urlDraft, setUrlDraft] = useState(value ?? '')

  function handleFile(file: File | undefined) {
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    onChange(objectUrl)
    setUrlDraft(objectUrl)
  }

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-muted-light">{label}</label>
      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-border bg-bg">
          <img src={value} alt="" className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange('')
              setUrlDraft('')
            }}
            className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-cream"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg text-muted transition hover:border-gold/40 hover:text-gold"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-sm">Upload or choose image</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="flex gap-2">
        <input
          type="url"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder="Or paste image URL"
          className="admin-input flex-1"
        />
        <button
          type="button"
          className="rounded-md border border-border px-3 text-sm text-cream hover:border-gold/40"
          onClick={() => onChange(urlDraft)}
        >
          Apply
        </button>
      </div>
      <p className="text-xs text-muted">
        Storage-ready: uploads will map to <code className="text-gold/80">site-assets/kocoon-wellness-spa/</code> when
        Supabase Storage is connected.
      </p>
    </div>
  )
}
