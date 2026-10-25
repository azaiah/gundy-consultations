import { Check } from 'lucide-react'
import { packages, packageNotes } from '@/config/site'
import { LinkButton } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Rise, SectionHeading } from '../motion'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function Packages({ heading = true }: { heading?: boolean }) {
  return (
    <section id="packages" aria-labelledby="pk-h" className="py-20 sm:py-28 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {heading ? <SectionHeading eyebrow="Packages" title={<span id="pk-h">Pick the cadence that matches how much work you want</span>} text="Every package includes the website, the portal and the Company Brain. The difference is how often we sweep and how much we prepare for you." /> : <h2 id="pk-h" className="sr-only">Packages</h2>}
        <div className={`${heading ? 'mt-12' : ''} grid gap-5 lg:grid-cols-3 items-stretch`}>
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
                  <LinkButton to="/contact" className="mt-7 w-full" variant={featured ? 'primary' : 'dark'} size="lg">
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

      </div>
    </section>
  )
}
