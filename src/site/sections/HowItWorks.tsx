import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Brain, Search, Gauge, PenLine, CheckCircle2, Route } from 'lucide-react'
import { SectionHeading } from '../motion'

const steps = [
  { icon: Brain, title: 'Knows you', text: 'The Company Brain holds your trades, licenses, bonding, insurance, certifications, crew size and service area.' },
  { icon: Search, title: 'Searches', text: 'On your schedule, the engine sweeps public portals, GC invitations, permits and local property sources.' },
  { icon: Gauge, title: 'Scores', text: 'Every find gets a go/no-go fit score. Long shots are dropped before they waste your time.' },
  { icon: PenLine, title: 'Writes', text: 'For each real match: an outreach email, a call script and a prequalification packet, drafted and ready.' },
  { icon: CheckCircle2, title: 'You approve', text: 'Nothing goes out without your OK. Edit the draft, approve it, or mark it no-bid with a reason.' },
  { icon: Route, title: 'Tracks', text: 'Everything lands on one pipeline, stamped with the date and time it was found, through to won or lost.' },
]

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 25 })
  const scaleX = useTransform(progress, (v) => (reduce ? 1 : v))
  const scaleY = scaleX

  return (
    <section id="how-it-works" aria-labelledby="how-h" className="bg-ink text-white bg-blueprint-grid-dark py-20 sm:py-28 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading dark eyebrow="How it works" title={<span id="how-h">The weekly loop</span>} text="From your credentials to a signed contract, laid out like a tape measure. Scroll and watch each step light up." />

        <div ref={ref} className="relative mt-16">
          {/* Desktop: horizontal tape */}
          <div className="hidden lg:block absolute top-6 left-0 right-0 h-3" aria-hidden="true">
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px)', backgroundSize: '20px 12px' }} />
            <motion.div className="absolute inset-y-0 left-0 w-full origin-left bg-survey-light" style={{ scaleX }} />
          </div>
          {/* Mobile: vertical tape */}
          <div className="lg:hidden absolute top-0 bottom-0 left-[22px] w-3" aria-hidden="true">
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)', backgroundSize: '12px 20px' }} />
            <motion.div className="absolute inset-x-0 top-0 h-full origin-top bg-survey-light" style={{ scaleY }} />
          </div>

          <ol className="relative grid gap-8 lg:grid-cols-6 lg:gap-4 lg:pt-14 pl-14 lg:pl-0">
            {steps.map((s, i) => (
              <Step key={s.title} s={s} i={i} progress={progress} reduce={!!reduce} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function Step({ s, i, progress, reduce }: { s: (typeof steps)[number]; i: number; progress: ReturnType<typeof useSpring>; reduce: boolean }) {
  const threshold = (i + 0.5) / steps.length
  const lit = useTransform(progress, (v) => (reduce || v >= threshold ? 1 : 0.35))
  const bg = useTransform(progress, (v) => (reduce || v >= threshold ? '#FF7A33' : 'rgba(255,255,255,0.12)'))
  return (
    <motion.li style={{ opacity: lit }} className="relative">
      <motion.div
        style={{ background: bg }}
        className="absolute -left-14 lg:static lg:-mt-14 lg:mb-6 h-11 w-11 rounded-lg flex items-center justify-center text-ink shadow"
        aria-hidden="true"
      >
        <s.icon size={20} />
      </motion.div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">Step {i + 1}</p>
      <h3 className="font-display uppercase text-2xl mt-1">{s.title}</h3>
      <p className="mt-2 text-sm text-white/70 leading-relaxed">{s.text}</p>
    </motion.li>
  )
}
