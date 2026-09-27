import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ProtectedRoute } from '@/admin/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'

const AdminLayout = lazy(() =>
  import('@/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminLoginPage = lazy(() =>
  import('@/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
)
const Dashboard = lazy(() => import('@/admin/Dashboard').then((m) => ({ default: m.Dashboard })))
const ContentManager = lazy(() =>
  import('@/admin/content/ContentManager').then((m) => ({ default: m.ContentManager })),
)
const ServicesList = lazy(() =>
  import('@/admin/services/ServicesList').then((m) => ({ default: m.ServicesList })),
)
const StaffList = lazy(() =>
  import('@/admin/staff/StaffList').then((m) => ({ default: m.StaffList })),
)
const GalleryManager = lazy(() =>
  import('@/admin/gallery/GalleryManager').then((m) => ({ default: m.GalleryManager })),
)
const TestimonialsManager = lazy(() =>
  import('@/admin/testimonials/TestimonialsManager').then((m) => ({
    default: m.TestimonialsManager,
  })),
)
const FAQManager = lazy(() =>
  import('@/admin/faq/FAQManager').then((m) => ({ default: m.FAQManager })),
)
const ContactLocationManager = lazy(() =>
  import('@/admin/contact/ContactLocationManager').then((m) => ({
    default: m.ContactLocationManager,
  })),
)
const SEOManager = lazy(() =>
  import('@/admin/seo/SEOManager').then((m) => ({ default: m.SEOManager })),
)
const SettingsManager = lazy(() =>
  import('@/admin/settings/SettingsManager').then((m) => ({ default: m.SettingsManager })),
)

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">
      Loading admin…
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<AdminFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="content" element={<ContentManager />} />
                  <Route path="services" element={<ServicesList />} />
                  <Route path="staff" element={<StaffList />} />
                  <Route path="gallery" element={<GalleryManager />} />
                  <Route path="testimonials" element={<TestimonialsManager />} />
                  <Route path="faq" element={<FAQManager />} />
                  <Route path="contact" element={<ContactLocationManager />} />
                  <Route path="seo" element={<SEOManager />} />
                  <Route path="settings" element={<SettingsManager />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#151515',
              border: '1px solid rgba(212,175,55,0.25)',
              color: '#F8F6F0',
            },
          }}
        />
      </AuthProvider>
    </HelmetProvider>
  )
}
