import { useEffect, useState } from 'react'
import { SEOHead } from '@/components/common/SEOHead'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { About } from '@/components/sections/About'
import { BookingCta } from '@/components/sections/BookingCta'
import { Contact } from '@/components/sections/Contact'
import { Experience } from '@/components/sections/Experience'
import { FAQ } from '@/components/sections/FAQ'
import { Gallery } from '@/components/sections/Gallery'
import { Hero } from '@/components/sections/Hero'
import { Services } from '@/components/sections/Services'
import { Team } from '@/components/sections/Team'
import { Testimonials } from '@/components/sections/Testimonials'
import { Welcome } from '@/components/sections/Welcome'
import { WhyChoose } from '@/components/sections/WhyChoose'
import {
  faqService,
  galleryService,
  serviceService,
  siteService,
  staffService,
  testimonialService,
} from '@/services'
import type {
  FAQItem,
  GalleryItem,
  PageContent,
  SEOSettings,
  Service,
  SiteSettings,
  StaffMember,
  Testimonial,
} from '@/types'

export function HomePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [seo, setSeo] = useState<SEOSettings | null>(null)
  const [content, setContent] = useState<PageContent | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [s, se, c, svc, st, g, t, f] = await Promise.all([
          siteService.getSettings(),
          siteService.getSEO(),
          siteService.getPageContent(),
          serviceService.list(),
          staffService.list(),
          galleryService.list(),
          testimonialService.list(),
          faqService.list(),
        ])
        if (!mounted) return
        setSettings(s)
        setSeo(se)
        setContent(c)
        setServices(svc)
        setStaff(st)
        setGallery(g)
        setTestimonials(t)
        setFaqs(f)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  if (loading || !settings || !seo || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="text-center">
          <img src="/logo.png" alt="" className="mx-auto mb-4 h-20 w-auto max-w-[200px] animate-pulse bg-transparent object-contain" />
          <p className="text-sm tracking-widest text-gold">KOCOON</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEOHead seo={seo} settings={settings} />
      <Header settings={settings} />
      <main>
        <Hero content={content.hero} />
        <Welcome content={content.welcome} />
        <About content={content.about} />
        <Services services={services} />
        <WhyChoose content={content.whyChoose} />
        <Experience content={content.experience} />
        <Team staff={staff} />
        <Gallery items={gallery} />
        <Testimonials items={testimonials} />
        <BookingCta content={content.bookingCta} settings={settings} />
        <Contact settings={settings} services={services} />
        <FAQ items={faqs} />
      </main>
      <Footer settings={settings} content={content} />
    </>
  )
}
