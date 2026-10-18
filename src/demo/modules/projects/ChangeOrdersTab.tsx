import { useState } from 'react'
import { Plus, PenLine, Printer, FileDiff } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Input, Textarea } from '@/components/Field'
import { MicButton } from '@/components/MicButton'
import { Modal } from '@/components/Modal'
import { SignaturePad } from '@/components/SignaturePad'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import type { ChangeOrder, Project } from '../../types'
import { money } from '../../lib/money'
import { uid } from '../../lib/ids'
import { fmtDateTime } from '../../lib/dates'

export function ChangeOrdersTab({ project }: { project: Project }) {
  const { state, upsert, patch } = useDemo()
  const cos = state.changeOrders.filter((c) => c.projectId === project.id).sort((a, b) => a.number - b.number)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ description: '', costImpact: 0, daysImpact: 0 })
  const [signing, setSigning] = useState<ChangeOrder | null>(null)
  const approved = cos.filter((c) => c.status === 'approved').reduce((s, c) => s + c.costImpact, 0)

  function add() {
    if (!draft.description.trim()) return
    const co: ChangeOrder = { id: uid('co'), projectId: project.id, number: (cos[cos.length - 1]?.number ?? 0) + 1, description: draft.description.trim(), costImpact: Number(draft.costImpact) || 0, daysImpact: Number(draft.daysImpact) || 0, status: 'pending', createdAt: new Date().toISOString() }
    upsert('changeOrders', co, `Create change order ${co.number}`)
    setDraft({ description: '', costImpact: 0, daysImpact: 0 })
    setAdding(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Change orders" subtitle={`Base contract ${money(project.contractValue)} + approved changes ${money(approved)} = ${money(project.contractValue + approved)}`} action={<Button size="sm" onClick={() => setAdding(true)} icon={<Plus size={14} />}>New change order</Button>} />
        <CardBody>
          {cos.length === 0 ? <EmptyState compact icon={FileDiff} title="No change orders" text="Concealed conditions and client requests get priced here and signed before work proceeds." action={<Button size="sm" onClick={() => setAdding(true)}>New change order</Button>} /> : (
            <ul className="divide-y divide-line">
              {cos.map((c) => (
                <li key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">CO #{c.number}</span>
                      <Badge tone={c.status === 'approved' ? 'success' : c.status === 'rejected' ? 'danger' : 'warning'}>{c.status}</Badge>
                      <span className="font-mono text-sm">{c.costImpact >= 0 ? '+' : ''}{money(c.costImpact)}</span>
                      <span className="text-xs text-steel">{c.daysImpact >= 0 ? '+' : ''}{c.daysImpact} day{Math.abs(c.daysImpact) === 1 ? '' : 's'}</span>
                    </div>
                    <p className="text-sm text-steel mt-1 break-words">{c.description}</p>
                    {c.signature && <p className="text-xs text-success mt-1">Approved by {c.signature.name} · {fmtDateTime(c.signature.signedAt)}</p>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => window.open(`/demo/print/change-order/${c.id}?auto=1`, '_blank')} icon={<Printer size={14} />}>Print</Button>
                    {c.status === 'pending' && <Button size="sm" onClick={() => setSigning(c)} icon={<PenLine size={14} />}>Client approval</Button>}
                    {c.status === 'pending' && <Button size="sm" variant="ghost" onClick={() => patch('changeOrders', c.id, { status: 'rejected' }, 'Reject change order')}>Reject</Button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
      <Modal open={adding} onClose={() => setAdding(false)} title="New change order" footer={<><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button onClick={add}>Create</Button></>}>
        <div className="space-y-3">
          <Textarea label="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="What changed and why" trailing={<MicButton size="sm" onTranscript={(t) => setDraft((d) => ({ ...d, description: `${d.description} ${t}`.trim() }))} />} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cost impact ($)" type="number" value={draft.costImpact} onChange={(e) => setDraft({ ...draft, costImpact: Number(e.target.value) })} />
            <Input label="Schedule impact (days)" type="number" value={draft.daysImpact} onChange={(e) => setDraft({ ...draft, daysImpact: Number(e.target.value) })} />
          </div>
        </div>
      </Modal>
      <Modal open={!!signing} onClose={() => setSigning(null)} title={`Approve change order #${signing?.number ?? ''}`}>
        {signing && (
          <>
            <p className="text-sm text-steel mb-3">{signing.description}</p>
            <p className="text-sm mb-3 font-mono">{money(signing.costImpact)} · {signing.daysImpact} days</p>
            <SignaturePad signerLabel="Client signature" onCancel={() => setSigning(null)} onSave={(dataUrl, name) => { patch('changeOrders', signing.id, { status: 'approved', signature: { dataUrl, name, signedAt: new Date().toISOString() } }, `Approve change order ${signing.number}`); setSigning(null) }} />
          </>
        )}
      </Modal>
    </div>
  )
}
