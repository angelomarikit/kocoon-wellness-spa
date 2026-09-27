import { useMemo, useState } from 'react'
import { Clock } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Container } from '@/components/common/Container'
import { Modal } from '@/components/common/Modal'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import { SERVICE_CATEGORY_ORDER } from '@/data/mockData'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Service } from '@/types'

interface ServicesProps {
  services: Service[]
}

function durationText(service: Service): string {
  return service.durationLabel?.trim() || formatDuration(service.duration)
}

export function Services({ services }: ServicesProps) {
  const categories = useMemo(() => {
    const present = new Set(services.map((s) => s.category))
    const ordered = SERVICE_CATEGORY_ORDER.filter((c) => present.has(c))
    const extras = [...present].filter(
      (c) => !(SERVICE_CATEGORY_ORDER as readonly string[]).includes(c),
    )
    return [...ordered, ...extras]
  }, [services])

  const [activeCategory, setActiveCategory] = useState<string>(categories[0] ?? '')
  const [selected, setSelected] = useState<Service | null>(null)

  const currentCategory = categories.includes(activeCategory)
    ? activeCategory
    : (categories[0] ?? '')

  const filtered = services.filter((s) => s.category === currentCategory)

  return (
    <section id="services" className="section-pad relative">
      <Container>
        <SectionHeading
          eyebrow="Our Services"
          title="Wellness Treatments Crafted for You"
          subtitle="Browse by category and choose the treatment that fits your wellness needs."
        />

        <div
          className="mb-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Service categories"
        >
          {categories.map((category) => {
            const selectedTab = category === currentCategory
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={selectedTab}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-sm transition',
                  selectedTab
                    ? 'border-gold/50 bg-gold/15 text-gold'
                    : 'border-border bg-surface text-muted-light hover:border-gold/30 hover:text-cream',
                )}
              >
                {category}
              </button>
            )
          })}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" role="tabpanel">
          {filtered.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.04}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gold/15 bg-surface transition duration-500 hover:-translate-y-1 hover:border-gold/35 hover:shadow-gold">
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                  {service.featured && (
                    <span className="absolute left-3 top-3 rounded-sm border border-gold/40 bg-bg/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold backdrop-blur">
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl text-cream">{service.name}</h3>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted">
                      <Clock className="h-3.5 w-3.5 text-gold" />
                      {durationText(service)}
                    </span>
                  </div>
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-muted">
                    {service.shortDescription}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelected(service)}
                  >
                    {service.ctaLabel || 'View Details'}
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">No services in this category yet.</p>
        )}
      </Container>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} size="xl">
        {selected && (
          <div className="grid gap-6 md:grid-cols-2">
            <img
              src={selected.galleryImageUrl || selected.imageUrl}
              alt={selected.name}
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                <span className="rounded-sm border border-gold/30 px-2 py-1 text-gold">
                  {selected.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gold" />
                  {durationText(selected)}
                </span>
              </div>
              <p className="leading-relaxed text-muted-light">{selected.description}</p>
              {selected.benefits.length > 0 && (
                <div className="mt-5">
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gold">
                    Highlights
                  </h4>
                  <ul className="space-y-1.5 text-sm text-muted-light">
                    {selected.benefits.map((b) => (
                      <li key={b}>• {b}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selected.inclusions.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gold">
                    Inclusions
                  </h4>
                  <ul className="space-y-1.5 text-sm text-muted-light">
                    {selected.inclusions.map((b) => (
                      <li key={b}>• {b}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Button href="#booking" className="mt-6">
                Book This Service
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
