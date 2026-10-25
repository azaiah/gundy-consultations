import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { LinkButton } from '@/components/Button'
import { BlueprintField, CountUp, DeviceShowcase, Scramble } from '../tech'

/** Dimension line that extends under the headline, labeled like a drawing. */
function DimensionLine() {
  const reduce = useReducedMotion()
  return (
    <div className="relative mt-5 h-7 max-w-2xl" aria-hidden="true">
      <motion.div className="absolute left-0 right-0 top-1/2 h-px origin-left bg-survey-light" initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1, delay: 0.5, ease: 'easeInOut' }} />
      <motion.div className="absolute left-0 top-1 bottom-1 w-px bg-survey-light" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
      <motion.div className="absolute right-0 top-1 bottom-1 w-px bg-survey-light" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} />
      <motion.span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-ink px-2 font-mono text-[10px] tracking-[0.2em] text-survey-light whitespace-nowrap" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
        FOUND · SCORED · DRAFTED · TRACKED
      </motion.span>
    </div>
  )
}

export function Hero() {
  const reduce = useReducedMotion()
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <BlueprintField />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 grid gap-12 lg:gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div className="min-w-0">
          <p className="sys-label">
            <span className="sys-index">[ SYS · ONLINE ]</span> <Scramble text="Leads · Bids · One operating system" />
          </p>
          <motion.h1
            className="display mt-4 text-[2.8rem] leading-[0.92] sm:text-6xl lg:text-[4.6rem] xl:text-[5.2rem]"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Your next contract is already posted. <span className="text-survey-light">We find it.</span>
          </motion.h1>
          <DimensionLine />
          <motion.p className="mt-5 text-base sm:text-lg text-white/75 max-w-xl leading-relaxed" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            We build contractors a website that wins trust and a private portal that finds the public bids and local leads you qualify for, drafts the outreach, and runs the jobs from first call to final invoice.
          </motion.p>
          <motion.div className="mt-8 flex flex-col sm:flex-row gap-3" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
            <LinkButton to="/contact" size="lg">Book a Free Consultation</LinkButton>
            <LinkButton to="/portal" size="lg" variant="outline" className="!bg-transparent !text-white !border-white/30 hover:!border-white flex-row-reverse" icon={<ArrowRight size={18} />}>
              See the Portal
            </LinkButton>
          </motion.div>
          <motion.dl className="mt-10 grid grid-cols-3 gap-3 max-w-lg" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            {[
              [<CountUp key="a" to={4} suffix=" wks" />, 'kickoff to live'],
              [<CountUp key="b" to={21} />, 'portal modules'],
              [<CountUp key="c" to={5} suffix="×/wk" />, 'sweeps on Contracts'],
            ].map(([k, v], i) => (
              <div key={i} className="stat-tick">
                <dt className="sr-only">{v as string}</dt>
                <dd className="font-display text-2xl sm:text-3xl uppercase leading-none">{k}</dd>
                <dd className="font-mono text-[10.5px] uppercase tracking-wider text-white/55 mt-1.5">{v as string}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
        <motion.div className="min-w-0" initial={reduce ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}>
          <DeviceShowcase eager />
          <p className="mt-3 text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/40">Live portal · sample company data</p>
        </motion.div>
      </div>
    </section>
  )
}
