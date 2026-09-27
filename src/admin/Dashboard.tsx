import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Image,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react'
import { siteService } from '@/services'
import type { DashboardStats } from '@/types'

const QUICK = [
  { to: '/admin/services', label: 'Add Service', icon: Sparkles },
  { to: '/admin/staff', label: 'Add Staff', icon: Users },
  { to: '/admin/gallery', label: 'Upload Gallery Image', icon: Image },
  { to: '/admin/content', label: 'Edit Homepage', icon: FileText },
]

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    void siteService.getDashboardStats().then(setStats)
  }, [])

  const cards = [
    { label: 'Total Services', value: stats?.totalServices ?? '—' },
    { label: 'Active Services', value: stats?.activeServices ?? '—' },
    { label: 'Staff Members', value: stats?.staffMembers ?? '—' },
    { label: 'Gallery Images', value: stats?.galleryImages ?? '—' },
    { label: 'Testimonials', value: stats?.testimonials ?? '—' },
    { label: 'Unread Inquiries', value: stats?.unreadInquiries ?? '—', highlight: true },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-cream">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Overview of Kocoon Wellness Spa website content.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border p-5 ${
              card.highlight ? 'border-gold/40 bg-gold/10' : 'border-border bg-surface'
            }`}
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 font-display text-3xl text-cream">{card.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-4 text-sm text-cream transition hover:border-gold/35"
            >
              <item.icon className="h-4 w-4 text-gold" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold">
          <MessageSquare className="h-4 w-4" />
          Recent Activity
        </h2>
        <p className="text-sm text-muted">
          Activity feed will appear here once Supabase is connected for this site slug.
        </p>
      </div>
    </div>
  )
}
