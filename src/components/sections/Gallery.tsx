import { useState } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Container } from '@/components/common/Container'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import { cn } from '@/lib/utils'
import type { GalleryItem } from '@/types'

interface GalleryProps {
  items: GalleryItem[]
}

const ASPECT_CLASS: Record<NonNullable<GalleryItem['aspect']>, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[16/10]',
}

function resolveAspect(item: GalleryItem, index: number): NonNullable<GalleryItem['aspect']> {
  if (item.aspect) return item.aspect
  if (index % 3 === 0) return 'landscape'
  if (index % 2 === 0) return 'portrait'
  return 'square'
}

export function Gallery({ items }: GalleryProps) {
  const [active, setActive] = useState<GalleryItem | null>(null)

  // Deduplicate by image URL so the same photo never appears twice
  const uniqueItems = items.filter(
    (item, index, arr) => arr.findIndex((x) => x.imageUrl === item.imageUrl) === index,
  )

  return (
    <section id="gallery" className="section-pad relative bg-bg-elevated">
      <Container>
        <SectionHeading
          eyebrow="Gallery"
          title="Moments of Calm"
          subtitle="A glimpse into our spa spaces, treatments, and wellness atmosphere."
        />

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {uniqueItems.map((item, i) => {
            const aspect = resolveAspect(item, i)
            return (
              <Reveal key={item.id} delay={(i % 3) * 0.04} className="mb-4 break-inside-avoid">
                <button
                  type="button"
                  onClick={() => setActive(item)}
                  className={cn(
                    'group relative block w-full overflow-hidden rounded-xl border border-gold/10 text-left',
                    ASPECT_CLASS[aspect],
                  )}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.caption || 'Kocoon Wellness Spa gallery'}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-wider text-gold">{item.category}</p>
                      {item.caption && <p className="text-sm text-cream">{item.caption}</p>}
                    </div>
                  </div>
                </button>
              </Reveal>
            )
          })}
        </div>
      </Container>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Gallery lightbox"
          >
            <button
              type="button"
              className="absolute inset-0"
              aria-label="Close lightbox"
              onClick={() => setActive(null)}
            />
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-cream"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              src={active.imageUrl}
              alt={active.caption || 'Gallery image'}
              className="relative z-10 max-h-[85vh] max-w-full rounded-lg object-contain"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
