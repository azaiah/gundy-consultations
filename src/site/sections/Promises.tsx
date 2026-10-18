import { Check, X } from 'lucide-react'
import { Rise, SectionHeading } from '../motion'

const we = [
  'Sweep the public sources and your GC invitations on the schedule you pay for, and stamp every run with the date and time.',
  'Score every find against your real credentials and tell you why it fits and why it might not.',
  'Draft every email, call script and prequal packet, and wait for your approval before anything goes out.',
  'Build the website on your domain and hand you the keys. You own your data and can export it.',
  'Check permit-data coverage in your county before we promise lead volume.',
]
const not = [
  'Scrape paid plan rooms such as Dodge, ConstructConnect or BuildingConnected. If you subscribe, we work through your own login.',
  'Do quantity takeoff from plans. The estimator is yours to drive; we make it fast, not automatic.',
  'File certified payroll or act as your compliance officer. The vault tracks paperwork; your accountant files it.',
  'Guarantee a number of leads before we have checked what permit data your county actually publishes.',
  'Write fake reviews, buy reviews or post testimonials we cannot verify.',
]

export function Promises() {
  return (
    <section aria-labelledby="promise-h" className="py-20 sm:py-28 bg-paper border-y border-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Straight talk" title={<span id="promise-h">What we promise, and what we don't</span>} />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Rise index={0}>
            <div className="card h-full p-6 sm:p-8 border-t-4 border-t-success">
              <h3 className="font-display uppercase text-2xl">We do</h3>
              <ul className="mt-5 space-y-3">
                {we.map((t) => (
                  <li key={t} className="flex gap-3 text-ink">
                    <Check size={18} className="text-success mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Rise>
          <Rise index={1}>
            <div className="card h-full p-6 sm:p-8 border-t-4 border-t-danger">
              <h3 className="font-display uppercase text-2xl">We don't</h3>
              <ul className="mt-5 space-y-3">
                {not.map((t) => (
                  <li key={t} className="flex gap-3 text-ink">
                    <X size={18} className="text-danger mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Rise>
        </div>
      </div>
    </section>
  )
}
