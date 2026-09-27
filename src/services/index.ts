import {
  mockFaqs,
  mockGallery,
  mockInquiries,
  mockPageContent,
  mockSEO,
  mockServices,
  mockSettings,
  mockStaff,
  mockTestimonials,
} from '@/data/mockData'
import { SITE_SLUG } from '@/lib/constants'
import { isDurableImageUrl } from '@/lib/storage'
import { createId, delay, loadStore, saveStore } from '@/lib/store'
import { canUseSupabaseCms, supabaseCms } from '@/services/supabaseCms'
import type {
  DashboardStats,
  FAQItem,
  GalleryItem,
  Inquiry,
  PageContent,
  SEOSettings,
  Service,
  SiteSettings,
  StaffMember,
  Testimonial,
} from '@/types'

function assertSiteScope(siteIdOrSlug: string) {
  if (siteIdOrSlug !== SITE_SLUG && !siteIdOrSlug.includes('kocoon')) {
    throw new Error('Site scope mismatch: operations must target kocoon-wellness-spa')
  }
}

function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

export const siteService = {
  async getSettings(): Promise<SiteSettings> {
    if (canUseSupabaseCms()) {
      try {
        const remote = await supabaseCms.getSettings()
        if (remote) return remote
      } catch (err) {
        console.warn('[cms] settings remote read failed', err)
      }
    }
    await delay(40)
    const settings = loadStore('settings', mockSettings)
    let changed = false
    // Prefer the HD logo asset if older CMS data still points at legacy files
    if (
      !settings.logoUrl ||
      settings.logoUrl.includes('logo.webp') ||
      settings.logoUrl.includes('logo.jpg') ||
      settings.logoUrl.includes('logo-mark')
    ) {
      settings.logoUrl = '/logo.png'
      changed = true
    }
    if (
      !settings.faviconUrl ||
      settings.faviconUrl.includes('logo.webp') ||
      settings.faviconUrl.includes('logo.jpg') ||
      settings.faviconUrl.includes('logo-mark')
    ) {
      settings.faviconUrl = '/logo.png'
      changed = true
    }
    if (!settings.addressLabel) {
      settings.addressLabel = 'Baguio City'
      changed = true
    }
    if (
      !settings.address ||
      settings.address === 'Loakan Proper, Baguio City, Philippines'
    ) {
      settings.address = '116 Purok Bubon, Loakan Proper, Baguio City'
      settings.googleMapsUrl =
        'https://maps.google.com/?q=116+Purok+Bubon+Loakan+Proper+Baguio+City'
      changed = true
    }
    if (!settings.secondaryAddress) {
      settings.secondaryAddress = '1947 J. Gabriel Street, Baclaran, Parañaque City'
      settings.secondaryAddressLabel = 'Parañaque City'
      changed = true
    }
    if (
      !settings.phoneGlobe ||
      settings.phone === '09064463383' ||
      !settings.phoneSmart ||
      !settings.secondaryPhone
    ) {
      settings.phoneGlobe = '09151232418'
      settings.phoneSmart = '09622188796'
      settings.phone = '09151232418'
      settings.secondaryPhone = '09104893903'
      settings.secondaryPhoneLabel = 'Smart / TNT'
      changed = true
    }
    // Migrate legacy daytime hours to actual 3PM–3AM schedule
    if (
      settings.businessHours?.some(
        (h) => h.open.includes('10:00') || h.open.includes('9:00 AM') || h.close.includes('8:00 PM'),
      )
    ) {
      settings.businessHours = mockSettings.businessHours
      changed = true
    }
    if (
      !settings.email ||
      settings.email === 'hello@kocoonwellnessspa.com'
    ) {
      settings.email = 'kocoonwellnessspa@gmail.com'
      changed = true
    }
    if (!settings.secondaryEmail) {
      settings.secondaryEmail = 'kocoonmanila@gmail.com'
      changed = true
    }
    if (
      settings.messengerUrlBaclaran === undefined ||
      !settings.messengerUrlBaclaran ||
      !settings.messengerUrl
    ) {
      settings.messengerUrl = 'https://www.facebook.com/messages/t/1141805542359287'
      settings.messengerUrlBaclaran = 'https://www.facebook.com/messages/t/1342439362286859'
      changed = true
    }
    if (settings.facebookUrlBaclaran === undefined) {
      settings.facebookUrlBaclaran = ''
      changed = true
    }
    if (changed) saveStore('settings', settings)
    return settings
  },

  async updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    await delay()
    const current = loadStore('settings', mockSettings)
    assertSiteScope(current.slug)
    if (current.slugLocked && patch.slug && patch.slug !== current.slug) {
      throw new Error('Business slug is locked. Unlock intentionally in Settings to change it.')
    }
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() }
    if (canUseSupabaseCms()) {
      try {
        const saved = await supabaseCms.saveSettings(next)
        saveStore('settings', saved)
        return saved
      } catch (err) {
        console.warn('[cms] settings remote save failed', err)
      }
    }
    saveStore('settings', next)
    return next
  },

  async getSEO(): Promise<SEOSettings> {
    if (canUseSupabaseCms()) {
      try {
        const remote = await supabaseCms.getSEO()
        if (remote) return remote
      } catch (err) {
        console.warn('[cms] seo remote read failed', err)
      }
    }
    await delay()
    const seo = loadStore('seo', mockSEO)
    if (
      !seo.ogImage ||
      seo.ogImage.includes('logo.webp') ||
      seo.ogImage.includes('logo.jpg') ||
      seo.ogImage.includes('logo-mark') ||
      seo.ogImage === '/logo.png' ||
      seo.ogImage.endsWith('/logo.png')
    ) {
      seo.ogImage = '/og-image.jpg'
      saveStore('seo', seo)
    }
    return seo
  },

  async updateSEO(patch: Partial<SEOSettings>): Promise<SEOSettings> {
    await delay()
    const current = loadStore('seo', mockSEO)
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() }
    if (canUseSupabaseCms()) {
      try {
        const saved = await supabaseCms.saveSEO(next)
        saveStore('seo', saved)
        return saved
      } catch (err) {
        console.warn('[cms] seo remote save failed', err)
      }
    }
    saveStore('seo', next)
    return next
  },

  async getPageContent(): Promise<PageContent> {
    if (canUseSupabaseCms()) {
      try {
        const remote = await supabaseCms.getPageContent()
        if (remote) return remote
      } catch (err) {
        console.warn('[cms] page content remote read failed', err)
      }
    }
    await delay()
    const content = loadStore('pageContent', mockPageContent)
    let changed = false
    // Only replace true placeholders — never overwrite uploaded Storage URLs
    const heroImg = content.hero.imageUrl ?? ''
    const welcomeImg = content.welcome.imageUrl ?? ''
    const aboutImg = content.about.imageUrl ?? ''
    const experienceImg = content.experience.backgroundImageUrl ?? ''

    if (
      !isDurableImageUrl(heroImg) ||
      heroImg.includes('unsplash.com') ||
      heroImg === '/hero.jpg'
    ) {
      if (!heroImg.includes('supabase') && !heroImg.includes('kocoon-media')) {
        content.hero.imageUrl = '/hero-poster.jpg'
        changed = true
      }
    }
    if (!isDurableImageUrl(welcomeImg) || welcomeImg.includes('unsplash.com')) {
      if (!welcomeImg.includes('supabase') && !welcomeImg.includes('kocoon-media')) {
        content.welcome.imageUrl = '/spa/spa-3.jpg'
        changed = true
      }
    }
    if (!isDurableImageUrl(aboutImg) || aboutImg.includes('unsplash.com')) {
      if (!aboutImg.includes('supabase') && !aboutImg.includes('kocoon-media')) {
        content.about.imageUrl = '/spa/spa-1.jpg'
        changed = true
      }
    }
    if (!isDurableImageUrl(experienceImg) || experienceImg.includes('unsplash.com')) {
      if (!experienceImg.includes('supabase') && !experienceImg.includes('kocoon-media')) {
        content.experience.backgroundImageUrl = '/spa/spa-2.jpg'
        changed = true
      }
    }
    if (changed) saveStore('pageContent', content)
    if (!('videoUrl' in content.hero) || content.hero.videoUrl === undefined) {
      content.hero.videoUrl = '/hero.mp4'
      saveStore('pageContent', content)
    }
    return content
  },

  async updatePageContent(patch: Partial<PageContent>): Promise<PageContent> {
    await delay()
    const current = loadStore('pageContent', mockPageContent)
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() }
    if (canUseSupabaseCms()) {
      try {
        const saved = await supabaseCms.savePageContent(next)
        saveStore('pageContent', saved)
        return saved
      } catch (err) {
        console.warn('[cms] page content remote save failed', err)
      }
    }
    saveStore('pageContent', next)
    return next
  },

  async getDashboardStats(): Promise<DashboardStats> {
    await delay()
    const services = loadStore('services', mockServices)
    const staff = loadStore('staff', mockStaff)
    const gallery = loadStore('gallery', mockGallery)
    const testimonials = loadStore('testimonials', mockTestimonials)
    const inquiries = loadStore('inquiries', mockInquiries)
    return {
      totalServices: services.length,
      activeServices: services.filter((s) => s.active).length,
      staffMembers: staff.filter((s) => s.active).length,
      galleryImages: gallery.filter((g) => g.active).length,
      testimonials: testimonials.filter((t) => t.published).length,
      unreadInquiries: inquiries.filter((i) => i.status === 'unread').length,
    }
  },
}

