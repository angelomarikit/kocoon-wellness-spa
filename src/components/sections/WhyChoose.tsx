import {
  HeartPulse,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Container } from '@/components/common/Container'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import type { WhyChooseContent } from '@/types'

const ICONS: Record<string, LucideIcon> = {
  HeartPulse,
  Leaf,
  Sparkles,
  Users,
  ShieldCheck,
  MapPin,
}

interface WhyChooseProps {
  content: WhyChooseContent
}

export function WhyChoose({ content }: WhyChooseProps) {
  return (
    <section className="section-pad relative border-t border-border/50 bg-bg-elevated">
      <Container>
        <SectionHeading title={content.title} subtitle={content.subtitle} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.cards.map((card, i) => {
            const Icon = ICONS[card.icon] ?? Sparkles
            return (
              <Reveal key={card.id} delay={i * 0.04}>
                <article className="group h-full rounded-2xl border border-gold/12 bg-surface/70 p-6 transition duration-400 hover:border-gold/30 hover:bg-surface">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold transition group-hover:shadow-gold">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="font-display text-xl text-cream">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{card.description}</p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
