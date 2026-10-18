import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Building2, FileSearch, Landmark, ClipboardList } from 'lucide-react'
import { LinkButton } from '@/components/Button'
import { StampLabel } from '@/components/StampLabel'
import { Badge } from '@/components/Badge'

function BlueprintGrid() {
  const reduce = useReducedMotion()
  const lines = Array.from({ length: 9 }, (_, i) => i)
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
      {lines.map((i) => (
        <motion.line
          key={`v${i}`}
          x1={(i + 1) * 120}
          x2={(i + 1) * 120}
          y1={0}
          y2={800}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.1 + i * 0.05, ease: 'easeOut' }}
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => i).map((i) => (
        <motion.line
          key={`h${i}`}
          x1={0}
          x2={1200}
          y1={(i + 1) * 115}
          y2={(i + 1) * 115}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.3 + i * 0.06, ease: 'easeOut' }}
        />
      ))}
    </svg>
  )
}

/** Dimension line that extends across the headline. */
function DimensionLine() {
  const reduce = useReducedMotion()
  return (
    <div className="relative mt-4 h-7 max-w-2xl" aria-hidden="true">
      <motion.div
        className="absolute left-0 right-0 top-1/2 h-px origin-left bg-survey-light"
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.1, delay: 0.5, ease: 'easeInOut' }}
      />
      <motion.div className="absolute left-0 top-1 bottom-1 w-px bg-survey-light" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
      <motion.div className="absolute right-0 top-1 bottom-1 w-px bg-survey-light" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} />
      <motion.span
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-ink px-2 font-mono text-[10px] tracking-[0.2em] text-survey-light"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        FOUND · SCORED · DRAFTED · TRACKED
      </motion.span>
    </div>
  )
}

const finds = [
  { icon: Landmark, type: 'Public bid', title: 'Fire Station 19 Kitchen Renovation', org: 'Metro Nashville Procurement', due: 'Due in 11 days', score: 88, tone: 'success' as const },
  { icon: Building2, type: 'GC invite to bid', title: 'Interior Fit-Out, 12,400 SF Medical Office', org: 'Harpeth Valley Construction', due: 'Due in 6 days', score: 81, tone: 'success' as const },
  { icon: ClipboardList, type: 'Permit lead', title: 'Residential Addition Permit, $148,000', org: 'Metro Codes, 37215', due: 'Filed yesterday', score: 74, tone: 'warning' as const },
]

function SweepCard() {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="relative rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur p-4 sm:p-5 shadow-lift"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <StampLabel tone="dark">
          <FileSearch size={12} /> Sweep · Mon 06:00 ET
        </StampLabel>
        <Badge tone="survey" mono>Sample</Badge>
      </div>
      <p className="mt-3 text-white/70 text-sm">3 new matches for Cumberland Ridge Builders</p>
      <ul className="mt-3 space-y-2">
        {finds.map((f, i) => (
          <motion.li
            key={f.title}
            initial={reduce ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + i * 0.25, duration: 0.5 }}
            className="rounded-xl border border-white/10 bg-ink/60 p-3 flex gap-3"
          >
            <div className="h-9 w-9 rounded-lg bg-white/10 text-survey-light flex items-center justify-center shrink-0">
              <f.icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">{f.type}</p>
              <p className="text-white font-medium text-sm leading-snug break-words">{f.title}</p>
              <p className="text-white/60 text-xs mt-0.5 break-words">{f.org} · {f.due}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-[10px] uppercase text-white/50">Fit</p>
              <p className={`font-display text-2xl leading-none ${f.tone === 'success' ? 'text-[#5CCB8A]' : 'text-[#F0B35A]'}`}>{f.score}</p>
            </div>
          </motion.li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between text-xs text-white/50 font-mono">
        <span>Outreach drafted · awaiting approval</span>
        <span>New · stamped</span>
      </div>
    </motion.div>
  )
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80])

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink text-white">
      <BlueprintGrid />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-28 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <motion.p className="eyebrow text-survey-light" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Leads. Bids. One operating system for your business.
          </motion.p>
          <motion.h1
            className="display mt-4 text-[2.9rem] leading-[0.95] sm:text-6xl lg:text-7xl xl:text-[5.4rem]"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Your next contract is already posted. <span className="text-survey-light">We find it.</span>
          </motion.h1>
          <DimensionLine />
          <motion.p className="mt-5 text-base sm:text-lg text-white/75 max-w-xl leading-relaxed" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            Gundy Consultations builds you a website that wins trust and a private portal that finds the public bids and local leads you qualify for every week, drafts the outreach, and runs the jobs from first call to final invoice.
          </motion.p>
          <motion.div className="mt-8 flex flex-col sm:flex-row gap-3" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
            <LinkButton to="#consult" size="lg">Book a Free Consultation</LinkButton>
            <LinkButton to="/demo" size="lg" variant="outline" className="!bg-transparent !text-white !border-white/30 hover:!border-white" icon={<ArrowRight size={18} />}>
              Try the Live Demo
            </LinkButton>
          </motion.div>
          <motion.ul className="mt-8 grid grid-cols-3 gap-3 max-w-lg" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            {[
              ['4 weeks', 'from kickoff to live'],
              ['Daily', 'sweeps on Contracts'],
              ['You approve', 'before anything is sent'],
            ].map(([k, v]) => (
              <li key={k} className="border-l border-white/20 pl-3">
                <p className="font-display text-xl sm:text-2xl uppercase leading-none">{k}</p>
                <p className="text-xs text-white/60 mt-1">{v}</p>
              </li>
            ))}
          </motion.ul>
        </div>
        <motion.div style={{ y }} className="lg:pl-6">
          <SweepCard />
        </motion.div>
      </div>
    </section>
  )
}
