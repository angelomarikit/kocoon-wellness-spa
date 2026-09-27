export interface SiteSettings {
  id: string
  siteId: string
  slug: string
  businessName: string
  /** Primary click-to-call number (Baguio Globe by default). */
  phone: string
  phoneGlobe: string
  phoneSmart: string
  secondaryPhone: string
  secondaryPhoneLabel: string
  email: string
  secondaryEmail: string
  address: string
  /** Optional second branch address (e.g. Parañaque). */
  secondaryAddress: string
  secondaryAddressLabel: string
  addressLabel: string
  googleMapsUrl: string
  facebookUrl: string
  facebookUrlBaclaran: string
  instagramUrl: string
  /** Messenger / m.me link for Baguio branch */
  messengerUrl: string
  /** Messenger / m.me link for Baclaran / Parañaque branch */
  messengerUrlBaclaran: string
  businessHours: BusinessHour[]
  logoUrl: string
  faviconUrl: string
  primaryGold: string
  backgroundColor: string
  slugLocked: boolean
  updatedAt: string
}

export interface BusinessHour {
  day: string
  open: string
  close: string
  closed: boolean
}

export interface SEOSettings {
  id: string
  siteId: string
  title: string
  metaDescription: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
  facebookUrl: string
  instagramUrl: string
  canonicalUrl: string
  updatedAt: string
}

export interface HeroContent {
  badge: string
  title: string
  description: string
  primaryButton: string
  secondaryButton: string
  imageUrl: string
  /** Optional autoplay hero video. Falls back to imageUrl when empty. */
  videoUrl: string
}

export interface WelcomeContent {
  heading: string
  subheading: string
  body: string
  imageUrl: string
  ctaLabel: string
  ctaHref: string
}

export interface AboutStat {
  id: string
  label: string
  value: string
}

export interface AboutContent {
  eyebrow: string
  title: string
  description: string
  secondaryDescription: string
  imageUrl: string
  stats: AboutStat[]
}

export interface WhyChooseCard {
  id: string
  title: string
  description: string
  icon: string
}

export interface WhyChooseContent {
  title: string
  subtitle: string
  cards: WhyChooseCard[]
}

export interface ExperienceContent {
  title: string
  description: string
  backgroundImageUrl: string
}

export interface BookingCtaContent {
  title: string
  description: string
  primaryButton: string
  secondaryButton: string
  tertiaryButton: string
}

export interface FooterContent {
  description: string
}

export interface PageContent {
  id: string
  siteId: string
  hero: HeroContent
  welcome: WelcomeContent
  about: AboutContent
  whyChoose: WhyChooseContent
  experience: ExperienceContent
  bookingCta: BookingCtaContent
  footer: FooterContent
  updatedAt: string
}

export interface Service {
  id: string
  siteId: string
  slug: string
  name: string
  category: string
  shortDescription: string
  description: string
  price: number
  discountedPrice: number | null
  duration: number
  /** Optional public-facing duration text (e.g. "1 / 1.5 / 2 Hours") */
  durationLabel: string
  imageUrl: string
  galleryImageUrl: string
  benefits: string[]
  inclusions: string[]
  featured: boolean
  active: boolean
  sortOrder: number
  ctaLabel: string
  createdAt: string
  updatedAt: string
}

export type StaffBranch = 'Baguio' | 'Manila'

export interface StaffMember {
  id: string
  siteId: string
  name: string
  position: string
  specialty: string
  bio: string
  credentials: string
  yearsExperience: number
  imageUrl: string
  socialUrl: string
  /** Branch location this therapist works at */
  branch: StaffBranch
  featured: boolean
  active: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type GalleryCategory =
  | 'Spa Interior'
  | 'Treatment Rooms'
  | 'Services'
  | 'Team'
  | 'Wellness Experience'

export interface GalleryItem {
  id: string
  siteId: string
  imageUrl: string
  caption: string
  category: GalleryCategory
  featured: boolean
  active: boolean
  sortOrder: number
  /** Visual tile shape in the public gallery grid */
  aspect: 'square' | 'portrait' | 'landscape'
  createdAt: string
}

export interface Testimonial {
  id: string
  siteId: string
  clientName: string
  rating: number
  message: string
  imageUrl: string
  date: string
  featured: boolean
  published: boolean
  createdAt: string
}

export interface FAQItem {
  id: string
  siteId: string
  question: string
  answer: string
  active: boolean
  sortOrder: number
}

export type InquiryStatus = 'unread' | 'read' | 'replied' | 'archived'

export interface Inquiry {
  id: string
  siteId: string
  name: string
  phone: string
  email: string
  service: string
  preferredDate: string
  message: string
  branch: string
  status: InquiryStatus
  createdAt: string
}

export interface DashboardStats {
  totalServices: number
  activeServices: number
  staffMembers: number
  galleryImages: number
  testimonials: number
  unreadInquiries: number
}

export interface AdminUser {
  id: string
  email: string
  name: string
}
