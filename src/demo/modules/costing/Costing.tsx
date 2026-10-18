import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { BarChart } from '@/components/charts/BarChart'
import { useDemo } from '../../store'
import { projectCost, projectContractWithCOs } from '../../selectors'
import { money, pct, computeEstimateTotals } from '../../lib/money'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { invoiceNetDue } from '../invoices/ProjectInvoices'

export default function Costing() {
  const { state } = useDemo()
  const months = useMemo(() => {
    const out: { label: string; key: string }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      out.push({ label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` })
    }
    return out
  }, [])
  const revenue = months.map((m) => state.invoices.filter((i) => i.status === 'paid' && i.paidAt?.slice(0, 7) === m.key).reduce((s, i) => s + invoiceNetDue(i), 0))
  const cost = months.map((m) => state.costs.filter((c) => c.date.slice(0, 7) === m.key).reduce((s, c) => s + c.amount, 0))
  const sampleRev = [148_200, 162_900, 121_400, 189_700, 171_300, 0]
  const sampleCost = [112_600, 128_300, 96_800, 144_100, 133_900, 0]
  const rev = revenue.map((v, i) => (v > 0 ? v : i < 5 ? sampleRev[i] : 0))
  const cst = cost.map((v, i) => (v > 0 ? v : i < 5 ? sampleCost[i] : 0))
  const profit = rev.map((r, i) => r - cst[i])
  const jobs = state.projects.filter((p) => p.contractValue > 0)
  const categories = Array.from(new Set(state.costs.map((c) => c.category)))

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Job costing" helpKey="costing" subtitle="Estimate vs. actual by job and category, margin per job, and the company P&L by month." />
      <Card>
        <CardHeader title="Company P&L, last 6 months" subtitle="Revenue is paid invoices; cost is logged job costs. Earlier months are sample history." />
        <CardBody>
          <BarChart title="Monthly revenue, cost and profit" categories={months.map((m) => m.label)} series={[{ name: 'Revenue', color: '#1F4E79', values: rev }, { name: 'Cost', color: '#E8590C', values: cst }, { name: 'Profit', color: '#1E7A4C', values: profit.map((p) => Math.max(0, p)) }]} format={money} />
        </CardBody>
      </Card>
      <Card className="mt-4">
        <CardHeader title="Margin per job" subtitle="Contract plus approved change orders, against actual logged cost." />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-steel"><tr><th className="py-1 pr-2">Job</th><th className="py-1 px-2 text-right">Contract</th><th className="py-1 px-2 text-right hidden sm:table-cell">Est. cost</th><th className="py-1 px-2 text-right">Actual</th><th className="py-1 px-2 text-right">Margin</th><th className="py-1 pl-2">Status</th></tr></thead>
              <tbody>
                {jobs.map((p) => {
                  const contract = projectContractWithCOs(state, p)
                  const actual = projectCost(state, p.id)
                  const est = state.estimates.find((e) => e.projectId === p.id)
                  const estCost = est ? (() => { const t = computeEstimateTotals(est.lines, est.taxRatePct, est.contingencyPct, est.taxApplies); return t.subtotal - t.markupTotal })() : null
                  const m = contract ? ((contract - actual) / contract) * 100 : 0
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <td className="py-2 pr-2"><Link to={`/demo/projects/${p.id}?tab=costs`} className="text-blueprint underline">{p.name}</Link></td>
                      <td className="py-2 px-2 text-right font-mono">{money(contract)}</td>
                      <td className="py-2 px-2 text-right font-mono hidden sm:table-cell">{estCost !== null ? money(estCost) : <span className="text-steel">none</span>}</td>
                      <td className="py-2 px-2 text-right font-mono">{money(actual)}</td>
                      <td className={`py-2 px-2 text-right font-mono ${m < 15 ? 'text-danger' : m < 25 ? 'text-warning' : 'text-success'}`}>{pct(m, 1)}</td>
                      <td className="py-2 pl-2"><Badge tone="neutral">{p.status.replace('_', ' ')}{p.status === 'in_progress' ? ` · ${p.percentComplete}%` : ''}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-steel mt-2">Margin on in-progress jobs reflects cost to date, not final margin.</p>
        </CardBody>
      </Card>
      <Card className="mt-4">
        <CardHeader title="Cost by category, all jobs" subtitle="Categories you add on a project appear here automatically." />
        <CardBody>
          <ul className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => <li key={c} className="rounded-lg border border-line p-3"><p className="text-xs text-steel">{c}</p><p className="font-mono">{money(state.costs.filter((x) => x.category === c).reduce((s, x) => s + x.amount, 0))}</p></li>)}
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
