import { useMemo, useState } from 'react'
import { Printer, Sparkles, PenLine, Plus, Trash2, FileSignature } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Input, Textarea } from '@/components/Field'
import { MicButton } from '@/components/MicButton'
import { Modal } from '@/components/Modal'
import { SignaturePad } from '@/components/SignaturePad'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import type { Project, Proposal } from '../../types'
import { computeEstimateTotals, money } from '../../lib/money'
import { uid } from '../../lib/ids'
import { ymd, fmtDateTime } from '../../lib/dates'
import { askLive, generateScope } from '../../lib/ai'
import { AiChip } from '../ai/AiChip'

export function ProposalTab({ project }: { project: Project }) {
  const { state, upsert, patch } = useDemo()
  const proposal = state.proposals.find((p) => p.projectId === project.id)
  const estimate = state.estimates.find((e) => e.projectId === project.id)
  const totals = useMemo(() => (estimate ? computeEstimateTotals(estimate.lines, estimate.taxRatePct, estimate.contingencyPct, estimate.taxApplies) : null), [estimate])
  const [signing, setSigning] = useState(false)
  const [aiLive, setAiLive] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)

  function create() {
    const sections = estimate ? Array.from(new Set(estimate.lines.map((l) => l.section))) : []
    const p: Proposal = {
      id: uid('pr'), projectId: project.id, number: `P-${new Date().getFullYear()}-${String(state.proposals.length + 22).padStart(3, '0')}`, date: ymd(new Date()), status: 'draft',
      scope: generateScope(project.name, project.description || 'work as described in the estimate', sections),
      inclusions: ['Permits and inspections', 'Daily cleanup and final clean', 'Haul-off of demolition debris', 'One-year workmanship warranty'],
      exclusions: ['Repairs to concealed conditions discovered during work (handled by change order)', 'Items not listed in the estimate'],
      timeline: `${Math.max(2, Math.round((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / 604_800_000))} weeks from the start date, subject to material lead times and inspection scheduling.`,
      draws: [{ id: uid('dw'), label: 'Deposit at signing', pct: 30 }, { id: uid('dw'), label: 'Rough-in complete', pct: 30 }, { id: uid('dw'), label: 'Finishes installed', pct: 30 }, { id: uid('dw'), label: 'Final walkthrough', pct: 10 }],
      terms: 'Proposal valid for 30 days. Draw invoices are due within 5 days. Changes to scope are priced and approved in writing before work proceeds. Allowance overages are billed at cost plus 12 percent.',
    }
    upsert('proposals', p, `Create proposal ${p.number}`)
  }
  if (!proposal) {
    return <EmptyState icon={FileSignature} title="No proposal yet" text={estimate ? `Build a branded proposal from the ${money(totals?.grandTotal ?? 0)} estimate.` : 'Build the estimate first, then generate the proposal from it.'} action={<Button onClick={create} disabled={!estimate} icon={<Plus size={16} />}>Generate proposal</Button>} />
  }
  const up = (p: Partial<Proposal>, label = 'Update proposal') => patch('proposals', proposal.id, p, label)
  const drawSum = proposal.draws.reduce((s, d) => s + d.pct, 0)
  async function aiScope() {
    setBusy(true)
    const live = await askLive('You write clear construction proposal scope paragraphs.', `Project: ${project.name}. Description: ${project.description}. Sections: ${estimate ? Array.from(new Set(estimate.lines.map((l) => l.section))).join(', ') : ''}. Write one scope paragraph.`)
    up({ scope: live?.text ?? generateScope(project.name, project.description || 'work as described in the estimate', estimate ? Array.from(new Set(estimate.lines.map((l) => l.section))) : []) })
    setAiLive(!!live)
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title={`Proposal ${proposal.number}`} subtitle={<span className="flex flex-wrap items-center gap-2">{proposal.date} <Badge tone={proposal.status === 'accepted' ? 'success' : proposal.status === 'sent' ? 'blueprint' : 'neutral'}>{proposal.status}</Badge>{totals && <span className="font-mono">{money(totals.grandTotal)}</span>}</span>}
          action={<div className="flex flex-wrap gap-1.5"><Button size="sm" variant="outline" onClick={() => window.open(`/demo/print/proposal/${proposal.id}?auto=1`, '_blank')} icon={<Printer size={14} />}>Print</Button>{proposal.status === 'draft' && <Button size="sm" variant="secondary" onClick={() => up({ status: 'sent' }, 'Send proposal')}>Mark sent</Button>}{!proposal.signature && <Button size="sm" onClick={() => setSigning(true)} icon={<PenLine size={14} />}>Collect signature</Button>}</div>} />
        <CardBody className="space-y-4">
          {proposal.signature && (
            <div className="rounded-lg border border-success/30 bg-[#E6F3EC] p-3 flex items-center gap-3">
              {proposal.signature.dataUrl ? <img src={proposal.signature.dataUrl} alt={`Signature of ${proposal.signature.name}`} className="h-12 bg-white rounded border border-line" /> : <span className="font-display text-2xl italic">{proposal.signature.name}</span>}
              <div className="text-sm"><p className="font-medium text-success">Accepted by {proposal.signature.name}</p><p className="text-xs text-steel">{fmtDateTime(proposal.signature.signedAt)} · demo signature</p></div>
            </div>
          )}
          <div>
            <Textarea label="Scope" rows={5} value={proposal.scope} onChange={(e) => up({ scope: e.target.value })} trailing={<MicButton size="sm" onTranscript={(t) => up({ scope: `${proposal.scope} ${t}`.trim() })} />} />
            <div className="mt-1.5 flex items-center gap-2"><Button size="sm" variant="outline" onClick={aiScope} disabled={busy} icon={<Sparkles size={14} />}>{busy ? 'Writing...' : 'Auto-fill scope'}</Button>{aiLive !== null && <AiChip live={aiLive} />}</div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <ListEditor label="Inclusions" items={proposal.inclusions} onChange={(v) => up({ inclusions: v })} />
            <ListEditor label="Exclusions" items={proposal.exclusions} onChange={(v) => up({ exclusions: v })} />
          </div>
          <Input label="Timeline" value={proposal.timeline} onChange={(e) => up({ timeline: e.target.value })} />
          <div>
            <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">Payment schedule (draws)</span><span className={`font-mono text-xs ${drawSum === 100 ? 'text-success' : 'text-danger'}`}>{drawSum}% {drawSum !== 100 && '(should total 100%)'}</span></div>
            <ul className="space-y-2">
              {proposal.draws.map((d) => (
                <li key={d.id} className="flex gap-2 items-center">
                  <Input aria-label="Draw label" value={d.label} onChange={(e) => up({ draws: proposal.draws.map((x) => (x.id === d.id ? { ...x, label: e.target.value } : x)) })} className="flex-1" />
                  <Input aria-label="Draw percent" type="number" min={0} max={100} value={d.pct} onChange={(e) => up({ draws: proposal.draws.map((x) => (x.id === d.id ? { ...x, pct: Number(e.target.value) || 0 } : x)) })} className="w-24" />
                  <span className="font-mono text-xs w-24 text-right">{totals ? money((totals.grandTotal * d.pct) / 100) : ''}</span>
                  <button type="button" onClick={() => up({ draws: proposal.draws.filter((x) => x.id !== d.id) })} className="tap inline-flex items-center justify-center rounded-lg text-steel hover:text-danger" aria-label="Remove draw"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
            <Button size="sm" variant="ghost" className="mt-2" onClick={() => up({ draws: [...proposal.draws, { id: uid('dw'), label: 'New draw', pct: 0 }] })} icon={<Plus size={14} />}>Add draw</Button>
          </div>
          <Textarea label="Terms" rows={3} value={proposal.terms} onChange={(e) => up({ terms: e.target.value })} />
        </CardBody>
      </Card>
      <Modal open={signing} onClose={() => setSigning(false)} title="Client acceptance">
        <p className="text-sm text-steel mb-3">The client signs on screen to accept proposal {proposal.number}{totals ? ` for ${money(totals.grandTotal)}` : ''}.</p>
        <SignaturePad signerLabel="Client signature" onCancel={() => setSigning(false)} onSave={(dataUrl, name) => { up({ signature: { dataUrl, name, signedAt: new Date().toISOString() }, status: 'accepted' }, 'Accept proposal'); if (project.status === 'proposed' || project.status === 'estimating') patch('projects', project.id, { status: 'in_progress', contractValue: totals?.grandTotal ?? project.contractValue }); setSigning(false) }} />
      </Modal>
    </div>
  )
}

export function ListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  const [v, setV] = useState('')
  return (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-survey shrink-0" aria-hidden="true" />
            <span className="flex-1 break-words">{it}</span>
            <button type="button" onClick={() => onChange(items.filter((_, k) => k !== i))} className="text-steel hover:text-danger min-h-[28px]" aria-label={`Remove ${it}`}><Trash2 size={14} /></button>
          </li>
        ))}
      </ul>
      <form onSubmit={(e) => { e.preventDefault(); if (v.trim()) { onChange([...items, v.trim()]); setV('') } }} className="mt-2 flex gap-2">
        <Input aria-label={`Add ${label.toLowerCase()}`} value={v} onChange={(e) => setV(e.target.value)} placeholder={`Add to ${label.toLowerCase()}`} className="flex-1" />
        <Button type="submit" size="sm" variant="outline" icon={<Plus size={14} />}>Add</Button>
      </form>
    </div>
  )
}
