import { Container } from '@/components/common/Container'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import type { AboutContent } from '@/types'

interface AboutProps {
  content: AboutContent
}

export function About({ content }: AboutProps) {
  return (
    <section id="about" className="section-pad relative bg-bg-elevated">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <SectionHeading
              align="left"
              eyebrow={content.eyebrow}
              title={content.title}
              className="mb-6"
            />
            <p className="text-base leading-relaxed text-muted sm:text-lg">{content.description}</p>
            <p className="mt-4 text-base leading-relaxed text-muted-light">
              {content.secondaryDescription}
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5">
              {content.stats.map((stat) => (
                <div
                  key={stat.id}
                  className="rounded-xl border border-gold/15 bg-surface/80 p-4 sm:p-5"
                >
                  <p className="font-display text-2xl text-gold sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl border border-gold/10" />
              <img
                src={content.imageUrl}
                alt="Kocoon Wellness Spa storefront in Loakan Proper, Baguio City"
                className="relative aspect-[4/5] w-full rounded-2xl object-cover shadow-card"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
