import { Home, Landmark, Check } from 'lucide-react'
import { Rise, SectionHeading } from '../motion'

const groups = [
  {
    icon: Home,
    title: 'Residential remodelers and roofers',
    pitch: 'Stop paying for shared leads.',
    text: 'You want homeowners who have already decided to build. Permits tell us who they are. Property managers and HOAs tell us who hires on repeat.',
    on: ['Permit lead sweeps in your counties', 'Property manager and HOA outreach', 'Estimate request form on your website feeding the CRM', 'Proposals with e-signature and draws', 'Client portal for selections and payments', 'Review requests after every job'],
  },
  {
    icon: Landmark,
    title: 'Commercial GCs and specialty subs',
    pitch: 'Never miss a bid you are qualified for.',
    text: 'You want public work and GC invitations that match your bonding, your trades and your certifications, with the paperwork ready before the pre-bid.',
    on: ['Public bid sweeps across federal, state, county, city, schools and housing', 'GC invitation-to-bid tracking', 'Go/no-go scoring against bonding and set-asides', 'Capability statement and prequal packet', 'AIA-style pay applications with retainage', 'Subcontractor compliance vault with COI tracking'],
  },
]

export function WhoItsFor({ heading = false }: { heading?: boolean }) {
  return (
    <section id="who" aria-labelledby="who-h" className="py-20 sm:py-28 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {heading ? <SectionHeading eyebrow="Who it's for" title={<span id="who-h">Two buyers. One product. Different switches turned on.</span>} /> : <h2 id="who-h" className="sr-only">Who it's for</h2>}
        <div className="mt-2 grid gap-5 lg:grid-cols-2">
          {groups.map((g, i) => (
            <Rise key={g.title} index={i}>
              <article className="card h-full p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-survey-50 text-survey flex items-center justify-center">
                    <g.icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="font-display uppercase text-2xl text-ink leading-tight">{g.title}</h3>
                </div>
                <p className="mt-5 font-semibold text-ink text-lg">{g.pitch}</p>
                <p className="mt-2 text-steel leading-relaxed">{g.text}</p>
                <p className="stamp mt-6 mb-3">What gets turned on</p>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {g.on.map((o) => (
                    <li key={o} className="flex gap-2 text-sm text-ink">
                      <Check size={16} className="text-success mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  )
}
