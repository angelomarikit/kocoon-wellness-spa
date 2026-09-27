import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/common/Button'
import { Container } from '@/components/common/Container'
import type { HeroContent } from '@/types'

interface HeroProps {
  content: HeroContent
}

export function Hero({ content }: HeroProps) {
  const reduce = useReducedMotion()
  const layerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasVideo = Boolean(content.videoUrl)

  useEffect(() => {
    if (reduce) return
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    const layer = layerRef.current
    if (!layer) return

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16
      const y = (e.clientY / window.innerHeight - 0.5) * 12
      layer.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduce])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !hasVideo) return

    if (reduce) {
      video.pause()
      return
    }

    video.muted = true
    const play = () => {
      void video.play().catch(() => {
        // Autoplay may be blocked; poster image remains as fallback.
      })
    }
    play()
  }, [hasVideo, reduce, content.videoUrl])

  return (
    <section id="home" className="relative min-h-[100svh] overflow-hidden ambient-glow">
      <div className="pointer-events-none absolute inset-0 low-poly-overlay opacity-40" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />

      <Container className="relative grid min-h-[100svh] items-center gap-12 pb-16 pt-28 lg:grid-cols-2 lg:gap-16 lg:pt-24">
        <div className="relative z-10 max-w-xl">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-sm border border-gold/25 bg-gold/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold"
          >
            {content.badge}
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="font-display text-[clamp(2.15rem,5vw,3.75rem)] font-medium leading-[1.12] text-cream text-balance"
          >
            {content.title.split('\n').map((line, i) => (
              <span key={i} className="block">
                {i === 1 ? <span className="gold-gradient-text">{line}</span> : line}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
          >
            {content.description}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button href="#booking" size="lg">
              {content.primaryButton}
            </Button>
            <Button href="#services" variant="secondary" size="lg">
              {content.secondaryButton}
            </Button>
          </motion.div>

          <div className="mt-10 h-px w-24 bg-gradient-to-r from-gold to-transparent" />
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="relative"
        >
          <div
            ref={layerRef}
            className="relative will-change-transform transition-transform duration-300 ease-out"
          >
            <div className="absolute -inset-3 rounded-[1.5rem] border border-gold/20" />
            <div
              className={`relative overflow-hidden rounded-[1.25rem] border border-white/5 shadow-card ${
                hasVideo
                  ? 'aspect-video min-h-[240px] sm:min-h-[300px] lg:aspect-[16/11] lg:min-h-[360px]'
                  : 'aspect-[4/5] sm:aspect-[5/6]'
              }`}
            >
              {hasVideo && !reduce ? (
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster={content.imageUrl}
                  aria-label="Kocoon Wellness Spa atmosphere video"
                >
                  <source src={content.videoUrl} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={content.imageUrl}
                  alt="Guest relaxing during a spa treatment at Kocoon Wellness Spa"
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-bg/40 via-transparent to-transparent" />
              <img
                src="/logo.png"
                alt=""
                aria-hidden
                className="absolute bottom-5 right-5 h-14 w-auto max-w-[140px] bg-transparent object-contain drop-shadow-lg sm:h-16 sm:max-w-[160px]"
              />
            </div>

            <div className="pointer-events-none absolute -left-4 top-10 hidden h-20 w-20 border border-gold/30 sm:block" />
            <div className="pointer-events-none absolute -bottom-3 -right-3 grid grid-cols-2 gap-1.5 opacity-70">
              <span className="h-2.5 w-2.5 bg-gold/80" />
              <span className="h-2.5 w-2.5 bg-gold/50" />
              <span className="h-2.5 w-2.5 bg-gold/50" />
              <span className="h-2.5 w-2.5 bg-gold/30" />
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
