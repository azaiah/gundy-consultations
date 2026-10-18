import { useMemo, useState } from 'react'
import { Radar, Play, Check, Minus, AlertCircle } from 'lucide-react'
import { Card, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { StampLabel } from '@/components/StampLabel'
import { Modal } from '@/components/Modal'
import { useDemo } from '../../store'
import { nextSweep, cadenceLabel } from '../../selectors'
import type { Sweep, Opportunity, SweepSourceResult } from '../../types'
import { fmtDate, fmtTime, fmtTime24, stamp, addDays, ymd } from '../../lib/dates'
import { uid } from '../../lib/ids'
import { packages } from '@/config/site'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { NewBadge } from '../shared/DueBadge'
import { OpportunityDrawer } from '../shared/OpportunityDrawer'

const allSources = ['SAM.gov', 'State of Tennessee CPO', 'Metro Nashville Procurement', 'Williamson County', 'Rutherford County', 'Metro Nashville Public Schools', 'MDHA', 'GC Invitation to Bid', 'Metro Codes Permit', 'Commercial Build-Out', 'Property Manager', 'HOA']

/** Pool of extra records a simulated run can discover. Stamped at run time. */
function freshFinds(n: number, foundAt: string, sweepId: string): Opportunity[] {
  const t = new Date()
  const pool: Omit<Opportunity, 'foundAt' | 'sweepId' | 'lastTouchedAt' | 'status' | 'notes'>[] = [
    { id: uid('b'), kind: 'bid', title: 'Metro Water Services Admin Building Breakroom Renovation', owner: 'Metro Nashville Government', source: 'Metro Nashville Procurement', trade: 'General contractor', requiredTrades: ['General contractor'], estValue: 142_000, dueDate: ymd(addDays(t, 16)), preBidDate: ymd(addDays(t, 6)), bondRequired: true, prevailingWage: true, setAside: 'None', distanceMiles: 6, county: 'Davidson', scopeSummary: 'Renovate a 900 SF breakroom and adjacent restrooms in an occupied administration building.', whyFits: ['Interior renovation', 'Davidson County'], whyNot: ['Occupied building'], addenda: [], documents: [] },
    { id: uid('b'), kind: 'bid', title: 'Wilson County Senior Center Roof Replacement', owner: 'Wilson County Government', source: 'State of Tennessee CPO', trade: 'Roofing', requiredTrades: ['Roofing'], estValue: 118_000, dueDate: ymd(addDays(t, 20)), bondRequired: true, prevailingWage: false, setAside: 'State small business', distanceMiles: 28, county: 'Wilson', scopeSummary: 'Replace 14,000 SF modified bitumen roof with TPO.', whyFits: ['Set-aside held', 'Wilson is a home county'], whyNot: ['TPO experience should be documented'], addenda: [], documents: [] },
    { id: uid('b'), kind: 'bid', title: 'Tenant Improvement, Suite 110, 6,000 SF Insurance Office', owner: 'Ridgeline Commercial (GC)', source: 'GC Invitation to Bid', trade: 'Interior finishes', requiredTrades: ['Interior finishes', 'Carpentry'], estValue: 88_000, dueDate: ymd(addDays(t, 7)), bondRequired: false, prevailingWage: false, setAside: 'None', distanceMiles: 9, county: 'Davidson', scopeSummary: 'Partitions, doors, millwork and finishes for an insurance office.', whyFits: ['New GC relationship', 'Finishes'], whyNot: ['Seven days to bid'], addenda: [], documents: [] },
    { id: uid('p'), kind: 'lead', title: 'Residential Addition Permit, 915 Granny White Pike', owner: 'Owner-filed', source: 'Metro Codes Permit', trade: 'General contractor', requiredTrades: ['General contractor'], estValue: 210_000, bondRequired: false, prevailingWage: false, setAside: 'None', distanceMiles: 5, county: 'Davidson', address: '915 Granny White Pike, Nashville, TN 37204', permit: { number: `CARN-${t.getFullYear()}-0${Math.floor(1200 + Math.random() * 300)}`, type: 'Residential Addition', valuation: 210_000, filedDate: ymd(t), applicant: 'Owner-filed' }, scopeSummary: 'Two-story rear addition, owner-filed, no contractor of record.', whyFits: ['Owner-filed', 'Close'], whyNot: [], addenda: [], documents: [] },
    { id: uid('p'), kind: 'lead', title: 'Commercial Build-Out, Harding Place Physical Therapy', owner: 'Harding Place PT', source: 'Commercial Build-Out', trade: 'General contractor', requiredTrades: ['General contractor'], estValue: 240_000, bondRequired: false, prevailingWage: false, setAside: 'None', distanceMiles: 8, county: 'Davidson', address: 'Harding Place, Nashville, TN 37211', scopeSummary: 'Physical therapy clinic leasing 2,800 SF shell space.', whyFits: ['Medical-adjacent build-out'], whyNot: [], addenda: [], documents: [] },
    { id: uid('p'), kind: 'lead', title: 'Brentwood Hills HOA Pool House Repairs', owner: 'Brentwood Hills HOA', source: 'HOA', trade: 'Carpentry', requiredTrades: ['Carpentry'], estValue: 45_000, bondRequired: false, prevailingWage: false, setAside: 'None', distanceMiles: 13, county: 'Williamson', scopeSummary: 'Board minutes reference pool house siding, deck and restroom repairs.', whyFits: ['Carpentry', 'Williamson'], whyNot: ['Small'], addenda: [], documents: [] },
    { id: uid('p'), kind: 'lead', title: 'Roof Replacement Permit, 2808 Acklen Ave', owner: 'Owner-filed', source: 'Metro Codes Permit', trade: 'Roofing', requiredTrades: ['Roofing'], estValue: 28_000, bondRequired: false, prevailingWage: false, setAside: 'None', distanceMiles: 4, county: 'Davidson', address: '2808 Acklen Ave, Nashville, TN 37212', permit: { number: `CARR-${t.getFullYear()}-0${Math.floor(900 + Math.random() * 200)}`, type: 'Roof Replacement', valuation: 28_000, filedDate: ymd(t), applicant: 'Owner-filed' }, scopeSummary: 'Roof replacement permit, owner-filed.', whyFits: ['Roofing', 'Close'], whyNot: ['Small'], addenda: [], documents: [] },
  ]
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, n)
  return shuffled.map((o) => ({ ...o, foundAt, sweepId, lastTouchedAt: foundAt, status: 'new', notes: '' }))
}

