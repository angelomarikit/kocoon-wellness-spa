import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks/useAuth'

export function AdminLoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from?: string }).from !== '/admin/login'
      ? (location.state as { from: string }).from
      : '/admin'

  if (user) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 ambient-glow">
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="w-full max-w-md rounded-2xl border border-gold/20 bg-bg-elevated p-8 shadow-card"
      >
        <img src="/logo.png" alt="Kocoon Wellness Spa" className="mx-auto mb-6 h-24 w-auto max-w-[280px] bg-transparent object-contain" />
        <h1 className="text-center font-display text-2xl text-cream">Admin Login</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Sign in to manage Kocoon Wellness Spa content.
        </p>

        <label className="mt-8 block text-sm">
          <span className="mb-1.5 block text-muted-light">Email</span>
          <input
            className="field-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="mt-4 block text-sm">
          <span className="mb-1.5 block text-muted-light">Password</span>
          <input
            className="field-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
        <p className="mt-4 text-center text-xs text-muted">
          Auth is prepared for Supabase. Demo: any email/password works locally.
        </p>
      </form>
    </div>
  )
}
