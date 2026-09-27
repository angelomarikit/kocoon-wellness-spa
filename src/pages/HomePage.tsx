import { useEffect, useRef, useState } from 'react'
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
  mockFaqs,
  mockGallery,
  mockPageContent,
  mockSEO,
  mockServices,
  mockSettings,
  mockStaff,
  mockTestimonials,
} from '@/data/mockData'
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

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.warn('[home] load failed, using fallback', err)
    return fallback
  }
}

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
  const loadedOnce = useRef(false)

  useEffect(() => {
    let mounted = true
    let lastFetch = 0

    async function load(opts?: { soft?: boolean }) {
      const now = Date.now()
      if (opts?.soft && now - lastFetch < 2000) return
      lastFetch = now
      try {
        const [s, se, c, svc, st, g, t, f] = await Promise.all([
          safe(() => siteService.getSettings(), mockSettings),
          safe(() => siteService.getSEO(), mockSEO),
          safe(() => siteService.getPageContent(), mockPageContent),
          safe(() => serviceService.list(), mockServices.filter((x) => x.active)),
          safe(() => staffService.list(), mockStaff.filter((x) => x.active)),
          safe(() => galleryService.list(), mockGallery.filter((x) => x.active)),
          safe(() => testimonialService.list(), mockTestimonials.filter((x) => x.published)),
          safe(() => faqService.list(), mockFaqs.filter((x) => x.active)),
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
        loadedOnce.current = true
      } catch (err) {
        console.warn('[home] unexpected load error', err)
        if (!mounted || loadedOnce.current) return
        setSettings(mockSettings)
        setSeo(mockSEO)
        setContent(mockPageContent)
        setServices(mockServices.filter((x) => x.active))
        setStaff(mockStaff.filter((x) => x.active))
        setGallery(mockGallery.filter((x) => x.active))
        setTestimonials(mockTestimonials.filter((x) => x.published))
        setFaqs(mockFaqs.filter((x) => x.active))
      } finally {
        if (mounted && !opts?.soft) setLoading(false)
      }
    }

    void load()

    // Re-fetch when the tab becomes visible so admin CMS edits show on the live site
    // without waiting for a hard reload or getting stuck on a stale first paint.
    function onVisible() {
      if (document.visibilityState === 'visible') void load({ soft: true })
    }
    function onFocus() {
      void load({ soft: true })
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onFocus)

    return () => {
      mounted = false
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  if (loading || !settings || !seo || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="text-center">
          <img
            src="/logo.png"
            alt=""
            className="mx-auto mb-4 h-20 w-auto max-w-[200px] animate-pulse bg-transparent object-contain"
          />
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
        <WhyChoose content={content.whyChoose} />
        <Services services={services} />
        <Experience content={content.experience} />
        <Team staff={staff} />
        <Gallery items={gallery} />
        <Testimonials items={testimonials} />
        <BookingCta content={content.bookingCta} />
        <FAQ items={faqs} />
        <Contact settings={settings} />
      </main>
      <Footer settings={settings} content={content.footer} />
    </>
  )
}
