import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Container } from '@/components/common/Container'
import type { ExperienceContent } from '@/types'

interface ExperienceProps {
  content: ExperienceContent
}

export function Experience({ content }: ExperienceProps) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-40, 40])

  return (
    <section ref={ref} className="relative min-h-[70vh] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <img
          src={content.backgroundImageUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </motion.div>
      <div className="absolute inset-0 bg-bg/75" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-transparent to-bg" />

      <Container className="relative flex min-h-[70vh] items-center justify-center py-24 text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h2 className="font-display text-3xl leading-tight text-cream sm:text-5xl">
            {content.title.split('\n').map((line, i) => (
              <span key={i} className="block">
                {i === 1 ? <span className="gold-gradient-text">{line}</span> : line}
              </span>
            ))}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-light sm:text-lg">
            {content.description}
          </p>
        </motion.div>
      </Container>
    </section>
  )
}
