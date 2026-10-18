import { Share2, EyeOff, MessageSquareWarning } from 'lucide-react'
import { Rise, SectionHeading } from '../motion'

const problems = [
  {
    icon: Share2,
    title: 'You pay for leads five other contractors also get',
    text: 'Shared lead platforms sell the same homeowner to everyone. You race to the phone, cut your price to win, and still lose half of them to whoever answered first.',
  },
  {
    icon: EyeOff,
    title: 'You miss bids you were qualified for',
    text: 'The school district posted it. The county posted it. A GC emailed an invite. Nobody on your team checks eight portals every morning, so the work goes to someone who did.',
  },
  {
    icon: MessageSquareWarning,
    title: 'The business runs on texts, paper and memory',
    text: 'Estimates in a notebook, change orders agreed to on a job site, invoices sent late because the week got away from you. Every one of those gaps costs margin.',
  },
]

export function Problem() {
  return (
    <section aria-labelledby="problem-h" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="The problem" title={<span id="problem-h">Good contractors lose work for three bad reasons</span>} />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {problems.map((p, i) => (
            <Rise key={p.title} index={i}>
              <article className="card h-full p-6 border-t-4 border-t-survey">
                <div className="h-11 w-11 rounded-xl bg-survey-50 text-survey flex items-center justify-center">
                  <p.icon size={22} aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display uppercase text-2xl leading-tight text-ink">{p.title}</h3>
                <p className="mt-3 text-steel leading-relaxed">{p.text}</p>
              </article>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  )
}
