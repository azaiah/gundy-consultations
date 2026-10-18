import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input, Select } from '@/components/Field'
import { useDemo } from '../../store'
import type { Project } from '../../types'
import { money, computeEstimateTotals, lineTotal, pct } from '../../lib/money'
import { uid } from '../../lib/ids'
import { ymd, fmtDate } from '../../lib/dates'

export const baseCategories = ['Labor', 'Material', 'Equipment', 'Subcontract', 'Other']

export function CostsTab({ project }: { project: Project }) {
  const { state, upsert, remove } = useDemo()
  const costs = state.costs.filter((c) => c.projectId === project.id).sort((a, b) => b.date.localeCompare(a.date))
  const estimate = state.estimates.find((e) => e.projectId === project.id)
  const categories = useMemo(() => Array.from(new Set([...baseCategories, ...state.costs.map((c) => c.category)])), [state.costs])
  const [draft, setDraft] = useState({ category: 'Material', description: '', amount: 0, date: ymd(new Date()), vendor: '' })
  const [newCat, setNewCat] = useState('')

  const estByCat = useMemo(() => {
    const out: Record<string, number> = {}
    for (const l of estimate?.lines ?? []) out[l.category] = (out[l.category] ?? 0) + lineTotal(l.qty, l.unitCost, l.markupPct)
    return out
  }, [estimate])
  const actByCat = useMemo(() => {
    const out: Record<string, number> = {}
    for (const c of costs) out[c.category] = (out[c.category] ?? 0) + c.amount
    return out
  }, [costs])
  const totals = estimate ? computeEstimateTotals(estimate.lines, estimate.taxRatePct, estimate.contingencyPct, estimate.taxApplies) : null
  const actual = costs.reduce((s, c) => s + c.amount, 0)
  const revenue = project.contractValue + state.changeOrders.filter((c) => c.projectId === project.id && c.status === 'approved').reduce((s, c) => s + c.costImpact, 0)
  const margin = revenue ? ((revenue - actual) / revenue) * 100 : 0

  function add() {
    if (!draft.description.trim() || !draft.amount) return
    upsert('costs', { id: uid('c'), projectId: project.id, category: draft.category, description: draft.description.trim(), amount: Number(draft.amount), date: draft.date, vendor: draft.vendor || undefined }, 'Add cost')
    setDraft({ ...draft, description: '', amount: 0, vendor: '' })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3"><p className="stamp">Contract + COs</p><p className="font-display text-2xl">{money(revenue)}</p></Card>
        <Card className="p-3"><p className="stamp">Estimated cost</p><p className="font-display text-2xl">{totals ? money(totals.subtotal - totals.markupTotal) : 'No estimate'}</p></Card>
        <Card className="p-3"><p className="stamp">Actual to date</p><p className="font-display text-2xl">{money(actual)}</p></Card>
        <Card className="p-3"><p className="stamp">Margin to date</p><p className={`font-display text-2xl ${margin < 15 ? 'text-danger' : margin < 25 ? 'text-warning' : 'text-success'}`}>{pct(margin, 1)}</p></Card>
      </div>
      <Card>
        <CardHeader title="Estimate vs. actual by category" subtitle="Estimate figures are line totals including markup; actuals are logged costs." />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-steel"><tr><th className="py-1 pr-2">Category</th><th className="py-1 px-2 text-right">Estimate</th><th className="py-1 px-2 text-right">Actual</th><th className="py-1 pl-2 text-right">Variance</th></tr></thead>
              <tbody>
                {categories.map((cat) => {
                  const e = estByCat[cat] ?? 0
                  const a = actByCat[cat] ?? 0
                  if (!e && !a) return null
                  const v = e - a
                  return <tr key={cat} className="border-t border-line"><td className="py-1.5 pr-2">{cat}</td><td className="py-1.5 px-2 text-right font-mono">{money(e)}</td><td className="py-1.5 px-2 text-right font-mono">{money(a)}</td><td className={`py-1.5 pl-2 text-right font-mono ${v < 0 ? 'text-danger' : 'text-success'}`}>{v < 0 ? '-' : '+'}{money(Math.abs(v))}</td></tr>
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Log a cost" subtitle="Add your own categories as needed." />
        <CardBody>
          <div className="grid gap-2 sm:grid-cols-6">
            <Select aria-label="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</Select>
            <Input aria-label="Description" className="sm:col-span-2" placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            <Input aria-label="Amount" type="number" min={0} step="0.01" placeholder="Amount" value={draft.amount || ''} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} />
            <Input aria-label="Date" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            <Button onClick={add} icon={<Plus size={16} />}>Add</Button>
          </div>
          <div className="mt-2 flex gap-2 items-center">
            <Input aria-label="New category" placeholder="New cost category" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="w-56" />
            <Button size="sm" variant="outline" onClick={() => { if (newCat.trim()) { setDraft({ ...draft, category: newCat.trim() }); setNewCat('') } }}>Use category</Button>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {costs.length === 0 && <li className="py-3 text-sm text-steel">No costs logged yet.</li>}
            {costs.map((c) => (
              <li key={c.id} className="py-2 flex items-center gap-3 text-sm">
                <span className="font-mono text-xs text-steel w-14 shrink-0">{fmtDate(c.date, { month: 'numeric', day: 'numeric' })}</span>
                <span className="min-w-0 flex-1 break-words">{c.description}{c.vendor ? <span className="text-steel"> · {c.vendor}</span> : null}<br /><span className="text-xs text-steel">{c.category}</span></span>
                <span className="font-mono">{money(c.amount)}</span>
                <button type="button" onClick={() => remove('costs', c.id, 'Remove cost')} className="tap inline-flex items-center justify-center rounded-lg text-steel hover:text-danger" aria-label="Remove cost"><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
