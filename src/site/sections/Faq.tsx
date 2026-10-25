import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SectionHeading } from '../motion'

const faqs = [
  {
    q: 'How fast is setup?',
    a: 'Four weeks. Weeks 1 and 2 we build the website and configure the portal. Week 3 we load your data: contacts, open jobs, price book, subs and their paperwork, and the first sweep runs. Week 4 you go live with your team trained and outreach drafts waiting for approval.',
  },
  {
    q: 'Do I need to install an app?',
    a: 'No. The portal runs in any modern browser on your phone, tablet or desktop. On a phone you can add it to your home screen so it opens like an app. The field app, client portal and subcontractor views are the same system with a different role.',
  },
  {
    q: 'Who owns my data?',
    a: 'You do. Contacts, projects, estimates, documents and sweep history belong to you. You can export everything at any time, and if you cancel we hand you a complete export before the account closes.',
  },
  {
    q: 'Can I cancel?',
    a: 'Yes. Monthly plans cancel with 30 days notice. Annual prepay is discounted because it is a commitment, and we honor the full term. Setup fees are one-time and non-refundable once build begins, but they credit toward an upgrade within the first 12 months.',
  },
  {
    q: 'What areas do you cover?',
    a: 'Any US market for public bids and GC invitations, because those sources are national or state-level. Permit leads depend on what your county publishes. On the consultation call we check your counties before we quote lead volume.',
  },
  {
    q: 'What does "fit score" mean?',
    a: 'A 0 to 100 score built from six factors: trade match, distance from your base, job size against your bonding limit, set-aside eligibility, your current workload, and time to the deadline. Anything missing a required license or exceeding your single-job bond limit is disqualified outright. You can see the breakdown on every bid.',
  },
  {
    q: 'Is my data secure?',
    a: 'Your portal is a private account with role-based access, encrypted in transit and at rest, with daily backups. Clients and subs only see what their role allows. We never sell or share your data, and the AI features never train on it.',
  },
  {
    q: 'What happens on the consultation call?',
    a: 'Thirty minutes. We learn your trades, licenses, bonding and service area, check permit coverage in your counties, and run a sample sweep against your profile so you can see real opportunities before you decide. No pressure and no contract on the call.',
  },
]

export function Faq({ heading = false }: { heading?: boolean }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" aria-labelledby="faq-h" className="py-20 sm:py-28 scroll-mt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {heading ? <SectionHeading eyebrow="FAQ" title={<span id="faq-h">Questions contractors ask us</span>} align="center" /> : <h2 id="faq-h" className="sr-only">Frequently asked questions</h2>}
        <div className="mt-2 divide-y divide-line card">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-ink hover:bg-concrete/60 min-h-[56px]"
                  >
                    <span>{f.q}</span>
                    <ChevronDown size={20} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                </h3>
                <div id={`faq-${i}`} hidden={!isOpen} className="px-5 pb-5 text-steel leading-relaxed">
                  {f.a}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
