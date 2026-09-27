import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Container } from '@/components/common/Container'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import { cn } from '@/lib/utils'
import type { FAQItem } from '@/types'

interface FAQProps {
  items: FAQItem[]
}

export function FAQ({ items }: FAQProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  return (
    <section id="faq" className="section-pad relative">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          subtitle="Helpful details before your visit to Kocoon Wellness Spa."
        />
        <Reveal>
          <div className="space-y-3">
            {items.map((item) => {
              const open = openId === item.id
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-gold/12 bg-surface"
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    onClick={() => setOpenId(open ? null : item.id)}
                  >
                    <span className="font-medium text-cream">{item.question}</span>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 shrink-0 text-gold transition-transform',
                        open && 'rotate-180',
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28 }}
                      >
                        <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
