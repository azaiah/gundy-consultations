import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Cards rise in sequence like stacked lumber: subtle, 8-12px travel. */
export const lumber: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] } }),
}

export function Rise({ children, index = 0, className = '' }: { children: ReactNode; index?: number; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div className={className} variants={lumber} custom={index} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}>
      {children}
    </motion.div>
  )
}

/** Adds `is-visible` to a .chalk span when scrolled into view (snapping chalk line). */
export function Chalk({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVis(true)
          io.disconnect()
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <span ref={ref} className={`chalk ${vis ? 'is-visible' : ''} ${className}`}>
      {children}
    </span>
  )
}

export function SectionHeading({ eyebrow, title, text, dark = false, align = 'left', as = 'h2' }: { eyebrow: string; title: ReactNode; text?: ReactNode; dark?: boolean; align?: 'left' | 'center'; as?: 'h1' | 'h2' }) {
  const H = as
  return (
    <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <p className={`eyebrow ${dark ? 'text-survey-light' : ''}`}>{eyebrow}</p>
      <H className={`display mt-3 text-4xl sm:text-5xl lg:text-6xl ${dark ? 'text-white' : 'text-ink'}`}>{title}</H>
      {text && <p className={`mt-4 text-base sm:text-lg leading-relaxed ${dark ? 'text-white/75' : 'text-steel'}`}>{text}</p>}
    </div>
  )
}

export function TickDivider() {
  return <div className="tick-divider mx-auto max-w-7xl px-4" aria-hidden="true" />
}