export default function Sweeps() {
  const { state, set, upsert, dispatch } = useDemo()
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<{ source: string; status: 'pending' | 'checking' | 'done'; result?: SweepSourceResult }[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(state.sweeps[state.sweeps.length - 1]?.id ?? null)

  const sweeps = useMemo(() => [...state.sweeps].sort((a, b) => b.startedAt.localeCompare(a.startedAt)), [state.sweeps])
  const pkg = packages.find((p) => p.id === state.settings.packageId)!
  const next = nextSweep(state)
  const enabledSources = allSources.filter((s) => state.settings.sweepSources[s] !== false)

  async function run() {
    setRunning(true)
    const started = new Date()
    const sweepId = uid('sw')
    const steps = enabledSources.map((s) => ({ source: s, status: 'pending' as const }))
    setProgress(steps)
    const results: SweepSourceResult[] = []
    const count = 2 + Math.floor(Math.random() * 3) // 2-4 new records
    const finds = freshFinds(count, '', sweepId)
    const bySource = new Map<string, number>()
    for (const f of finds) bySource.set(f.source, (bySource.get(f.source) ?? 0) + 1)

    for (let i = 0; i < steps.length; i++) {
      setProgress((p) => p.map((x, k) => (k === i ? { ...x, status: 'checking' } : x)))
      await new Promise((r) => setTimeout(r, 180 + Math.random() * 220))
      const src = steps[i].source
      const n = bySource.get(src) ?? 0
      const unreadable = n === 0 && Math.random() < 0.08
      const res: SweepSourceResult = n > 0 ? { source: src, result: 'new', count: n, message: `${n} new` } : unreadable ? { source: src, result: 'unreadable', count: 0, message: 'Not readable this run' } : { source: src, result: 'nothing', count: 0, message: 'Nothing open' }
      results.push(res)
      setProgress((p) => p.map((x, k) => (k === i ? { ...x, status: 'done', result: res } : x)))
    }
    const finished = new Date()
    const stampedFinds = finds.filter((f) => enabledSources.includes(f.source)).map((f) => ({ ...f, foundAt: finished.toISOString(), lastTouchedAt: finished.toISOString() }))
    for (const f of stampedFinds) upsert('opportunities', f, `Sweep found ${f.title}`)
    const sweep: Sweep = { id: sweepId, number: (state.sweeps[state.sweeps.length - 1]?.number ?? 44) + 1, startedAt: started.toISOString(), finishedAt: finished.toISOString(), sources: results, foundIds: stampedFinds.map((f) => f.id), cadence: state.settings.packageId === 'contracts' ? 'daily' : state.settings.packageId === 'growth' ? 'mwf' : 'weekly', manual: true }
    dispatch({ type: 'upsert', collection: 'sweeps', item: sweep }, 'Record sweep')
    setExpanded(sweepId)
    await new Promise((r) => setTimeout(r, 500))
    setRunning(false)
  }

  const open = openId ? state.opportunities.find((o) => o.id === openId) ?? null : null

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Sweeps" helpKey="sweeps" subtitle="Every run is date and time stamped so you always know what was found and when." actions={<Button onClick={run} disabled={running} icon={<Play size={16} />}>{running ? 'Running...' : 'Run sweep now (demo)'}</Button>} />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-4">
          <p className="stamp">Your package</p>
          <p className="font-display uppercase text-2xl mt-1">{pkg.name}</p>
          <p className="text-sm text-steel">{cadenceLabel[state.settings.packageId]} · {pkg.sweepsPerWeek} per week</p>
          <select aria-label="Package cadence (demo)" value={state.settings.packageId} onChange={(e) => set('settings', { ...state.settings, packageId: e.target.value as typeof state.settings.packageId })} className="mt-2 w-full rounded-lg border border-line px-2 py-1.5 text-sm min-h-[40px]">
            {packages.map((p) => <option key={p.id} value={p.id}>{p.name}: {p.cadenceShort}</option>)}
          </select>
        </Card>
        <Card className="p-4">
          <p className="stamp">Next scheduled run</p>
          <p className="font-display uppercase text-2xl mt-1">{fmtDate(next, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          <p className="text-sm text-steel">{fmtTime(next)} ET · {enabledSources.length} of {allSources.length} sources on</p>
        </Card>
        <Card className="p-4">
          <p className="stamp">Last run</p>
          {sweeps[0] ? (<><p className="font-display uppercase text-2xl mt-1">Sweep #{sweeps[0].number}</p><p className="text-sm text-steel">{stamp(sweeps[0].finishedAt)} · {sweeps[0].foundIds.length} found</p></>) : <p className="text-sm text-steel mt-1">No runs yet.</p>}
        </Card>
      </div>

      <Modal open={running} onClose={() => undefined} title="Sweep in progress" size="sm">
        <ul className="space-y-1.5">
          {progress.map((p) => (
            <li key={p.source} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                {p.status === 'done' ? (p.result?.result === 'new' ? <Check size={14} className="text-success" /> : p.result?.result === 'unreadable' ? <AlertCircle size={14} className="text-warning" /> : <Minus size={14} className="text-steel" />) : p.status === 'checking' ? <Radar size={14} className="text-survey animate-pulseDot" /> : <span className="h-3.5 w-3.5 rounded-full border border-line" />}
                {p.source}
              </span>
              <span className={`font-mono text-xs ${p.result?.result === 'new' ? 'text-success' : 'text-steel'}`}>{p.status === 'checking' ? 'checking' : p.result?.message ?? ''}</span>
            </li>
          ))}
        </ul>
      </Modal>

      <div className="space-y-3">
        {sweeps.map((s) => {
          const found = s.foundIds.map((id) => state.opportunities.find((o) => o.id === id)).filter((o): o is Opportunity => !!o)
          const isOpen = expanded === s.id
          const newCount = s.sources.reduce((a, r) => a + r.count, 0)
          return (
            <Card key={s.id}>
              <button type="button" onClick={() => setExpanded(isOpen ? null : s.id)} aria-expanded={isOpen} className="w-full text-left px-4 py-3 flex flex-wrap items-center gap-3 min-h-[56px]">
                <span className="font-display uppercase text-xl">Sweep #{s.number}</span>
                <StampLabel>{stamp(s.startedAt)} to {fmtTime24(s.finishedAt)} ET</StampLabel>
                {s.manual && <Badge tone="survey" mono>Manual</Badge>}
                <span className="ml-auto flex items-center gap-2 text-sm">
                  <Badge tone={newCount ? 'success' : 'neutral'} mono>{newCount} new</Badge>
                  <Badge tone="neutral" mono>{s.sources.filter((r) => r.result === 'nothing').length} nothing open</Badge>
                  {s.sources.some((r) => r.result === 'unreadable') && <Badge tone="warning" mono>{s.sources.filter((r) => r.result === 'unreadable').length} unreadable</Badge>}
                </span>
              </button>
              {isOpen && (
                <CardBody className="border-t border-line pt-4 grid gap-5 lg:grid-cols-2">
                  <div>
                    <h3 className="stamp mb-2">Sources checked</h3>
                    <ul className="divide-y divide-line text-sm">
                      {s.sources.map((r) => (
                        <li key={r.source} className="py-1.5 flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2">
                            {r.result === 'new' ? <Check size={14} className="text-success" /> : r.result === 'unreadable' ? <AlertCircle size={14} className="text-warning" /> : <Minus size={14} className="text-steel" />}
                            {r.source}
                          </span>
                          <span className={`font-mono text-xs ${r.result === 'new' ? 'text-success' : r.result === 'unreadable' ? 'text-warning' : 'text-steel'}`}>{r.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="stamp mb-2">Records found ({found.length})</h3>
                    {found.length === 0 ? <p className="text-sm text-steel">Nothing new this run.</p> : (
                      <ul className="space-y-2">
                        {found.map((o) => (
                          <li key={o.id}>
                            <button type="button" onClick={() => setOpenId(o.id)} className="w-full text-left rounded-lg border border-line p-3 hover:border-blueprint min-h-[44px]">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <NewBadge foundAt={o.foundAt} />
                                <span className="text-sm font-medium break-words">{o.title}</span>
                              </div>
                              <p className="text-xs text-steel mt-1">
                                {o.kind === 'bid' ? 'Bid' : 'Lead'} · {o.source} · found {fmtTime(o.foundAt)} ET
                                {o.sourceUrl && <> · <a href={o.sourceUrl} target="_blank" rel="noreferrer" className="text-blueprint underline" onClick={(e) => e.stopPropagation()}>source</a></>}
                              </p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardBody>
              )}
            </Card>
          )
        })}
      </div>
      <OpportunityDrawer opp={open} onClose={() => setOpenId(null)} />
    </div>
  )
}
