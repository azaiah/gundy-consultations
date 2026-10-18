import { useState } from 'react'
import { Plus, Printer, Receipt, Check, Send } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Input, Select } from '@/components/Field'
import { Modal } from '@/components/Modal'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import type { Invoice, InvoiceKind, Project } from '../../types'
import { money, computeEstimateTotals, round2 } from '../../lib/money'
import { uid } from '../../lib/ids'
import { ymd, addDays, fmtDate, daysUntil } from '../../lib/dates'

export const invoiceTone = (s: Invoice['status']) => (s === 'paid' ? 'success' : s === 'overdue' ? 'danger' : s === 'sent' ? 'blueprint' : 'neutral')

export function invoiceNetDue(i: Invoice): number {
  if (i.kind === 'pay_app' && i.sov) {
    const completed = i.sov.reduce((s, l) => s + l.previous + l.thisPeriod + l.storedMaterials, 0)
    const retainage = completed * (i.retainagePct / 100)
    const previousPaid = i.sov.reduce((s, l) => s + l.previous, 0) * (1 - i.retainagePct / 100)
    return round2(completed - retainage - previousPaid)
  }
  return round2(i.amount * (1 - i.retainagePct / 100))
}

export function ProjectInvoices({ project }: { project: Project }) {
  const { state, upsert, patch } = useDemo()
  const invoices = state.invoices.filter((i) => i.projectId === project.id).sort((a, b) => a.date.localeCompare(b.date))
  const proposal = state.proposals.find((p) => p.projectId === project.id)
  const estimate = state.estimates.find((e) => e.projectId === project.id)
  const total = estimate ? computeEstimateTotals(estimate.lines, estimate.taxRatePct, estimate.contingencyPct, estimate.taxApplies).grandTotal : project.contractValue
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<{ kind: InvoiceKind; description: string; amount: number; retainagePct: number; drawId: string }>({ kind: 'progress', description: '', amount: 0, retainagePct: 0, drawId: '' })

  function create() {
    const isPayApp = draft.kind === 'pay_app'
    const inv: Invoice = {
      id: uid('in'), projectId: project.id, number: isPayApp ? `PA-${String(state.invoices.filter((i) => i.kind === 'pay_app').length + 8).padStart(2, '0')}` : `INV-${1062 + state.invoices.length}`, kind: draft.kind, date: ymd(new Date()), dueDate: ymd(addDays(new Date(), isPayApp ? 30 : 5)),
      amount: isPayApp ? 0 : Number(draft.amount) || 0, retainagePct: Number(draft.retainagePct) || 0, status: 'draft',
      lineItems: isPayApp ? [] : [{ id: uid('li'), description: draft.description || `${draft.kind} invoice`, amount: Number(draft.amount) || 0 }],
      sov: isPayApp ? (estimate ? Object.entries(Object.fromEntries(Array.from(new Set(estimate.lines.map((l) => l.section))).map((s) => [s, computeEstimateTotals(estimate.lines.filter((l) => l.section === s), 0, 0, 'none').subtotal]))).map(([description, scheduled]) => ({ id: uid('sv'), description, scheduled, previous: 0, thisPeriod: 0, storedMaterials: 0 })) : [{ id: uid('sv'), description: 'Contract', scheduled: project.contractValue, previous: 0, thisPeriod: 0, storedMaterials: 0 }]) : undefined,
      periodTo: isPayApp ? ymd(new Date()) : undefined,
    }
    upsert('invoices', inv, `Create ${inv.number}`)
    setAdding(false)
  }
  function pickDraw(id: string) {
    const d = proposal?.draws.find((x) => x.id === id)
    if (d) setDraft({ ...draft, drawId: id, description: d.label, amount: round2((total * d.pct) / 100) })
    else setDraft({ ...draft, drawId: '' })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Invoices" subtitle={`${invoices.length} invoice${invoices.length === 1 ? '' : 's'} · ${money(invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + invoiceNetDue(i), 0))} collected`} action={<Button size="sm" onClick={() => setAdding(true)} icon={<Plus size={14} />}>New invoice</Button>} />
        <CardBody>
          {invoices.length === 0 ? <EmptyState compact icon={Receipt} title="No invoices" text="Create the deposit invoice from the proposal's payment schedule." action={<Button size="sm" onClick={() => setAdding(true)}>New invoice</Button>} /> : (
            <ul className="divide-y divide-line">
              {invoices.map((i) => {
                const late = i.status === 'sent' && (daysUntil(i.dueDate) ?? 0) < 0
                return (
                  <li key={i.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><span className="font-semibold font-mono">{i.number}</span><Badge tone="neutral">{i.kind === 'pay_app' ? 'AIA-style pay app' : i.kind}</Badge><Badge tone={late ? 'danger' : invoiceTone(i.status)}>{late ? 'overdue' : i.status}</Badge></div>
                      <p className="text-xs text-steel mt-0.5">Issued {fmtDate(i.date)} · due {fmtDate(i.dueDate)}{i.retainagePct ? ` · ${i.retainagePct}% retainage` : ''}{i.paidAt ? ` · paid ${fmtDate(i.paidAt)}` : ''}</p>
                    </div>
                    <span className="font-mono">{money(invoiceNetDue(i))}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => window.open(`/demo/print/invoice/${i.id}?auto=1`, '_blank')} icon={<Printer size={14} />}>Print</Button>
                      {i.status === 'draft' && <Button size="sm" variant="secondary" onClick={() => patch('invoices', i.id, { status: 'sent' }, `Send ${i.number}`)} icon={<Send size={14} />}>Send</Button>}
                      {(i.status === 'sent' || i.status === 'overdue') && <Button size="sm" onClick={() => patch('invoices', i.id, { status: 'paid', paidAt: new Date().toISOString() }, `Mark ${i.number} paid`)} icon={<Check size={14} />}>Mark paid</Button>}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardBody>
      </Card>
      <Modal open={adding} onClose={() => setAdding(false)} title="New invoice" footer={<><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button onClick={create}>Create</Button></>}>
        <div className="space-y-3">
          <Select label="Kind" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as InvoiceKind })}>
            <option value="deposit">Deposit</option><option value="progress">Progress / draw</option><option value="final">Final</option><option value="pay_app">AIA-style pay application (commercial)</option>
          </Select>
          {draft.kind !== 'pay_app' ? (
            <>
              {proposal && proposal.draws.length > 0 && (
                <Select label="From proposal draw" value={draft.drawId} onChange={(e) => pickDraw(e.target.value)}>
                  <option value="">Custom</option>
                  {proposal.draws.map((d) => <option key={d.id} value={d.id}>{d.label} ({d.pct}% = {money((total * d.pct) / 100)})</option>)}
                </Select>
              )}
              <Input label="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Amount ($)" type="number" min={0} step="0.01" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} />
                <Input label="Retainage %" type="number" min={0} max={20} value={draft.retainagePct} onChange={(e) => setDraft({ ...draft, retainagePct: Number(e.target.value) })} />
              </div>
            </>
          ) : (
            <>
              <Input label="Retainage %" type="number" min={0} max={20} value={draft.retainagePct || 10} onChange={(e) => setDraft({ ...draft, retainagePct: Number(e.target.value) })} />
              <p className="text-xs text-steel">The schedule of values is built from the estimate sections. Enter work completed this period on the invoice after creating it.</p>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
