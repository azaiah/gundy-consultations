import { Check } from 'lucide-react'
import { packages, packageNotes, setupTimeline } from '@/config/site'
import { LinkButton } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Rise, SectionHeading } from '../motion'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function Packages() {
  return (
    <section id="packages" aria-labelledby="pk-h" className="py-20 sm:py-28 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Packages" title={<span id="pk-h">Pick the cadence that matches how much work you want</span>} text="Every package includes the website, the portal and the Company Brain. The difference is how often we sweep and how much we prepare for you." />
        <div className="mt-12 grid gap-5 lg:grid-cols-3 items-stretch">
          {packages.map((p, i) => {
            const featured = !!p.highlight
            return (
              <Rise key={p.id} index={i}>
                <article className={`relative h-full flex flex-col rounded-2xl border p-6 sm:p-7 ${featured ? 'bg-ink text-white border-ink shadow-lift' : 'card'}`}>
                  {featured && (
                    <span className="absolute -top-3 left-6">
                      <Badge tone="survey" mono>{p.highlight}</Badge>
                    </span>
                  )}
                  <p className={`eyebrow ${featured ? 'text-survey-light' : ''}`}>{p.audience}</p>
                  <h3 className="font-display uppercase text-4xl mt-2">{p.name}</h3>
                  <div className="mt-5 flex items-baseline gap-2 flex-wrap">
                    <span className="font-display text-5xl leading-none">{usd.format(p.monthly)}</span>
                    <span className={`text-sm ${featured ? 'text-white/70' : 'text-steel'}`}>/ month</span>
                  </div>
                  <p className={`mt-1 text-sm ${featured ? 'text-white/70' : 'text-steel'}`}>+ {usd.format(p.setup)} one-time setup</p>
                  <p className={`mt-4 font-mono text-xs uppercase tracking-wider ${featured ? 'text-white/60' : 'text-steel'}`}>{p.cadence}</p>
                  <ul className="mt-5 space-y-2.5 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm">
                        <Check size={16} className={`${featured ? 'text-survey-light' : 'text-success'} mt-0.5 shrink-0`} aria-hidden="true" />
                        <span className={featured ? 'text-white/90' : 'text-ink'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <LinkButton to="#consult" className="mt-7 w-full" variant={featured ? 'primary' : 'dark'} size="lg">
                    Book a Free Consultation
                  </LinkButton>
                </article>
              </Rise>
            )
          })}
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm text-steel">
          {packageNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        <div className="mt-14 card p-6 sm:p-8">
          <p className="eyebrow">Setup timeline</p>
          <h3 className="font-display uppercase text-3xl mt-2">Live in four weeks</h3>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {setupTimeline.map((t, i) => (
              <li key={t.week} className="relative pl-5 border-l-2 border-survey">
                <span className="stamp">{t.week}</span>
                <h4 className="font-semibold text-ink mt-1">{i + 1}. {t.title}</h4>
                <p className="text-sm text-steel mt-1">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
