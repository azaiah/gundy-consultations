import { Landmark, Home } from 'lucide-react'
import { Rise, SectionHeading } from '../motion'

const cols = [
  {
    icon: Landmark,
    label: 'Bids',
    who: 'Commercial GCs and specialty subs',
    headline: 'Never miss a bid you are qualified for.',
    points: [
      'Public solicitations from federal, state, county, city, school and housing-authority portals.',
      'Invitations to bid from GCs who already know your name, pulled from your inbox into the board.',
      'Bond requirement, prevailing-wage flag, set-aside and pre-bid date read for you.',
      'A go/no-go score before you open the plans.',
    ],
  },
  {
    icon: Home,
    label: 'Leads',
    who: 'Residential remodelers and roofers',
    headline: 'Stop paying for shared leads.',
    points: [
      'New building permits in your service area, with address, valuation and the applicant.',
      'New commercial build-outs, property managers and HOAs who hire your trade on repeat.',
      'A drafted email and a call script for every lead, personal to the property.',
      'Leads nobody else is selling, because they came from public records and your own outreach.',
    ],
  },
]

export function BidsVsLeads() {
  return (
    <section aria-labelledby="bvl-h" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Bids vs. leads, simply" title={<span id="bvl-h">Two kinds of work. One engine finds both.</span>} />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {cols.map((c, i) => (
            <Rise key={c.label} index={i}>
              <article className="card h-full p-6 sm:p-8 relative overflow-hidden">
                <span className="absolute right-4 top-4 font-display uppercase text-7xl text-line/60 leading-none select-none" aria-hidden="true">
                  {c.label}
                </span>
                <div className="relative">
                  <div className="h-11 w-11 rounded-xl bg-blueprint-50 text-blueprint flex items-center justify-center">
                    <c.icon size={22} aria-hidden="true" />
                  </div>
                  <p className="eyebrow mt-5">{c.who}</p>
                  <h3 className="font-display uppercase text-3xl mt-2 text-ink">{c.headline}</h3>
                  <ul className="mt-5 space-y-3">
                    {c.points.map((p) => (
                      <li key={p} className="flex gap-3 text-steel">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-survey shrink-0" aria-hidden="true" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  )
}
