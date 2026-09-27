import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from '@/hooks/useAuth'
import type { AdminUser } from '@/types'

const AUTH_KEY = 'kocoon-admin-session'

/**
 * Mock auth for local CMS. Replace with Supabase Auth:
 * supabase.auth.signInWithPassword / signOut / onAuthStateChange
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY)
      if (raw) setUser(JSON.parse(raw) as AdminUser)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      async login(email: string, _password: string) {
        // Demo gate: any non-empty credentials work until Supabase Auth is connected
        if (!email.trim() || !_password.trim()) {
          throw new Error('Email and password are required')
        }
        const next: AdminUser = {
          id: 'admin-1',
          email: email.trim(),
          name: 'Kocoon Admin',
        }
        localStorage.setItem(AUTH_KEY, JSON.stringify(next))
        setUser(next)
      },
      async logout() {
        localStorage.removeItem(AUTH_KEY)
        setUser(null)
      },
    }),
    [user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
