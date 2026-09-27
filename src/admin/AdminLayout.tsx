import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  FileText,
  HelpCircle,
  Image,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquareQuote,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/content', label: 'Page Content', icon: FileText },
  { to: '/admin/services', label: 'Services', icon: Sparkles },
  { to: '/admin/staff', label: 'Staff', icon: Users },
  { to: '/admin/gallery', label: 'Gallery', icon: Image },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { to: '/admin/faq', label: 'FAQ', icon: HelpCircle },
  { to: '/admin/contact', label: 'Contact & Location', icon: MapPin },
  { to: '/admin/seo', label: 'SEO', icon: Search },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/admin/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-5">
        <img src="/logo.png" alt="Kocoon" className="mb-3 h-12 w-auto max-w-[140px] bg-transparent object-contain object-left" />
        <p className="text-sm font-semibold text-cream">Kocoon Admin</p>
        <p className="truncate text-xs text-muted">{user?.email}</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                isActive
                  ? 'bg-gold/15 text-gold'
                  : 'text-muted-light hover:bg-white/5 hover:text-cream',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-light transition hover:bg-white/5 hover:text-cream"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg text-cream lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-bg-elevated lg:block">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-bg-elevated">
            <button
              type="button"
              className="absolute right-3 top-3 rounded-md p-2 text-muted"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-bg-elevated px-4 py-3 lg:px-8">
          <button
            type="button"
            className="rounded-md border border-border p-2 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <p className="text-sm text-muted">CMS · kocoon-wellness-spa</p>
          </div>
          <a href="/" className="text-sm text-gold hover:text-gold-soft">
            View site
          </a>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
