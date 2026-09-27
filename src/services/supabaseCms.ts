/**
 * Supabase CMS repository for slug kocoon-wellness-spa.
 * Images must be Storage public URLs — never blob:/data: for production.
 */

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
import { getSupabaseClient, isSupabaseConfigured, resolveKocoonSiteId, withTimeout } from '@/lib/supabase'
import { SITE_SLUG } from '@/lib/constants'

export function canUseSupabaseCms(): boolean {
  // Persist CMS to Supabase whenever URL + anon key are set,
  // so Incognito / other devices see the same content (not only localStorage).
  return isSupabaseConfigured()
}

async function siteIdOrThrow(): Promise<string> {
  const id = await resolveKocoonSiteId()
  if (!id) {
    throw new Error(
      'Site kocoon-wellness-spa not found. Run 001_kocoon_wellness_spa.sql in Supabase.',
    )
  }
  return id
}

async function timed<T>(fn: () => Promise<T>): Promise<T> {
  return withTimeout(fn(), 8000)
}

function mapStaff(row: Record<string, unknown>, siteId: string): StaffMember {
  const branchRaw = String(row.branch ?? 'Baguio')
  const branch: StaffMember['branch'] = branchRaw === 'Manila' ? 'Manila' : 'Baguio'
  return {
    id: String(row.id),
    siteId,
    name: String(row.name ?? ''),
    position: String(row.position ?? ''),
    specialty: String(row.specialty ?? ''),
    bio: String(row.bio ?? ''),
    credentials: String(row.credentials ?? ''),
    yearsExperience: Number(row.years_experience ?? 0),
    imageUrl: String(row.image_url ?? ''),
    socialUrl: String(row.social_url ?? ''),
    branch,
    featured: Boolean(row.featured),
    active: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  }
}

function mapGallery(row: Record<string, unknown>, siteId: string): GalleryItem {
  return {
    id: String(row.id),
    siteId,
    imageUrl: String(row.image_url ?? ''),
    caption: String(row.caption ?? ''),
    category: (row.category as GalleryItem['category']) || 'Spa Interior',
    featured: Boolean(row.featured),
    active: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0),
    aspect: (row.aspect as GalleryItem['aspect']) || 'square',
    createdAt: String(row.created_at ?? new Date().toISOString()),
  }
}

function mapService(row: Record<string, unknown>, siteId: string): Service {
  return {
    id: String(row.id),
    siteId,
    slug: String(row.slug ?? ''),
    name: String(row.name ?? ''),
    category: String(row.category ?? ''),
    shortDescription: String(row.short_description ?? ''),
    description: String(row.description ?? ''),
    price: Number(row.price ?? 0),
    discountedPrice: row.discounted_price == null ? null : Number(row.discounted_price),
    duration: Number(row.duration_minutes ?? 0),
    durationLabel: String(row.duration_label ?? ''),
    imageUrl: String(row.image_url ?? ''),
    galleryImageUrl: String(row.gallery_image_url ?? ''),
    benefits: (row.benefits as string[]) ?? [],
    inclusions: (row.inclusions as string[]) ?? [],
    featured: Boolean(row.featured),
    active: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0),
    ctaLabel: String(row.cta_label ?? 'View Details'),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  }
}

