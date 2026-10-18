import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Printer, Check, Send, Receipt } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button, LinkButton } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Input } from '@/components/Field'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import { projectById } from '../../selectors'
import type { Invoice, SovLine } from '../../types'
import { money, money0, round2 } from '../../lib/money'
import { fmtDate, daysUntil } from '../../lib/dates'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { FilterSelect } from '../shared/Filters'
import { invoiceNetDue, invoiceTone } from './ProjectInvoices'

export default function Invoices() {
  const { state, patch } = useDemo()
  const [filter, setFilter] = useState<'all' | Invoice['status']>('all')
  const [open, setOpen] = useState<string | null>(null)
  const list = useMemo(() => state.invoices.map((i) => ({ ...i, status: i.status === 'sent' && (daysUntil(i.dueDate) ?? 0) < 0 ? ('overdue' as const) : i.status })).filter((i) => filter === 'all' || i.status === filter).sort((a, b) => b.date.localeCompare(a.date)), [state.invoices, filter])
  const outstanding = state.invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + invoiceNetDue(i), 0)
  const overdue = state.invoices.filter((i) => i.status === 'overdue' || (i.status === 'sent' && (daysUntil(i.dueDate) ?? 0) < 0)).reduce((s, i) => s + invoiceNetDue(i), 0)
  const paid30 = state.invoices.filter((i) => i.status === 'paid' && i.paidAt && Date.now() - new Date(i.paidAt).getTime() < 30 * 86_400_000).reduce((s, i) => s + invoiceNetDue(i), 0)
  const payApp = open ? state.invoices.find((i) => i.id === open && i.kind === 'pay_app') : null

  function patchSov(inv: Invoice, id: string, p: Partial<SovLine>) {
    patch('invoices', inv.id, { sov: inv.sov?.map((l) => (l.id === id ? { ...l, ...p } : l)) }, 'Update pay application')
  }

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Invoices" helpKey="invoices" subtitle="Deposits, draws, finals and AIA-style pay applications. Create invoices from a project." />
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card className="p-3"><p className="stamp">Outstanding</p><p className="font-display text-2xl sm:text-3xl">{money0(outstanding)}</p></Card>
        <Card className="p-3"><p className="stamp">Overdue</p><p className={`font-display text-2xl sm:text-3xl ${overdue ? 'text-danger' : ''}`}>{money0(overdue)}</p></Card>
        <Card className="p-3"><p className="stamp">Collected, 30 days</p><p className="font-display text-2xl sm:text-3xl text-success">{money0(paid30)}</p></Card>
      </div>
      <div className="mb-4"><FilterSelect label="Status" value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'overdue', label: 'Overdue' }, { value: 'paid', label: 'Paid' }]} /></div>
      {list.length === 0 ? <EmptyState icon={Receipt} title="No invoices" text="Open a project and create one from the proposal's draw schedule." action={<LinkButton to="/demo/projects">Open projects</LinkButton>} /> : (
        <div className="overflow-x-auto rounded-xl border border-line bg-paper">
          <table className="w-full text-sm">
            <caption className="sr-only">Invoices</caption>
            <thead className="bg-concrete/70 text-left text-xs uppercase text-steel"><tr><th className="px-3 py-2">Invoice</th><th className="px-3 py-2 hidden md:table-cell">Project</th><th className="px-3 py-2 hidden sm:table-cell">Due</th><th className="px-3 py-2 text-right">Amount due</th><th className="px-3 py-2">Status</th><th className="px-3 py-2"></th></tr></thead>
            <tbody>
              {list.map((i) => (
                <tr key={i.id} className="border-t border-line">
                  <td className="px-3 py-2.5"><span className="font-mono font-medium">{i.number}</span><br /><span className="text-xs text-steel">{i.kind === 'pay_app' ? 'AIA-style pay app' : i.kind}</span></td>
                  <td className="px-3 py-2.5 hidden md:table-cell"><Link to={`/demo/projects/${i.projectId}?tab=invoices`} className="text-blueprint underline">{projectById(state, i.projectId)?.name ?? 'Project'}</Link></td>
                  <td className="px-3 py-2.5 hidden sm:table-cell text-xs">{fmtDate(i.dueDate)}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{money(invoiceNetDue(i))}</td>
                  <td className="px-3 py-2.5"><Badge tone={invoiceTone(i.status)}>{i.status}</Badge></td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1 justify-end flex-wrap">
                      {i.kind === 'pay_app' && <Button size="sm" variant="ghost" onClick={() => setOpen(open === i.id ? null : i.id)}>{open === i.id ? 'Close' : 'Schedule of values'}</Button>}
                      <Button size="sm" variant="outline" onClick={() => window.open(`/demo/print/invoice/${i.id}?auto=1`, '_blank')} icon={<Printer size={14} />} aria-label={`Print ${i.number}`}>Print</Button>
                      {i.status === 'draft' && <Button size="sm" variant="secondary" onClick={() => patch('invoices', i.id, { status: 'sent' }, `Send ${i.number}`)} icon={<Send size={14} />}>Send</Button>}
                      {(i.status === 'sent' || i.status === 'overdue') && <Button size="sm" onClick={() => patch('invoices', i.id, { status: 'paid', paidAt: new Date().toISOString() }, `Mark ${i.number} paid`)} icon={<Check size={14} />}>Paid</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {payApp && payApp.sov && (
        <Card className="mt-4">
          <CardHeader title={`${payApp.number} schedule of values`} subtitle="AIA-style continuation sheet. Edit this period's work and stored materials; totals and retainage recalculate." />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-steel"><tr><th className="py-1 pr-2">Item</th><th className="py-1 px-2 text-right">Scheduled</th><th className="py-1 px-2 text-right">Previous</th><th className="py-1 px-2 text-right">This period</th><th className="py-1 px-2 text-right">Stored</th><th className="py-1 px-2 text-right">Completed to date</th><th className="py-1 pl-2 text-right">%</th></tr></thead>
                <tbody>
                  {payApp.sov.map((l) => {
                    const done = l.previous + l.thisPeriod + l.storedMaterials
                    return (
                      <tr key={l.id} className="border-t border-line">
                        <td className="py-1.5 pr-2 min-w-[160px]">{l.description}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{money(l.scheduled)}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{money(l.previous)}</td>
                        <td className="py-1.5 px-2 text-right"><Input aria-label={`This period for ${l.description}`} type="number" min={0} step="0.01" value={l.thisPeriod} onChange={(e) => patchSov(payApp, l.id, { thisPeriod: Number(e.target.value) || 0 })} className="w-28 inline-block [&_input]:text-right [&_input]:min-h-[36px] [&_input]:py-1" /></td>
                        <td className="py-1.5 px-2 text-right"><Input aria-label={`Stored materials for ${l.description}`} type="number" min={0} step="0.01" value={l.storedMaterials} onChange={(e) => patchSov(payApp, l.id, { storedMaterials: Number(e.target.value) || 0 })} className="w-24 inline-block [&_input]:text-right [&_input]:min-h-[36px] [&_input]:py-1" /></td>
                        <td className="py-1.5 px-2 text-right font-mono">{money(done)}</td>
                        <td className="py-1.5 pl-2 text-right font-mono">{l.scheduled ? Math.round((done / l.scheduled) * 100) : 0}%</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="border-t-2 border-ink font-medium">
                  {(() => {
                    const sched = payApp.sov.reduce((s, l) => s + l.scheduled, 0)
                    const completed = payApp.sov.reduce((s, l) => s + l.previous + l.thisPeriod + l.storedMaterials, 0)
                    const retain = round2(completed * (payApp.retainagePct / 100))
                    return (
                      <>
                        <tr><td className="py-1.5 pr-2">Totals</td><td className="py-1.5 px-2 text-right font-mono">{money(sched)}</td><td className="py-1.5 px-2 text-right font-mono">{money(payApp.sov.reduce((s, l) => s + l.previous, 0))}</td><td className="py-1.5 px-2 text-right font-mono">{money(payApp.sov.reduce((s, l) => s + l.thisPeriod, 0))}</td><td className="py-1.5 px-2 text-right font-mono">{money(payApp.sov.reduce((s, l) => s + l.storedMaterials, 0))}</td><td className="py-1.5 px-2 text-right font-mono">{money(completed)}</td><td className="py-1.5 pl-2 text-right font-mono">{sched ? Math.round((completed / sched) * 100) : 0}%</td></tr>
                        <tr className="text-steel font-normal"><td colSpan={5} className="py-1 pr-2">Retainage ({payApp.retainagePct}%)</td><td className="py-1 px-2 text-right font-mono">{money(retain)}</td><td></td></tr>
                        <tr className="text-ink"><td colSpan={5} className="py-1 pr-2">Current payment due</td><td className="py-1 px-2 text-right font-mono text-survey font-semibold">{money(invoiceNetDue(payApp))}</td><td></td></tr>
                      </>
                    )
                  })()}
                </tfoot>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
