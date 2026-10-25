import {
  Brain, Landmark, FileText, Radar, KanbanSquare, Send, Newspaper, Users, FolderKanban, Calculator, FileSignature,
  CalendarDays, HardHat, StickyNote, Smartphone, UserCircle, Receipt, PieChart, ShieldCheck, Printer, Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SectionHeading } from '../motion'

export const modules = [
  { icon: Brain, title: 'Company Brain', bullets: ['Trades, licenses, NAICS codes', 'Bonding and insurance limits', 'Certifications and set-asides', 'Service radius and counties', 'Live re-scoring when anything changes'] },
  { icon: Landmark, title: 'Bids board', bullets: ['Public bids and GC invitations', 'Bid due, pre-bid, bond, Davis-Bacon flags', 'Go/no-go score breakdown', 'Drafted response and prequal packet', 'Mark no-bid with a reason'] },
  { icon: FileText, title: 'Leads board', bullets: ['New building permits with valuation', 'Commercial build-outs', 'Property managers and HOAs', 'Drafted outreach and call script'] },
  { icon: Radar, title: 'Sweeps', bullets: ['Date and time stamped runs', 'Honest per-source results', 'New badges on every find', 'Cadence by package'] },
  { icon: KanbanSquare, title: 'Pipeline', bullets: ['Found through Won or Lost', 'Drag and drop or Move to', 'Deadline color coding', 'Untouched 7+ days flag', 'Win rate and dollars bid vs. won'] },
  { icon: Send, title: 'Outreach', bullets: ['Email and call script per lead', 'Draft, Approved, Sent, Replied', 'Nothing sent without approval', 'Edit inline'] },
  { icon: Newspaper, title: 'Weekly Briefing', bullets: ["What's new, what's urgent", 'Next moves in plain English', '14-day bid calendar', 'Printable'] },
  { icon: Users, title: 'Contacts and CRM', bullets: ['Leads, customers, subcontractors', 'Import phone contacts (.vcf)', 'Notes with photos', 'Call, text, email, visit logs', 'To-dos per contact'] },
  { icon: FolderKanban, title: 'Projects', bullets: ['Checklists and punch lists with photos', 'Change orders with signature', 'Append-only daily logs', 'Schedule and costs'] },
  { icon: Calculator, title: 'Estimator', bullets: ['Sections and line items', 'Markup, tax rate, contingency', 'Price book', 'AI auto-fill descriptions'] },
  { icon: FileSignature, title: 'Proposals', bullets: ['Branded from the estimate', 'Scope, exclusions, draws, terms', 'Printable', 'On-screen signature'] },
  { icon: CalendarDays, title: 'Calendar', bullets: ['Month, week, agenda views', 'Jobs, visits, inspections, bid due', 'Wheel time picker', 'Export .ics'] },
  { icon: HardHat, title: 'Crew', bullets: ['Roles, trades, hourly cost', 'Certifications with expiry', 'Assignment board by day', 'Availability'] },
  { icon: StickyNote, title: 'Notes and To-dos', bullets: ['Pin, search, tag', 'Today, overdue, upcoming filters', 'Voice-to-text scratchpad'] },
  { icon: Smartphone, title: 'Field app', bullets: ["Today's jobs", 'Clock in and out', 'Daily log and punch photos', 'Client signature on site'] },
  { icon: UserCircle, title: 'Client portal', bullets: ['Schedule and progress photos', 'Approve change orders', 'Selections checklist', 'View and pay invoices'] },
  { icon: Receipt, title: 'Invoicing', bullets: ['Deposit, draws, retainage', 'Printable invoices', 'AIA-style pay application'] },
  { icon: PieChart, title: 'Job costing', bullets: ['Estimate vs. actual by category', 'Margin per job', 'Monthly P&L chart and table'] },
  { icon: ShieldCheck, title: 'Compliance vault', bullets: ['Licenses, insurance, bonds, OSHA, RRP', 'Every sub COI and license', '60/30/7-day alerts', 'Expired paperwork blocks assignment'] },
  { icon: Printer, title: 'Paperwork on demand', bullets: ['Capability statement', 'Prequal packet', 'Proposal, change order, invoice', 'Lien waiver request checklist'] },
  { icon: Sparkles, title: 'AI assist', bullets: ['Auto-fill descriptions and scope', 'Message generator with tone', 'Ask the app help assistant', 'Clear labels on everything AI wrote'] },
]

const GROUPS: { key: string; label: string; titles: string[] }[] = [
  { key: 'all', label: 'Everything', titles: [] },
  { key: 'find', label: 'Find and win work', titles: ['Company Brain', 'Bids board', 'Leads board', 'Sweeps', 'Pipeline', 'Outreach', 'Weekly Briefing'] },
  { key: 'run', label: 'Run the jobs', titles: ['Contacts and CRM', 'Projects', 'Estimator', 'Proposals', 'Calendar', 'Crew', 'Notes and To-dos', 'Field app', 'Client portal'] },
  { key: 'paid', label: 'Get paid and stay compliant', titles: ['Invoicing', 'Job costing', 'Compliance vault', 'Paperwork on demand', 'AI assist'] },
]

export function Modules() {
  const [g, setG] = useState('all')
  const reduce = useReducedMotion()
  const group = GROUPS.find((x) => x.key === g)!
  const shown = g === 'all' ? modules : modules.filter((m) => group.titles.includes(m.title))
  return (
    <section id="features" aria-labelledby="features-h" className="py-20 sm:py-28 bg-paper border-y border-line scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="// Everything inside the portal" title={<span id="features-h">One login runs the whole company</span>} text="Every module below ships in your portal. Filter by what you need to get done." />
        <div role="tablist" aria-label="Filter modules" className="mt-10 flex flex-wrap gap-2">
          {GROUPS.map((x) => {
            const n = x.key === 'all' ? modules.length : x.titles.length
            return (
              <button key={x.key} role="tab" aria-selected={g === x.key} onClick={() => setG(x.key)}
                className={`tap inline-flex items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${g === x.key ? 'bg-ink text-white border-ink' : 'bg-paper text-ink border-line hover:border-steel'}`}>
                {x.label}<span className={`font-mono text-[11px] ${g === x.key ? 'text-survey-light' : 'text-steel'}`}>{String(n).padStart(2, '0')}</span>
              </button>
            )
          })}
        </div>
        <motion.div layout={!reduce} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((m, i) => (
              <motion.div key={m.title} layout={!reduce} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: Math.min(i, 8) * 0.03 } }} exit={reduce ? undefined : { opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}>
                <div className="card group flex h-full flex-col p-5 hover:shadow-lift hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-ink text-survey-light flex items-center justify-center group-hover:bg-survey group-hover:text-white transition-colors">
                      <m.icon size={20} aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-ink">{m.title}</h3>
                    <span className="ml-auto font-mono text-[10px] tracking-[0.18em] text-steel">{String(modules.indexOf(m) + 1).padStart(2, '0')}</span>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-sm text-steel flex-1">
                    {m.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-[9px] h-1 w-1 rounded-full bg-survey shrink-0" aria-hidden="true" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