export const supabaseCms = {
  async listStaff(includeInactive = false): Promise<StaffMember[] | null> {
    return timed(async () => {
      const sb = getSupabaseClient()
      if (!sb) return null
      const siteId = await siteIdOrThrow()
      let q = sb.from('cms_staff').select('*').eq('site_id', siteId).order('sort_order')
      if (!includeInactive) q = q.eq('is_active', true)
      const { data, error } = await q
      if (error) throw new Error(error.message)
      return (data ?? []).map((row) => mapStaff(row as Record<string, unknown>, siteId))
    })
  },

  async upsertStaff(
    input: Omit<StaffMember, 'id' | 'siteId' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Promise<StaffMember> {
    const sb = getSupabaseClient()
    if (!sb) throw new Error('Supabase not configured')
    const siteId = await siteIdOrThrow()
    const id =
      input.id &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.id)
        ? input.id
        : undefined
    const payload = {
      ...(id ? { id } : {}),
      site_id: siteId,
      name: input.name,
      position: input.position,
      specialty: input.specialty,
      bio: input.bio,
      credentials: input.credentials,
      years_experience: input.yearsExperience,
      image_url: input.imageUrl,
      social_url: input.socialUrl,
      branch: input.branch === 'Manila' ? 'Manila' : 'Baguio',
      featured: input.featured,
      is_active: input.active,
      sort_order: input.sortOrder,
    }
    const { data, error } = await sb.from('cms_staff').upsert(payload).select('*').single()
    if (error) throw new Error(error.message)
    return mapStaff(data as Record<string, unknown>, siteId)
  },

  async deleteStaff(id: string): Promise<void> {
    const sb = getSupabaseClient()
    if (!sb) throw new Error('Supabase not configured')
    const siteId = await siteIdOrThrow()
    const { error } = await sb.from('cms_staff').delete().eq('id', id).eq('site_id', siteId)
    if (error) throw new Error(error.message)
  },

  async listGallery(includeInactive = false): Promise<GalleryItem[] | null> {
    return timed(async () => {
      const sb = getSupabaseClient()
      if (!sb) return null
      const siteId = await siteIdOrThrow()
      let q = sb.from('cms_gallery').select('*').eq('site_id', siteId).order('sort_order')
      if (!includeInactive) q = q.eq('is_active', true)
      const { data, error } = await q
      if (error) throw new Error(error.message)
      return (data ?? []).map((row) => mapGallery(row as Record<string, unknown>, siteId))
    })
  },

  async upsertGallery(
    input: Omit<GalleryItem, 'id' | 'siteId' | 'createdAt'> & { id?: string },
  ): Promise<GalleryItem> {
    const sb = getSupabaseClient()
    if (!sb) throw new Error('Supabase not configured')
    const siteId = await siteIdOrThrow()
    const payload = {
      ...(input.id ? { id: input.id } : {}),
      site_id: siteId,
      image_url: input.imageUrl,
      caption: input.caption,
      category: input.category,
      featured: input.featured,
      aspect: input.aspect,
      is_active: input.active,
      sort_order: input.sortOrder,
    }
    const { data, error } = await sb.from('cms_gallery').upsert(payload).select('*').single()
    if (error) throw new Error(error.message)
    return mapGallery(data as Record<string, unknown>, siteId)
  },

  async deleteGallery(id: string): Promise<void> {
    const sb = getSupabaseClient()
    if (!sb) throw new Error('Supabase not configured')
    const siteId = await siteIdOrThrow()
    const { error } = await sb.from('cms_gallery').delete().eq('id', id).eq('site_id', siteId)
    if (error) throw new Error(error.message)
  },

  async listServices(includeInactive = false): Promise<Service[] | null> {
    return timed(async () => {
      const sb = getSupabaseClient()
      if (!sb) return null
      const siteId = await siteIdOrThrow()
      let q = sb.from('cms_services').select('*').eq('site_id', siteId).order('sort_order')
      if (!includeInactive) q = q.eq('is_active', true)
      const { data, error } = await q
      if (error) throw new Error(error.message)
      return (data ?? []).map((row) => mapService(row as Record<string, unknown>, siteId))
    })
  },

  async upsertService(
    input: Omit<Service, 'id' | 'siteId' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Promise<Service> {
    const sb = getSupabaseClient()
    if (!sb) throw new Error('Supabase not configured')
    const siteId = await siteIdOrThrow()
    const payload = {
      ...(input.id ? { id: input.id } : {}),
      site_id: siteId,
      slug: input.slug,
      name: input.name,
      category: input.category,
      short_description: input.shortDescription,
      description: input.description,
      price: input.price || null,
      discounted_price: input.discountedPrice,
      duration_minutes: input.duration,
      duration_label: input.durationLabel,
      image_url: input.imageUrl,
      gallery_image_url: input.galleryImageUrl,
      benefits: input.benefits,
      inclusions: input.inclusions,
      featured: input.featured,
      is_active: input.active,
      sort_order: input.sortOrder,
      cta_label: input.ctaLabel,
    }
    const { data, error } = await sb.from('cms_services').upsert(payload).select('*').single()
    if (error) throw new Error(error.message)
    return mapService(data as Record<string, unknown>, siteId)
  },

  async getPageContent(): Promise<PageContent | null> {
    return timed(async () => {
      const sb = getSupabaseClient()
      if (!sb) return null
      const siteId = await siteIdOrThrow()
      const { data, error } = await sb
        .from('cms_page_content')
        .select('id, data, updated_at')
        .eq('site_id', siteId)
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!data?.data) return null
      const body = data.data as Omit<PageContent, 'id' | 'siteId' | 'updatedAt'>
      return {
        ...body,
        id: String(data.id),
        siteId,
        updatedAt: String(data.updated_at),
      }
    })
  },

  async savePageContent(content: PageContent): Promise<PageContent> {
    const sb = getSupabaseClient()
    if (!sb) throw new Error('Supabase not configured')
    const siteId = await siteIdOrThrow()
    const { id: _id, siteId: _sid, updatedAt: _u, ...data } = content
    const { data: row, error } = await sb
      .from('cms_page_content')
      .upsert({ site_id: siteId, data }, { onConflict: 'site_id' })
      .select('id, data, updated_at')
      .single()
    if (error) throw new Error(error.message)
    const body = row.data as Omit<PageContent, 'id' | 'siteId' | 'updatedAt'>
    return {
      ...body,
      id: String(row.id),
      siteId,
      updatedAt: String(row.updated_at),
    }
  },

  async getSettings(): Promise<SiteSettings | null> {
    return timed(async () => {
      const sb = getSupabaseClient()
      if (!sb) return null
      const siteId = await siteIdOrThrow()
      const { data, error } = await sb
        .from('cms_settings')
        .select('id, data, updated_at')
        .eq('site_id', siteId)
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!data?.data) return null
      const body = data.data as Omit<SiteSettings, 'id' | 'siteId' | 'slug' | 'updatedAt'>
      return {
        ...body,
        id: String(data.id),
        siteId,
        slug: SITE_SLUG,
        updatedAt: String(data.updated_at),
      } as SiteSettings
    })
  },

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    const sb = getSupabaseClient()
    if (!sb) throw new Error('Supabase not configured')
    const siteId = await siteIdOrThrow()
    const { id: _id, siteId: _s, updatedAt: _u, ...rest } = settings
    const { data, error } = await sb
      .from('cms_settings')
      .upsert({ site_id: siteId, data: { ...rest, slug: SITE_SLUG } }, { onConflict: 'site_id' })
      .select('id, data, updated_at')
      .single()
    if (error) throw new Error(error.message)
    const body = data.data as Omit<SiteSettings, 'id' | 'siteId' | 'slug' | 'updatedAt'>
    return {
      ...body,
      id: String(data.id),
      siteId,
      slug: SITE_SLUG,
      updatedAt: String(data.updated_at),
    } as SiteSettings
  },

  async getSEO(): Promise<SEOSettings | null> {
    return timed(async () => {
      const sb = getSupabaseClient()
      if (!sb) return null
      const siteId = await siteIdOrThrow()
      const { data, error } = await sb
        .from('cms_seo')
        .select('id, data, updated_at')
        .eq('site_id', siteId)
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!data?.data) return null
      const body = data.data as Omit<SEOSettings, 'id' | 'siteId' | 'updatedAt'>
      return {
        ...body,
        id: String(data.id),
        siteId,
        updatedAt: String(data.updated_at),
      }
    })
  },

  async saveSEO(seo: SEOSettings): Promise<SEOSettings> {
    const sb = getSupabaseClient()
    if (!sb) throw new Error('Supabase not configured')
    const siteId = await siteIdOrThrow()
    const { id: _id, siteId: _s, updatedAt: _u, ...rest } = seo
    const { data, error } = await sb
      .from('cms_seo')
      .upsert({ site_id: siteId, data: rest }, { onConflict: 'site_id' })
      .select('id, data, updated_at')
      .single()
    if (error) throw new Error(error.message)
    const body = data.data as Omit<SEOSettings, 'id' | 'siteId' | 'updatedAt'>
    return {
      ...body,
      id: String(data.id),
      siteId,
      updatedAt: String(data.updated_at),
    }
  },

  async listFaqs(): Promise<FAQItem[] | null> {
    const sb = getSupabaseClient()
    if (!sb) return null
    const siteId = await siteIdOrThrow()
    const { data, error } = await sb
      .from('cms_faqs')
      .select('*')
      .eq('site_id', siteId)
      .order('sort_order')
    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => ({
      id: String(row.id),
      siteId,
      question: String(row.question ?? ''),
      answer: String(row.answer ?? ''),
      active: Boolean(row.is_active),
      sortOrder: Number(row.sort_order ?? 0),
    }))
  },

  async listTestimonials(includeUnpublished = false): Promise<Testimonial[] | null> {
    const sb = getSupabaseClient()
    if (!sb) return null
    const siteId = await siteIdOrThrow()
    let q = sb.from('cms_testimonials').select('*').eq('site_id', siteId).order('created_at', {
      ascending: false,
    })
    if (!includeUnpublished) q = q.eq('is_published', true)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => ({
      id: String(row.id),
      siteId,
      clientName: String(row.client_name ?? ''),
      rating: Number(row.rating ?? 5),
      message: String(row.message ?? ''),
      imageUrl: String(row.image_url ?? ''),
      date: String(row.review_date ?? ''),
      featured: Boolean(row.featured),
      published: Boolean(row.is_published),
      createdAt: String(row.created_at ?? new Date().toISOString()),
    }))
  },
}
