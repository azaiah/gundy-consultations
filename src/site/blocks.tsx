import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Radar, Trophy, HardHat } from 'lucide-react'
import { LinkButton } from '@/components/Button'
import { packages, setupTimeline } from '@/config/site'
import { Rise, SectionHeading } from './motion'
import { BlueprintField, CountUp, DeviceShowcase, SCREENS } from './tech'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

/** Closing call to action used at the bottom of every page. */
export function CtaBand({ title = 'See your own sweep before you decide.', text = 'Thirty minutes. We check your counties, run a sample sweep against your trades and credentials, and show you the portal built around a company like yours.' }: { title?: string; text?: string }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <BlueprintField />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
        <div>
          <p className="sys-label"><span className="sys-index">[ GO ]</span> Book a free consultation</p>
          <h2 className="display mt-3 text-4xl sm:text-5xl lg:text-6xl">{title}</h2>
          <p className="mt-4 text-white/75 max-w-2xl leading-relaxed">{text}</p>
        </div>
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
          <LinkButton to="/contact" size="lg" icon={<ArrowRight size={18} />} className="flex-row-reverse">Book a Free Consultation</LinkButton>
          <LinkButton to="/pricing" size="lg" variant="outline" className="!bg-transparent !text-white !border-white/30 hover:!border-white">See Packages</LinkButton>
        </div>
      </div>
    </section>
  )
}

/** Tabbed tour of real portal screens on a laptop and a phone. */
export function ScreenTour({ dark = false }: { dark?: boolean }) {
  const [i, setI] = useState(0)
  const s = SCREENS[i]
  return (
    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
      <div>
        <div role="tablist" aria-label="Portal screens" className="grid gap-2">
          {SCREENS.map((x, k) => (
            <button
              key={x.key}
              role="tab"
              aria-selected={k === i}
              onClick={() => setI(k)}
              className={`tour-tab ${k === i ? 'is-on' : ''} ${dark ? 'tour-tab-dark' : ''}`}
            >
              <span className="font-mono text-[11px] tracking-[0.18em] text-survey">0{k + 1}</span>
              <span className="min-w-0 text-left">
                <span className={`block font-semibold ${dark ? 'text-white' : 'text-ink'}`}>{x.label}</span>
                <span className={`block text-sm mt-0.5 ${dark ? 'text-white/65' : 'text-steel'}`}>{x.caption}</span>
              </span>
              {k === i && <span className="tour-progress" aria-hidden="true" />}
            </button>
          ))}
        </div>
        <p className={`stamp mt-5 ${dark ? '!text-white/45' : ''}`}>Real screens from a sample company portal</p>
      </div>
      <div className="relative">
        <DeviceShowcase index={i} chips={false} />
        <p className="sr-only" aria-live="polite">{s.label}</p>
      </div>
    </div>
  )
}

/** Three pillars: find, win, run. Links into the inner pages. */
export function Pillars() {
  const items = [
    { icon: Radar, n: '01', k: 'Find work', title: 'The engine sweeps for you', text: 'Public bids, GC invitations, permits and property managers, scored against your trades, bonding and service area.', to: '/how-it-works', metric: <>Up to <CountUp to={5} /> sweeps a week</> },
    { icon: Trophy, n: '02', k: 'Win work', title: 'The paperwork is already drafted', text: 'Outreach emails, call scripts, capability statements and prequal packets, waiting for your approval.', to: '/portal', metric: <>Nothing sent without your OK</> },
    { icon: HardHat, n: '03', k: 'Run work', title: 'One login runs the company', text: 'Projects, estimates, change orders, crews, compliance, invoices and job costing, on the laptop and in the truck.', to: '/portal', metric: <><CountUp to={21} /> modules in one portal</> },
  ]
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((p, i) => (
        <Rise key={p.k} index={i}>
          <Link to={p.to} className="pillar group">
            <div className="flex items-center justify-between">
              <span className="pillar-icon"><p.icon size={22} aria-hidden="true" /></span>
              <span className="font-mono text-xs tracking-[0.2em] text-steel">// {p.n}</span>
            </div>
            <p className="eyebrow mt-6">{p.k}</p>
            <h3 className="font-display uppercase text-3xl leading-[0.95] mt-2 text-ink">{p.title}</h3>
            <p className="mt-3 text-steel leading-relaxed">{p.text}</p>
            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-ink">{p.metric}</span>
              <ArrowRight size={18} className="text-survey transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </Link>
        </Rise>
      ))}
    </div>
  )
}

/** Compact package cards for the home page. */
export function PackagesTeaser() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {packages.map((p, i) => {
        const featured = !!p.highlight
        return (
          <Rise key={p.id} index={i}>
            <Link to="/pricing" className={`pkg-mini group ${featured ? 'is-featured' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`font-mono text-[11px] uppercase tracking-[0.18em] ${featured ? 'text-survey-light' : 'text-survey'}`}>{p.cadenceShort} sweeps</span>
                {featured && <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-survey px-2 py-0.5 text-white">Most popular</span>}
              </div>
              <h3 className="font-display uppercase text-4xl mt-3">{p.name}</h3>
              <p className="mt-3"><span className="font-display text-4xl">{usd.format(p.monthly)}</span><span className={featured ? 'text-white/65' : 'text-steel'}> / month</span></p>
              <p className={`text-sm mt-1 ${featured ? 'text-white/65' : 'text-steel'}`}>+ {usd.format(p.setup)} setup · {p.seats}</p>
              <p className={`mt-4 text-sm ${featured ? 'text-white/80' : 'text-ink'}`}>{p.audience}</p>
              <span className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${featured ? 'text-survey-light' : 'text-survey'}`}>Compare packages <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
            </Link>
          </Rise>
        )
      })}
    </div>
  )
}

/** Four-week setup timeline. */
export function SetupTimeline() {
  return (
    <div className="card p-6 sm:p-8 relative overflow-hidden">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow">Setup timeline</p>
          <h3 className="font-display uppercase text-3xl sm:text-4xl mt-2">Live in four weeks</h3>
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-steel">Kickoff → Live · 28 days</span>
      </div>
      <ol className="mt-8 grid gap-6 sm:grid-cols-3 relative">
        {setupTimeline.map((t, i) => (
          <li key={t.week} className="relative pl-5 border-l-2 border-survey">
            <span className="stamp">{t.week}</span>
            <h4 className="font-semibold text-ink mt-1">{i + 1}. {t.title}</h4>
            <p className="text-sm text-steel mt-1">{t.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((t) => (
        <li key={t} className="flex gap-2 text-sm"><Check size={16} className="text-success mt-0.5 shrink-0" aria-hidden="true" /><span>{t}</span></li>
      ))}
    </ul>
  )
}

export { SectionHeading }
