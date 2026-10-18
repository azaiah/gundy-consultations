import { useState } from 'react'
import { CalendarDays, Images, ClipboardList, FileDiff, ListChecks, Receipt, PenLine, CreditCard } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { Input, Select } from '@/components/Field'
import { SignaturePad } from '@/components/SignaturePad'
import { useDemo } from '../../store'
import type { ChangeOrder, Project, Selection } from '../../types'
import { money } from '../../lib/money'
import { fmtDate, fmtDateTime, ymd } from '../../lib/dates'
import { invoiceNetDue } from '../invoices/ProjectInvoices'
import { uid } from '../../lib/ids'

/** The homeowner / tenant view of a single project. Used by the Client role and as a preview tab inside Projects. */
export function ClientView({ project, preview = false }: { project: Project; preview?: boolean }) {
  const { state, patch } = useDemo()
  const events = state.events.filter((e) => e.projectId === project.id && new Date(e.start).getTime() >= Date.now() - 86_400_000).sort((a, b) => a.start.localeCompare(b.start)).slice(0, 8)
  const logs = state.dailyLogs.filter((l) => l.projectId === project.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const superseded = new Set(logs.map((l) => l.supersedes).filter(Boolean))
  const highlights = logs.filter((l) => !superseded.has(l.id)).slice(0, 5)
  const cos = state.changeOrders.filter((c) => c.projectId === project.id)
  const invoices = state.invoices.filter((i) => i.projectId === project.id && i.status !== 'draft')
  const [signing, setSigning] = useState<ChangeOrder | null>(null)
  const [paying, setPaying] = useState<string | null>(null)
  const [newSel, setNewSel] = useState({ category: 'Tile', item: '' })

  const setSel = (selections: Selection[]) => patch('projects', project.id, { selections }, 'Update selections')

  return (
    <div className="space-y-4">
      {preview && <p className="text-xs text-steel">This is what the client sees for this project. Switch to the Client role to use it as them.</p>}
      <Card className="bg-ink text-white border-ink">
        <CardBody className="pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">Your project</p>
          <h2 className="font-display uppercase text-3xl mt-1">{project.name}</h2>
          <p className="text-white/70 text-sm">{project.address}</p>
          <div className="mt-3 h-2 rounded-full bg-white/15 overflow-hidden"><div className="h-full bg-survey-light" style={{ width: `${project.percentComplete}%` }} /></div>
          <p className="text-xs text-white/70 mt-1">{project.percentComplete}% complete · target finish {fmtDate(project.endDate)}</p>
        </CardBody>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title={<span className="inline-flex items-center gap-2"><CalendarDays size={16} /> Schedule</span>} />
          <CardBody>
            {events.length === 0 ? <p className="text-sm text-steel">No upcoming events.</p> : (
              <ul className="divide-y divide-line">{events.map((e) => <li key={e.id} className="py-2 flex gap-3 text-sm"><span className="font-mono text-xs text-steel w-16 shrink-0">{fmtDate(e.start, { month: 'short', day: 'numeric' })}</span><span className="break-words">{e.title}</span></li>)}</ul>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title={<span className="inline-flex items-center gap-2"><Images size={16} /> Progress photos</span>} />
          <CardBody>
            {project.progressPhotos.length === 0 ? <p className="text-sm text-steel">Photos appear here as the crew uploads them.</p> : (
              <ul className="grid grid-cols-3 gap-2">{project.progressPhotos.map((p) => <li key={p.id}><img src={p.dataUrl} alt={p.name} className="aspect-square w-full object-cover rounded-lg border border-line" /></li>)}</ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title={<span className="inline-flex items-center gap-2"><ClipboardList size={16} /> Daily log highlights</span>} />
        <CardBody>
          {highlights.length === 0 ? <p className="text-sm text-steel">No logs yet.</p> : (
            <ul className="divide-y divide-line">{highlights.map((l) => <li key={l.id} className="py-2 text-sm"><span className="font-mono text-xs text-steel">{fmtDate(l.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span><p className="break-words">{l.workDone}</p></li>)}</ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={<span className="inline-flex items-center gap-2"><FileDiff size={16} /> Change orders</span>} subtitle="Approve with your signature. Nothing proceeds until you do." />
        <CardBody>
          {cos.length === 0 ? <p className="text-sm text-steel">No change orders.</p> : (
            <ul className="divide-y divide-line">
              {cos.map((c) => (
                <li key={c.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="min-w-0 flex-1"><p className="text-sm break-words"><span className="font-semibold">CO #{c.number}</span> · {c.description}</p><p className="text-xs text-steel">{money(c.costImpact)} · {c.daysImpact} days{c.signature ? ` · approved ${fmtDateTime(c.signature.signedAt)}` : ''}</p></div>
                  {c.status === 'pending' ? <Button size="sm" onClick={() => setSigning(c)} icon={<PenLine size={14} />}>Review and sign</Button> : <Badge tone={c.status === 'approved' ? 'success' : 'danger'}>{c.status}</Badge>}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={<span className="inline-flex items-center gap-2"><ListChecks size={16} /> Selections</span>} subtitle="Tile, fixtures, paint and more. Make your picks so we can order on time." />
        <CardBody>
          <ul className="divide-y divide-line">
            {project.selections.map((s) => (
              <li key={s.id} className="py-2 grid gap-2 sm:grid-cols-[1fr_1.2fr_auto] items-center">
                <div><p className="text-sm font-medium">{s.item}</p><p className="text-xs text-steel">{s.category}</p></div>
                <Input aria-label={`Choice for ${s.item}`} placeholder="Your choice" value={s.choice ?? ''} onChange={(e) => setSel(project.selections.map((x) => (x.id === s.id ? { ...x, choice: e.target.value, status: e.target.value ? (x.status === 'pending' ? 'selected' : x.status) : 'pending' } : x)))} />
                <Badge tone={s.status === 'ordered' ? 'success' : s.status === 'selected' ? 'blueprint' : 'warning'}>{s.status}</Badge>
              </li>
            ))}
          </ul>
          {!preview && (
            <form onSubmit={(e) => { e.preventDefault(); if (newSel.item.trim()) { setSel([...project.selections, { id: uid('sl'), category: newSel.category, item: newSel.item.trim(), status: 'pending' }]); setNewSel({ ...newSel, item: '' }) } }} className="mt-3 flex flex-col sm:flex-row gap-2">
              <Select aria-label="Category" value={newSel.category} onChange={(e) => setNewSel({ ...newSel, category: e.target.value })}>{['Tile', 'Fixtures', 'Paint', 'Countertops', 'Flooring', 'Lighting', 'Hardware'].map((c) => <option key={c}>{c}</option>)}</Select>
              <Input aria-label="Item" placeholder="Ask about an item" value={newSel.item} onChange={(e) => setNewSel({ ...newSel, item: e.target.value })} className="flex-1" />
              <Button type="submit" variant="outline">Add</Button>
            </form>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={<span className="inline-flex items-center gap-2"><Receipt size={16} /> Invoices</span>} />
        <CardBody>
          {invoices.length === 0 ? <p className="text-sm text-steel">No invoices yet.</p> : (
            <ul className="divide-y divide-line">
              {invoices.map((i) => (
                <li key={i.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="min-w-0 flex-1"><p className="text-sm font-mono font-medium">{i.number} <span className="font-sans font-normal text-steel">· {i.lineItems[0]?.description ?? (i.kind === 'pay_app' ? 'Pay application' : i.kind)}</span></p><p className="text-xs text-steel">Due {fmtDate(i.dueDate)}{i.paidAt ? ` · paid ${fmtDate(i.paidAt)}` : ''}</p></div>
                  <span className="font-mono">{money(invoiceNetDue(i))}</span>
                  {i.status === 'paid' ? <Badge tone="success">Paid</Badge> : <Button size="sm" onClick={() => setPaying(i.id)} icon={<CreditCard size={14} />}>Pay</Button>}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Modal open={!!signing} onClose={() => setSigning(null)} title={`Approve change order #${signing?.number ?? ''}`}>
        {signing && (<><p className="text-sm text-steel mb-2">{signing.description}</p><p className="text-sm font-mono mb-3">{money(signing.costImpact)} · {signing.daysImpact} days</p><SignaturePad signerLabel="Your signature" onCancel={() => setSigning(null)} onSave={(dataUrl, name) => { patch('changeOrders', signing.id, { status: 'approved', signature: { dataUrl, name, signedAt: new Date().toISOString() } }, `Client approved CO ${signing.number}`); setSigning(null) }} /></>)}
      </Modal>
      <Modal open={!!paying} onClose={() => setPaying(null)} title="Pay invoice" size="sm" footer={<><Button variant="ghost" onClick={() => setPaying(null)}>Cancel</Button><Button onClick={() => { if (paying) patch('invoices', paying, { status: 'paid', paidAt: new Date().toISOString() }, 'Client paid invoice'); setPaying(null) }}>Mark as paid (demo)</Button></>}>
        <p className="text-sm text-steel">In the live app, card and ACH payments run through the contractor's own payment processor and post here automatically. In this demo, the button simply marks the invoice paid as of {fmtDate(ymd(new Date()))}.</p>
      </Modal>
    </div>
  )
}
