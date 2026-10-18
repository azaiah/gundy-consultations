import { Link } from 'react-router-dom'
import {
  Brain, Landmark, FileText, Radar, KanbanSquare, Send, Newspaper, Users, FolderKanban, Calculator, FileSignature,
  CalendarDays, HardHat, StickyNote, Smartphone, UserCircle, Receipt, PieChart, ShieldCheck, Printer, Sparkles, ArrowRight,
} from 'lucide-react'
import { Rise, SectionHeading } from '../motion'

export const modules = [
  { icon: Brain, title: 'Company Brain', to: '/demo/brain', bullets: ['Trades, licenses, NAICS codes', 'Bonding and insurance limits', 'Certifications and set-asides', 'Service radius and counties', 'Live re-scoring when anything changes'] },
  { icon: Landmark, title: 'Bids board', to: '/demo/bids', bullets: ['Public bids and GC invitations', 'Bid due, pre-bid, bond, Davis-Bacon flags', 'Go/no-go score breakdown', 'Drafted response and prequal packet', 'Mark no-bid with a reason'] },
  { icon: FileText, title: 'Leads board', to: '/demo/leads', bullets: ['New building permits with valuation', 'Commercial build-outs', 'Property managers and HOAs', 'Drafted outreach and call script'] },
  { icon: Radar, title: 'Sweeps', to: '/demo/sweeps', bullets: ['Date and time stamped runs', 'Honest per-source results', 'New badges on every find', 'Cadence by package'] },
  { icon: KanbanSquare, title: 'Pipeline', to: '/demo/pipeline', bullets: ['Found through Won or Lost', 'Drag and drop or Move to', 'Deadline color coding', 'Untouched 7+ days flag', 'Win rate and dollars bid vs. won'] },
  { icon: Send, title: 'Outreach', to: '/demo/outreach', bullets: ['Email and call script per lead', 'Draft, Approved, Sent, Replied', 'Nothing sent without approval', 'Edit inline'] },
  { icon: Newspaper, title: 'Weekly Briefing', to: '/demo/briefing', bullets: ["What's new, what's urgent", 'Next moves in plain English', '14-day bid calendar', 'Printable'] },
  { icon: Users, title: 'Contacts and CRM', to: '/demo/contacts', bullets: ['Leads, customers, subcontractors', 'Import phone contacts (.vcf)', 'Notes with photos', 'Call, text, email, visit logs', 'To-dos per contact'] },
  { icon: FolderKanban, title: 'Projects', to: '/demo/projects', bullets: ['Checklists and punch lists with photos', 'Change orders with signature', 'Append-only daily logs', 'Schedule and costs'] },
  { icon: Calculator, title: 'Estimator', to: '/demo/projects', bullets: ['Sections and line items', 'Markup, tax rate, contingency', 'Price book', 'AI auto-fill descriptions'] },
  { icon: FileSignature, title: 'Proposals', to: '/demo/projects', bullets: ['Branded from the estimate', 'Scope, exclusions, draws, terms', 'Printable', 'On-screen signature'] },
  { icon: CalendarDays, title: 'Calendar', to: '/demo/calendar', bullets: ['Month, week, agenda views', 'Jobs, visits, inspections, bid due', 'Wheel time picker', 'Export .ics'] },
  { icon: HardHat, title: 'Crew', to: '/demo/crew', bullets: ['Roles, trades, hourly cost', 'Certifications with expiry', 'Assignment board by day', 'Availability'] },
  { icon: StickyNote, title: 'Notes and To-dos', to: '/demo/notes', bullets: ['Pin, search, tag', 'Today, overdue, upcoming filters', 'Voice-to-text scratchpad'] },
  { icon: Smartphone, title: 'Field app', to: '/demo/field', bullets: ["Today's jobs", 'Clock in and out', 'Daily log and punch photos', 'Client signature on site'] },
  { icon: UserCircle, title: 'Client portal', to: '/demo/client', bullets: ['Schedule and progress photos', 'Approve change orders', 'Selections checklist', 'View and pay invoices'] },
  { icon: Receipt, title: 'Invoicing', to: '/demo/invoices', bullets: ['Deposit, draws, retainage', 'Printable invoices', 'AIA-style pay application'] },
  { icon: PieChart, title: 'Job costing', to: '/demo/costing', bullets: ['Estimate vs. actual by category', 'Margin per job', 'Monthly P&L chart and table'] },
  { icon: ShieldCheck, title: 'Compliance vault', to: '/demo/compliance', bullets: ['Licenses, insurance, bonds, OSHA, RRP', 'Every sub COI and license', '60/30/7-day alerts', 'Expired paperwork blocks assignment'] },
  { icon: Printer, title: 'Paperwork on demand', to: '/demo/docs', bullets: ['Capability statement', 'Prequal packet', 'Proposal, change order, invoice', 'Lien waiver request checklist'] },
  { icon: Sparkles, title: 'AI assist', to: '/demo/ai', bullets: ['Auto-fill descriptions and scope', 'Message generator with tone', 'Ask the app help assistant', 'Honest Live AI vs. Demo output chip'] },
]

export function Modules() {
  return (
    <section id="features" aria-labelledby="features-h" className="py-20 sm:py-28 bg-paper border-y border-line scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Everything inside the portal" title={<span id="features-h">One login runs the whole company</span>} text="Every module below is live in the demo. Click any card to open that exact screen." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((m, i) => (
            <Rise key={m.title} index={i % 4}>
              <Link to={m.to} className="card group flex h-full flex-col p-5 hover:shadow-lift hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blueprint-50 text-blueprint flex items-center justify-center group-hover:bg-survey group-hover:text-white transition-colors">
                    <m.icon size={20} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-ink">{m.title}</h3>
                </div>
                <ul className="mt-4 space-y-1.5 text-sm text-steel flex-1">
                  {m.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-[9px] h-1 w-1 rounded-full bg-steel/60 shrink-0" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blueprint">
                  See it in the demo <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  )
}
