/** Convert an uploaded File into a durable data URL (survives reload / localStorage). */

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read image file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Resize/compress photos so CMS uploads persist without breaking blob: URLs
 * and without blowing localStorage quotas.
 */
export async function fileToPersistentUrl(
  file: File,
  options?: { maxEdge?: number; quality?: number },
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return readAsDataURL(file)
  }

  const maxEdge = options?.maxEdge ?? 1400
  const quality = options?.quality ?? 0.85

  // SVG / GIF: keep original bytes (no canvas resize)
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return readAsDataURL(file)
  }

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return readAsDataURL(file)
    }

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const keepPng = file.type === 'image/png'
    return canvas.toDataURL(keepPng ? 'image/png' : 'image/jpeg', quality)
  } catch {
    return readAsDataURL(file)
  }
}

export function isBrokenUploadUrl(url: string | undefined | null): boolean {
  if (!url) return true
  return url.startsWith('blob:')
}
