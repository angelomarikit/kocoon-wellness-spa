/**
 * In-memory + localStorage store for CMS mock data.
 * When Supabase is connected, replace repository methods — components stay unchanged.
 */

const STORAGE_PREFIX = 'kocoon-cms:'

export function loadStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (!raw) return structuredClone(fallback)
    return JSON.parse(raw) as T
  } catch {
    return structuredClone(fallback)
  }
}

export function saveStore<T>(key: string, value: T): void {
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
}

export function delay(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}
