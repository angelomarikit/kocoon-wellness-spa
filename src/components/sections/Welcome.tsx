import { Button } from '@/components/common/Button'
import { Container } from '@/components/common/Container'
import { Reveal } from '@/components/common/Reveal'
import type { WelcomeContent } from '@/types'

interface WelcomeProps {
  content: WelcomeContent
}

export function Welcome({ content }: WelcomeProps) {
  return (
    <section className="section-pad relative border-t border-border/60">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-gold/15">
              <img
                src={content.imageUrl}
                alt="Kocoon Wellness Spa interior in Baguio City"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-bg/50 to-transparent" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              {content.subheading}
            </p>
            <h2 className="font-display text-3xl text-cream sm:text-4xl">{content.heading}</h2>
            <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{content.body}</p>
            <Button href={content.ctaHref} variant="outline" className="mt-8">
              {content.ctaLabel}
            </Button>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
