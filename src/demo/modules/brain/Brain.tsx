import { useMemo, useState } from 'react'
import { Plus, Trash2, Brain as BrainIcon } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Input, Select, Toggle } from '@/components/Field'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { useDemo } from '../../store'
import { scoreFor } from '../../selectors'
import type { CompanyBrain, SetAside, License } from '../../types'
import { money0 } from '../../lib/money'
import { uid } from '../../lib/ids'
import { ymd, addDays, daysUntil } from '../../lib/dates'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { ScoreBadge } from '../shared/ScoreBadge'

const allTrades = ['General contractor', 'Carpentry', 'Interior finishes', 'Roofing', 'Electrical', 'Plumbing', 'HVAC', 'Concrete and masonry', 'Glazing', 'Painting', 'Flooring', 'Site work']
const allSetAsides: SetAside[] = ['SBA 8(a)', 'HUBZone', 'WOSB', 'SDVOSB', 'State small business', 'State minority business', 'DBE']
const allCounties = ['Davidson', 'Williamson', 'Rutherford', 'Wilson', 'Sumner', 'Cheatham', 'Robertson', 'Maury', 'Montgomery']

export default function Brain() {
  const { state, set } = useDemo()
  const b = state.brain
  const update = (patch: Partial<CompanyBrain>) => set('brain', { ...b, ...patch }, 'Update Company Brain')
  const [newTrade, setNewTrade] = useState('')
  const [newCounty, setNewCounty] = useState('')

  // Live scoring preview: top opportunities and how many are Go / No-go right now
  const scored = useMemo(() => state.opportunities.filter((o) => o.status !== 'no_bid').map((o) => ({ o, s: scoreFor(state, o) })), [state])
  const go = scored.filter((x) => !x.s.disqualified && x.s.score >= 70).length
  const nogo = scored.filter((x) => x.s.disqualified).length

  function toggleList<T extends string>(list: T[], v: T): T[] {
    return list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
  }
  function addLicense() {
    const l: License = { id: uid('lic'), number: '', classification: '', state: b.state, expires: ymd(addDays(new Date(), 365)), trade: b.trades[0] ?? 'General contractor' }
    update({ licenses: [...b.licenses, l] })
  }
  function patchLicense(id: string, patch: Partial<License>) {
    update({ licenses: b.licenses.map((l) => (l.id === id ? { ...l, ...patch } : l)) })
  }

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Company Brain" helpKey="brain" subtitle="Everything the engine knows about you. Changes re-score every bid and lead instantly." />

      <div className="sticky top-14 z-30 -mx-3 sm:-mx-5 px-3 sm:px-5 py-2 bg-concrete/95 backdrop-blur border-b border-line mb-5 flex flex-wrap items-center gap-3 text-sm">
        <BrainIcon size={16} className="text-survey" />
        <span className="font-medium">Live scoring:</span>
        <Badge tone="success" mono>{go} Go</Badge>
        <Badge tone="danger" mono>{nogo} No-go</Badge>
        <Badge tone="neutral" mono>{scored.length - go - nogo} Review or long shot</Badge>
        <span className="text-steel">Bonding {money0(b.bondingSingle)} / {money0(b.bondingAggregate)}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Company" />
            <CardBody className="grid sm:grid-cols-2 gap-3">
              <Input label="Company name" value={b.name} onChange={(e) => update({ name: e.target.value })} />
              <Input label="City" value={b.city} onChange={(e) => update({ city: e.target.value })} />
              <Input label="State" value={b.state} onChange={(e) => update({ state: e.target.value })} />
              <Input label="ZIP" value={b.zip} onChange={(e) => update({ zip: e.target.value })} />
              <Input label="Crew size" type="number" min={1} value={b.crewSize} onChange={(e) => update({ crewSize: Number(e.target.value) || 1 })} />
              <Input label="Service radius (miles)" type="number" min={1} value={b.serviceRadiusMiles} onChange={(e) => update({ serviceRadiusMiles: Number(e.target.value) || 1 })} />
              <Input label="Typical job minimum ($)" type="number" min={0} value={b.typicalJobMin} onChange={(e) => update({ typicalJobMin: Number(e.target.value) || 0 })} />
              <Input label="Typical job maximum ($)" type="number" min={0} value={b.typicalJobMax} onChange={(e) => update({ typicalJobMax: Number(e.target.value) || 0 })} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Trades" subtitle="Toggle a trade to change which bids qualify." />
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {allTrades.map((t) => {
                  const on = b.trades.includes(t)
                  return (
                    <button key={t} type="button" aria-pressed={on} onClick={() => update({ trades: toggleList(b.trades, t) })} className={`tap rounded-lg border px-3 text-sm font-medium ${on ? 'border-survey bg-survey-50 text-survey' : 'border-line text-steel hover:border-steel'}`}>
                      {t}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <Input aria-label="Add a trade" placeholder="Add another trade" value={newTrade} onChange={(e) => setNewTrade(e.target.value)} className="flex-1" />
                <Button variant="outline" onClick={() => { if (newTrade.trim()) { update({ trades: [...b.trades, newTrade.trim()] }); setNewTrade('') } }} icon={<Plus size={16} />}>Add</Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Licenses" subtitle="An expired license disqualifies bids that require it." action={<Button size="sm" variant="outline" onClick={addLicense} icon={<Plus size={14} />}>Add</Button>} />
            <CardBody className="space-y-3">
              {b.licenses.map((l) => {
                const days = daysUntil(l.expires) ?? 0
                return (
                  <div key={l.id} className="rounded-lg border border-line p-3 grid sm:grid-cols-2 gap-2">
                    <Input label="Number" value={l.number} onChange={(e) => patchLicense(l.id, { number: e.target.value })} />
                    <Input label="Classification" value={l.classification} onChange={(e) => patchLicense(l.id, { classification: e.target.value })} />
                    <Select label="Trade" value={l.trade} onChange={(e) => patchLicense(l.id, { trade: e.target.value })}>
                      {Array.from(new Set([...allTrades, ...b.trades])).map((t) => <option key={t}>{t}</option>)}
                    </Select>
                    <Input label="State" value={l.state} onChange={(e) => patchLicense(l.id, { state: e.target.value })} />
                    <Input label="Expires" type="date" value={l.expires} onChange={(e) => patchLicense(l.id, { expires: e.target.value })} />
                    <div className="flex items-end justify-between gap-2">
                      <Badge tone={days < 0 ? 'danger' : days < 60 ? 'warning' : 'success'} mono>{days < 0 ? 'Expired' : `${days}d left`}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => update({ licenses: b.licenses.filter((x) => x.id !== l.id) })} icon={<Trash2 size={14} />} aria-label="Remove license">Remove</Button>
                    </div>
                  </div>
                )
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Bonding and insurance" subtitle="Bids above the single limit become no-go. Aggregate room is reduced by jobs in progress." />
            <CardBody className="grid sm:grid-cols-2 gap-3">
              <Input label="Bonding single limit ($)" type="number" min={0} step={50000} value={b.bondingSingle} onChange={(e) => update({ bondingSingle: Number(e.target.value) || 0 })} />
              <Input label="Bonding aggregate ($)" type="number" min={0} step={100000} value={b.bondingAggregate} onChange={(e) => update({ bondingAggregate: Number(e.target.value) || 0 })} />
              <Input label="GL per occurrence ($)" type="number" min={0} step={100000} value={b.insuranceOccurrence} onChange={(e) => update({ insuranceOccurrence: Number(e.target.value) || 0 })} />
              <Input label="GL aggregate ($)" type="number" min={0} step={100000} value={b.insuranceAggregate} onChange={(e) => update({ insuranceAggregate: Number(e.target.value) || 0 })} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Certifications and set-asides" subtitle="Toggle a set-aside to see restricted bids re-score." />
            <CardBody>
              <div className="divide-y divide-line">
                {b.certifications.map((c) => (
                  <Toggle key={c.id} label={c.name} description={c.expires ? `Expires ${c.expires}` : undefined} checked={c.active} onChange={(v) => update({ certifications: b.certifications.map((x) => (x.id === c.id ? { ...x, active: v } : x)) })} />
                ))}
              </div>
              <p className="stamp mt-4 mb-2">Set-asides held</p>
              <div className="flex flex-wrap gap-2">
                {allSetAsides.map((s) => {
                  const on = b.setAsides.includes(s)
                  return (
                    <button key={s} type="button" aria-pressed={on} onClick={() => update({ setAsides: toggleList(b.setAsides, s) })} className={`tap rounded-lg border px-3 text-sm font-medium ${on ? 'border-blueprint bg-blueprint-50 text-blueprint' : 'border-line text-steel hover:border-steel'}`}>
                      {s}
                    </button>
                  )
                })}
              </div>
              <p className="stamp mt-4 mb-2">NAICS codes</p>
              <Input aria-label="NAICS codes" value={b.naics.join(', ')} onChange={(e) => update({ naics: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} hint="comma separated" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Service area" subtitle="Home counties score full distance points." />
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set([...allCounties, ...b.counties])).map((c) => {
                  const on = b.counties.includes(c)
                  return (
                    <button key={c} type="button" aria-pressed={on} onClick={() => update({ counties: toggleList(b.counties, c) })} className={`tap rounded-lg border px-3 text-sm font-medium ${on ? 'border-survey bg-survey-50 text-survey' : 'border-line text-steel hover:border-steel'}`}>
                      {c}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <Input aria-label="Add a county" placeholder="Add a county" value={newCounty} onChange={(e) => setNewCounty(e.target.value)} className="flex-1" />
                <Button variant="outline" onClick={() => { if (newCounty.trim()) { update({ counties: [...b.counties, newCounty.trim()] }); setNewCounty('') } }} icon={<Plus size={16} />}>Add</Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Past projects" subtitle="Used in the capability statement and prequal packet." />
            <CardBody>
              <ul className="divide-y divide-line text-sm">
                {b.pastProjects.map((p) => (
                  <li key={p.id} className="py-2 flex items-center justify-between gap-3">
                    <span className="min-w-0"><span className="font-medium">{p.name}</span><br /><span className="text-steel text-xs">{p.type} · {p.year}</span></span>
                    <span className="font-mono text-xs shrink-0">{money0(p.value)}</span>
                  </li>
                ))}
              </ul>
              <Button size="sm" variant="outline" className="mt-3" icon={<Plus size={14} />} onClick={() => update({ pastProjects: [...b.pastProjects, { id: uid('pp'), name: 'New project', value: 0, year: new Date().getFullYear(), type: 'Residential remodel' }] })}>Add past project</Button>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-28 self-start">
          <Card>
            <CardHeader title="Re-scored live" subtitle="Top open opportunities with the current profile." />
            <CardBody>
              <ul className="divide-y divide-line">
                {scored
                  .slice()
                  .sort((a, b2) => (b2.s.disqualified ? -1 : b2.s.score) - (a.s.disqualified ? -1 : a.s.score))
                  .slice(0, 10)
                  .map(({ o, s }) => (
                    <li key={o.id} className="py-2.5 flex items-center justify-between gap-3">
                      <span className="min-w-0"><span className="text-sm font-medium block truncate">{o.title}</span><span className="text-xs text-steel">{o.kind === 'bid' ? 'Bid' : 'Lead'} · {money0(o.estValue)}</span></span>
                      <ScoreBadge score={s} />
                    </li>
                  ))}
              </ul>
              <p className="text-xs text-steel mt-3">Try it: turn off "State small business" and watch the National Guard reroof drop to No-go. Lower the bonding single limit to $300,000 and see the larger bids disqualify.</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
