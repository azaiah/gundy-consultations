import { ShieldCheck, ClipboardList, MapPinned, Images, UserPlus, Star } from 'lucide-react'
import { Rise, SectionHeading } from '../motion'

const items = [
  { icon: ShieldCheck, title: 'Credentials wall', text: 'Licensed, bonded and insured shown with license numbers and limits. Trust before the first call.' },
  { icon: ClipboardList, title: '"Get an Estimate" on every page', text: 'A multi-step form with photo upload. Submissions land in your portal as leads, not in a forgotten inbox.' },
  { icon: MapPinned, title: 'Trade and service-area pages', text: 'One page per trade and per city or county you serve, so you rank for the searches that actually turn into jobs.' },
  { icon: Images, title: 'Before and after sliders', text: 'A project gallery with sliders and captions. Your work, organized the way a buyer compares it.' },
  { icon: UserPlus, title: 'Subcontractor sign-up', text: 'Subs apply on your site and upload their COI and license straight into the compliance vault.' },
  { icon: Star, title: 'Real Google reviews only', text: 'We embed the reviews you earned. We never write fake ones, and we will not post them if someone sends them.' },
]

export function Website() {
  return (
    <section aria-labelledby="site-h" className="py-20 sm:py-28 bg-ink text-white bg-blueprint-grid-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading dark eyebrow="The website we build for you" title={<span id="site-h">A front door built to convert, wired to the back office</span>} text="Most contractor sites are a brochure. Yours becomes the first step of the sales process: every form, every sign-up and every review feeds the portal." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Rise key={it.title} index={i % 3}>
              <article className="h-full rounded-xl border border-white/10 bg-white/[0.04] p-6">
                <div className="h-10 w-10 rounded-lg bg-survey-light/15 text-survey-light flex items-center justify-center">
                  <it.icon size={20} aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-semibold text-lg">{it.title}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{it.text}</p>
              </article>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  )
}
