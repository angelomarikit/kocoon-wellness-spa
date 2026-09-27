import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isDurableImageUrl, uploadSiteImage, type UploadFolder } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  className?: string
  folder?: UploadFolder
}

function displayUrl(url: string): string {
  if (url.startsWith('data:') || url.startsWith('blob:')) return ''
  return url
}

export function ImageUpload({
  value,
  onChange,
  label = 'Image',
  className,
  folder = 'content',
}: ImageUploadProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [urlDraft, setUrlDraft] = useState(displayUrl(value ?? ''))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')
  const onChangeRef = useRef(onChange)
  const draftRef = useRef(urlDraft)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    setUrlDraft(displayUrl(value ?? ''))
    draftRef.current = displayUrl(value ?? '')
  }, [value])

  function commitUrl(raw: string, opts?: { quiet?: boolean }) {
    const next = raw.trim()
    setUrlDraft(raw)
    draftRef.current = raw
    if (!next || next.startsWith('data:') || next.startsWith('blob:')) return false
    if (!isDurableImageUrl(next)) return false
    onChangeRef.current(next)
    if (!opts?.quiet) {
      setHint('Image URL ready — click Save to keep it.')
      setError('')
    }
    return true
  }

  // Before any parent <form> Save/submit, push the draft URL into form state
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const form = root.closest('form')
    if (!form) return

    const flush = () => {
      const next = draftRef.current.trim()
      if (next && isDurableImageUrl(next) && !next.startsWith('data:') && !next.startsWith('blob:')) {
        onChangeRef.current(next)
      }
    }

    form.addEventListener('submit', flush, true)
    return () => form.removeEventListener('submit', flush, true)
  }, [])

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, or WebP).')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Please use a file under 10MB.')
      return
    }
    if (!isSupabaseConfigured()) {
      setError(
        'Supabase keys missing. Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY, run storage SQL, then redeploy.',
      )
      return
    }

    setBusy(true)
    setError('')
    setHint('Uploading to Supabase Storage…')
    try {
      const result = await uploadSiteImage(file, folder)
      if (!isDurableImageUrl(result.url)) {
        throw new Error('Upload did not return a permanent URL.')
      }
      onChangeRef.current(result.url)
      setUrlDraft(result.url)
      draftRef.current = result.url
      setHint('Uploaded — click Save to keep this photo on the site.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      setHint('')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div ref={rootRef} className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-muted-light">{label}</label>
      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-border bg-bg">
          <img
            src={value}
            alt=""
            className="h-40 w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.opacity = '0.25'
            }}
          />
          <button
            type="button"
            onClick={() => {
              onChangeRef.current('')
              setUrlDraft('')
              draftRef.current = ''
              setError('')
              setHint('')
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
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg text-muted transition hover:border-gold/40 hover:text-gold disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
          <span className="text-sm">{busy ? 'Uploading to Storage…' : 'Upload image'}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <input
        type="url"
        value={urlDraft}
        onChange={(e) => commitUrl(e.target.value, { quiet: true })}
        onBlur={() => commitUrl(urlDraft)}
        placeholder="Or paste a permanent image URL"
        className="admin-input w-full"
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {hint ? <p className="text-xs text-gold/90">{hint}</p> : null}
      <p className="text-xs text-muted">
        Upload or paste a URL, then click <span className="text-cream">Save</span> — Apply is no longer
        needed. Files go to <code className="text-gold/80">kocoon-media</code>.
      </p>
    </div>
  )
}
