import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, LifeBuoy, RotateCcw } from 'lucide-react'
import { Button } from '@/components/Button'
import { useDemo } from '../../store'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { SearchBox } from '../shared/Filters'

export const helpTopics: { q: string; a: string; to: string; keywords: string }[] = [
  { q: 'How do I add a lead?', a: 'Go to Contacts, choose the Leads tab and tap Add contact. Or open a permit lead on the Leads board and tap Create contact; it is pre-filled from the permit record.', to: '/demo/contacts', keywords: 'lead add contact new' },
  { q: 'How do I import contacts from my phone?', a: 'Contacts, then Import. Export your phone contacts as a .vcf file (share a contact group on iPhone, or Export from Google Contacts) and choose that file. Review each one, tag it Lead, Customer or Sub, and import. Duplicates are flagged by phone or email.', to: '/demo/contacts/import', keywords: 'import vcf vcard phone contacts' },
  { q: 'How do I tag a contact as a customer or sub?', a: 'Open the contact, tap Edit and change the Type. On import, you choose the tag before the contact lands.', to: '/demo/contacts', keywords: 'tag type customer sub lead' },
  { q: 'How do I log a call?', a: 'Open the contact, choose the Logs tab, tap Log activity, pick Call, add the outcome and notes (or dictate them) and save. It appears on the timeline.', to: '/demo/contacts', keywords: 'log call text email meeting visit timeline' },
  { q: 'How do I build an estimate?', a: 'Open a project and choose the Estimate tab. Add lines by hand or from the price book, set quantity, unit cost and markup per line. Sections group the lines; the totals block updates as you type.', to: '/demo/projects', keywords: 'estimate line price book markup' },
  { q: 'How do I change the tax rate?', a: 'Each estimate has its own Tax rate field and a choice of what it applies to (materials only, all lines, or none). The default for new estimates lives in Settings.', to: '/demo/settings', keywords: 'tax rate default settings' },
  { q: 'How do I send a proposal?', a: 'Open the project, Proposal tab, and tap Generate proposal (it builds from the estimate). Edit scope, inclusions, draws and terms, then Print to PDF or Mark sent.', to: '/demo/projects', keywords: 'proposal send print scope draws' },
  { q: 'How do I get a signature?', a: 'On a proposal or change order, tap Collect signature or Client approval. The client types their name and signs on screen. In the client portal they can do the same from their phone. A legally binding e-signature provider is coming in v1.1.', to: '/demo/projects', keywords: 'signature sign e-signature approve' },
  { q: 'How do I schedule a job?', a: 'Calendar, Add event, pick Job as the type, choose the project and set the time with the wheel picker. You can also add events from the Schedule tab of a project.', to: '/demo/calendar', keywords: 'schedule job calendar event time' },
  { q: 'How do I export to my phone calendar?', a: 'Calendar, Export .ics for everything, or open one event and tap Export .ics. Open the downloaded file and your phone adds it. The live app syncs automatically.', to: '/demo/calendar', keywords: 'export ics calendar sync phone' },
  { q: 'How do I run a sweep?', a: 'Sweeps, then Run sweep now (demo). The engine checks each enabled source, reports what it found per source, and stamps every new record with the date and time. Real sweeps run on your package cadence.', to: '/demo/sweeps', keywords: 'sweep run sources cadence' },
  { q: 'How do I read a fit score?', a: 'Open any bid or lead. The score is out of 100 from six factors: trade match, distance, job size vs. bonding, set-aside eligibility, workload and deadline. Anything missing a required license, exceeding the single bond limit, or restricted to a set-aside you do not hold is disqualified outright. 70 and up is Go.', to: '/demo/bids', keywords: 'fit score go no-go breakdown' },
  { q: "How do I add a sub's COI?", a: 'Compliance, Subcontractors tab, find the sub and tap Add document (type COI) with the expiry date, then Upload the file. Or do the same from the Compliance tab on the contact. An expired COI blocks the sub from being assigned until it is renewed.', to: '/demo/compliance', keywords: 'coi insurance sub upload compliance expired block' },
  { q: 'How do I use voice notes?', a: 'Tap the microphone button next to any note or description field and speak. Text appears as you talk; tap again to stop. The Scratchpad in Notes shows the live transcript. Works in Chrome, Edge and Safari.', to: '/demo/notes', keywords: 'voice dictate mic speech scratchpad' },
  { q: 'How do I move a bid through the pipeline?', a: 'Pipeline. Drag a card to the next column on desktop, or tap the menu on the card and choose Move to. Cards get a red edge inside 3 days of a deadline and a flag after 7 days untouched.', to: '/demo/pipeline', keywords: 'pipeline move stage drag kanban' },
  { q: 'How do I approve outreach?', a: 'Outreach. Edit the draft if you want, tap Approve, then Send (demo). Nothing is sent before Approve.', to: '/demo/outreach', keywords: 'outreach approve send draft' },
  { q: 'How do I create an invoice from a draw?', a: 'Open the project, Invoices tab, New invoice, and pick the draw from the proposal schedule. The amount is calculated from the estimate total. For commercial work choose AIA-style pay application.', to: '/demo/invoices', keywords: 'invoice draw deposit pay application retainage' },
  { q: 'How do I reset the demo?', a: 'Tap Reset Demo in the top bar, or Reset in Settings. Everything returns to the sample data.', to: '/demo/settings', keywords: 'reset demo sample data' },
]

export default function Help() {
  const { state, set } = useDemo()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<number | null>(null)
  const list = useMemo(() => helpTopics.filter((t) => !q || `${t.q} ${t.a} ${t.keywords}`.toLowerCase().includes(q.toLowerCase())), [q])
  return (
    <div className="max-w-3xl">
      <SampleRibbon />
      <PageHeader title="Help Center" helpKey="help" subtitle="Short answers to the questions contractors ask most." actions={<Button variant="outline" onClick={() => set('settings', { ...state.settings, tourDone: false })} icon={<RotateCcw size={16} />}>Replay tour</Button>} />
      <SearchBox value={q} onChange={setQ} placeholder="How do I..." className="mb-4" />
      {list.length === 0 ? <p className="text-sm text-steel flex items-center gap-2"><LifeBuoy size={16} /> Nothing matched. Try different words, or ask the assistant (bottom right).</p> : (
        <div className="card divide-y divide-line">
          {list.map((t, i) => {
            const isOpen = open === i
            return (
              <div key={t.q}>
                <h2>
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left font-medium min-h-[52px] hover:bg-concrete/60">
                    {t.q}<ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                </h2>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm text-steel leading-relaxed">
                    <p>{t.a}</p>
                    <Link to={t.to} className="inline-flex mt-2 text-blueprint underline min-h-[32px] items-center">Open the screen</Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