export const serviceService = {
  async list(includeInactive = false): Promise<Service[]> {
    if (canUseSupabaseCms()) {
      try {
        const remote = await supabaseCms.listServices(includeInactive)
        if (remote && remote.length > 0) return remote
      } catch (err) {
        console.warn('[cms] services remote read failed', err)
      }
    }
    await delay()
    let items = loadStore('services', mockServices)
    // Never wipe rows that already have uploaded Storage images
    const hasUploads = items.some(
      (s) => s.imageUrl.includes('kocoon-media') || s.imageUrl.includes('supabase'),
    )
    const needsMenuRefresh =
      !hasUploads &&
      (items.some((s) => s.imageUrl.includes('unsplash.com')) ||
        items.some((s) => s.slug === 'swedish-massage' || s.category === 'Massage') ||
        items.some((s) => s.durationLabel === undefined) ||
        !items.some((s) => s.slug === 'kws-signature-massage'))
    if (needsMenuRefresh) {
      items = structuredClone(mockServices)
      saveStore('services', items)
    }
    return items
      .filter((s) => includeInactive || s.active)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },

  async getBySlug(slug: string): Promise<Service | undefined> {
    await delay()
    return loadStore('services', mockServices).find((s) => s.slug === slug)
  },

  async getById(id: string): Promise<Service | undefined> {
    await delay()
    return loadStore('services', mockServices).find((s) => s.id === id)
  },

  async create(input: Omit<Service, 'id' | 'siteId' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    if (canUseSupabaseCms()) {
      const saved = await supabaseCms.upsertService(input)
      return saved
    }
    await delay()
    const items = loadStore('services', mockServices)
    const item: Service = {
      ...input,
      id: createId('svc'),
      siteId: mockSettings.siteId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    items.push(item)
    saveStore('services', items)
    return item
  },

  async update(id: string, patch: Partial<Service>): Promise<Service> {
    if (canUseSupabaseCms()) {
      const current = (await supabaseCms.listServices(true))?.find((s) => s.id === id)
      const base = current ?? loadStore('services', mockServices).find((s) => s.id === id)
      if (!base) throw new Error('Service not found')
      const merged = { ...base, ...patch }
      const { id: _i, siteId: _s, createdAt: _c, updatedAt: _u, ...rest } = merged
      return supabaseCms.upsertService({ ...rest, id: isUuid(id) ? id : undefined })
    }
    await delay()
    const items = loadStore('services', mockServices)
    const idx = items.findIndex((s) => s.id === id)
    if (idx < 0) throw new Error('Service not found')
    items[idx] = { ...items[idx], ...patch, id, updatedAt: new Date().toISOString() }
    saveStore('services', items)
    return items[idx]
  },

  async remove(id: string): Promise<void> {
    await delay()
    saveStore(
      'services',
      loadStore('services', mockServices).filter((s) => s.id !== id),
    )
  },

  async duplicate(id: string): Promise<Service> {
    const original = await this.getById(id)
    if (!original) throw new Error('Service not found')
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = original
    return this.create({
      ...rest,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy`,
      featured: false,
    })
  },

  async reorder(orderedIds: string[]): Promise<Service[]> {
    await delay()
    const items = loadStore('services', mockServices)
    orderedIds.forEach((id, index) => {
      const item = items.find((s) => s.id === id)
      if (item) item.sortOrder = index + 1
    })
    saveStore('services', items)
    return items.sort((a, b) => a.sortOrder - b.sortOrder)
  },
}

export const staffService = {
  async list(includeInactive = false): Promise<StaffMember[]> {
    // Local-first for speed. Remote only when VITE_SUPABASE_CMS=true.
    if (canUseSupabaseCms()) {
      try {
        const remote = await supabaseCms.listStaff(includeInactive)
        if (remote && remote.length > 0) return remote
      } catch (err) {
        console.warn('[cms] staff remote read failed', err)
      }
    }
    await delay(40)
    let items = loadStore('staff', mockStaff)
    // Drop broken blob/data previews — placeholders remain until a Storage upload
    let changed = false
    items = items.map((s) => {
      if (s.imageUrl?.startsWith('blob:') || s.imageUrl?.startsWith('data:')) {
        changed = true
        return { ...s, imageUrl: '' }
      }
      return s
    })
    if (changed) saveStore('staff', items)
    return items
      .filter((s) => includeInactive || s.active)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },

  async getById(id: string): Promise<StaffMember | undefined> {
    const all = await this.list(true)
    return all.find((s) => s.id === id)
  },

  async create(
    input: Omit<StaffMember, 'id' | 'siteId' | 'createdAt' | 'updatedAt'>,
  ): Promise<StaffMember> {
    await delay()
    const items = loadStore('staff', mockStaff)
    const item: StaffMember = {
      ...input,
      id: createId('staff'),
      siteId: mockSettings.siteId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    items.push(item)
    saveStore('staff', items)
    if (canUseSupabaseCms()) {
      try {
        return await supabaseCms.upsertStaff(input)
      } catch (err) {
        console.warn('[cms] staff remote create failed; kept local', err)
      }
    }
    return item
  },

  async update(id: string, patch: Partial<StaffMember>): Promise<StaffMember> {
    await delay()
    const items = loadStore('staff', mockStaff)
    const idx = items.findIndex((s) => s.id === id)
    if (idx < 0) throw new Error('Staff member not found')
    items[idx] = { ...items[idx], ...patch, id, updatedAt: new Date().toISOString() }
    saveStore('staff', items)
    if (canUseSupabaseCms()) {
      try {
        const { id: _i, siteId: _s, createdAt: _c, updatedAt: _u, ...rest } = items[idx]
        return await supabaseCms.upsertStaff({
          ...rest,
          id: isUuid(id) ? id : undefined,
        })
      } catch (err) {
        console.warn('[cms] staff remote update failed; kept local', err)
      }
    }
    return items[idx]
  },

  async remove(id: string): Promise<void> {
    if (canUseSupabaseCms() && isUuid(id)) {
      await supabaseCms.deleteStaff(id)
      return
    }
    await delay()
    saveStore(
      'staff',
      loadStore('staff', mockStaff).filter((s) => s.id !== id),
    )
  },

  async reorder(orderedIds: string[]): Promise<StaffMember[]> {
    await delay()
    const items = loadStore('staff', mockStaff)
    orderedIds.forEach((id, index) => {
      const item = items.find((s) => s.id === id)
      if (item) item.sortOrder = index + 1
    })
    saveStore('staff', items)
    if (canUseSupabaseCms()) {
      for (const id of orderedIds) {
        const item = items.find((s) => s.id === id)
        if (!item || !isUuid(id)) continue
        const { id: _i, siteId: _s, createdAt: _c, updatedAt: _u, ...rest } = item
        await supabaseCms.upsertStaff({ ...rest, id })
      }
    }
    return items.sort((a, b) => a.sortOrder - b.sortOrder)
  },
}

export const galleryService = {
  async list(includeInactive = false): Promise<GalleryItem[]> {
    if (canUseSupabaseCms()) {
      try {
        const remote = await supabaseCms.listGallery(includeInactive)
        if (remote && remote.length > 0) return remote
      } catch (err) {
        console.warn('[cms] gallery remote read failed', err)
      }
    }
    await delay()
    let items = loadStore('gallery', mockGallery)
    // Clear broken preview URLs only — do NOT wipe the whole gallery on refresh
    if (items.some((g) => g.imageUrl?.startsWith('blob:') || g.imageUrl?.startsWith('data:'))) {
      items = items.map((g) =>
        g.imageUrl?.startsWith('blob:') || g.imageUrl?.startsWith('data:')
          ? { ...g, imageUrl: '' }
          : g,
      )
      saveStore('gallery', items)
    }
    // One-time placeholder upgrade only when still on Unsplash and no Storage uploads yet
    const hasUploads = items.some(
      (g) => g.imageUrl.includes('kocoon-media') || g.imageUrl.includes('supabase'),
    )
    if (!hasUploads && items.some((g) => g.imageUrl.includes('unsplash.com'))) {
      items = structuredClone(mockGallery)
      saveStore('gallery', items)
    }
    return items
      .filter((g) => includeInactive || g.active)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },

  async create(
    input: Omit<GalleryItem, 'id' | 'siteId' | 'createdAt'>,
  ): Promise<GalleryItem> {
    if (canUseSupabaseCms()) {
      return supabaseCms.upsertGallery(input)
    }
    await delay()
    const items = loadStore('gallery', mockGallery)
    const item: GalleryItem = {
      ...input,
      id: createId('gal'),
      siteId: mockSettings.siteId,
      createdAt: new Date().toISOString(),
    }
    items.push(item)
    saveStore('gallery', items)
    return item
  },

  async update(id: string, patch: Partial<GalleryItem>): Promise<GalleryItem> {
    if (canUseSupabaseCms()) {
      const current = (await this.list(true)).find((g) => g.id === id)
      if (!current) throw new Error('Gallery item not found')
      const merged = { ...current, ...patch }
      const { id: _i, siteId: _s, createdAt: _c, ...rest } = merged
      return supabaseCms.upsertGallery({
        ...rest,
        id: isUuid(id) ? id : undefined,
      })
    }
    await delay()
    const items = loadStore('gallery', mockGallery)
    const idx = items.findIndex((g) => g.id === id)
    if (idx < 0) throw new Error('Gallery item not found')
    items[idx] = { ...items[idx], ...patch, id }
    saveStore('gallery', items)
    return items[idx]
  },

  async remove(id: string): Promise<void> {
    if (canUseSupabaseCms() && isUuid(id)) {
      await supabaseCms.deleteGallery(id)
      return
    }
    await delay()
    saveStore(
      'gallery',
      loadStore('gallery', mockGallery).filter((g) => g.id !== id),
    )
  },
}

export const testimonialService = {
  async list(includeUnpublished = false): Promise<Testimonial[]> {
    await delay()
    return loadStore('testimonials', mockTestimonials).filter(
      (t) => includeUnpublished || t.published,
    )
  },

  async create(
    input: Omit<Testimonial, 'id' | 'siteId' | 'createdAt'>,
  ): Promise<Testimonial> {
    await delay()
    const items = loadStore('testimonials', mockTestimonials)
    const item: Testimonial = {
      ...input,
      id: createId('tes'),
      siteId: mockSettings.siteId,
      createdAt: new Date().toISOString(),
    }
    items.push(item)
    saveStore('testimonials', items)
    return item
  },

  async update(id: string, patch: Partial<Testimonial>): Promise<Testimonial> {
    await delay()
    const items = loadStore('testimonials', mockTestimonials)
    const idx = items.findIndex((t) => t.id === id)
    if (idx < 0) throw new Error('Testimonial not found')
    items[idx] = { ...items[idx], ...patch, id }
    saveStore('testimonials', items)
    return items[idx]
  },

  async remove(id: string): Promise<void> {
    await delay()
    saveStore(
      'testimonials',
      loadStore('testimonials', mockTestimonials).filter((t) => t.id !== id),
    )
  },
}

export const faqService = {
  async list(includeInactive = false): Promise<FAQItem[]> {
    await delay()
    return loadStore('faqs', mockFaqs)
      .filter((f) => includeInactive || f.active)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },

  async create(input: Omit<FAQItem, 'id' | 'siteId'>): Promise<FAQItem> {
    await delay()
    const items = loadStore('faqs', mockFaqs)
    const item: FAQItem = {
      ...input,
      id: createId('faq'),
      siteId: mockSettings.siteId,
    }
    items.push(item)
    saveStore('faqs', items)
    return item
  },

  async update(id: string, patch: Partial<FAQItem>): Promise<FAQItem> {
    await delay()
    const items = loadStore('faqs', mockFaqs)
    const idx = items.findIndex((f) => f.id === id)
    if (idx < 0) throw new Error('FAQ not found')
    items[idx] = { ...items[idx], ...patch, id }
    saveStore('faqs', items)
    return items[idx]
  },

  async remove(id: string): Promise<void> {
    await delay()
    saveStore(
      'faqs',
      loadStore('faqs', mockFaqs).filter((f) => f.id !== id),
    )
  },
}

export const inquiryService = {
  async list(): Promise<Inquiry[]> {
    await delay()
    return loadStore('inquiries', mockInquiries).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  async create(
    input: Omit<Inquiry, 'id' | 'siteId' | 'status' | 'createdAt'>,
  ): Promise<Inquiry> {
    await delay()
    const items = loadStore('inquiries', mockInquiries)
    const item: Inquiry = {
      ...input,
      id: createId('inq'),
      siteId: mockSettings.siteId,
      status: 'unread',
      createdAt: new Date().toISOString(),
    }
    items.unshift(item)
    saveStore('inquiries', items)
    return item
  },

  async updateStatus(id: string, status: Inquiry['status']): Promise<Inquiry> {
    await delay()
    const items = loadStore('inquiries', mockInquiries)
    const idx = items.findIndex((i) => i.id === id)
    if (idx < 0) throw new Error('Inquiry not found')
    items[idx] = { ...items[idx], status }
    saveStore('inquiries', items)
    return items[idx]
  },
}
