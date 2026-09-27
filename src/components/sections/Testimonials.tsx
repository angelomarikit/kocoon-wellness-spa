import { Star } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import type { Testimonial } from '@/types'

interface TestimonialsProps {
  items: Testimonial[]
}

export function Testimonials({ items }: TestimonialsProps) {
  const featured = items.filter((t) => t.featured).slice(0, 3)

  return (
    <section className="section-pad relative">
      <Container>
        <SectionHeading
          eyebrow="Testimonials"
          title="What Our Guests Say"
          subtitle="Real experiences from guests who found rest and renewal at Kocoon."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.06}>
              <blockquote className="flex h-full flex-col rounded-2xl border border-gold/15 bg-surface p-6">
                <div className="mb-4 flex gap-1" aria-label={`${item.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-4 w-4 ${idx < item.rating ? 'fill-gold text-gold' : 'text-border'}`}
                    />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-light">“{item.message}”</p>
                <footer className="mt-5 border-t border-border pt-4">
                  <cite className="not-italic font-medium text-cream">{item.clientName}</cite>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
