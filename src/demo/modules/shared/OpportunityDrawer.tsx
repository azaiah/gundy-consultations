import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, FileText, KanbanSquare, Printer, Ban, Sparkles, UserPlus } from 'lucide-react'
import { Drawer } from '@/components/Drawer'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { Textarea, Select } from '@/components/Field'
import { MicButton } from '@/components/MicButton'
import { StampLabel } from '@/components/StampLabel'
import type { Opportunity, Contact } from '../../types'
import { useDemo } from '../../store'
import { scoreFor } from '../../selectors'
import { money0 } from '../../lib/money'
import { fmtDate, stamp, daysUntil } from '../../lib/dates'
import { generateLeadSummary, askLive } from '../../lib/ai'
import { uid } from '../../lib/ids'
import { ScoreBadge, ScoreBreakdown } from './ScoreBadge'
import { DueBadge, NewBadge } from './DueBadge'
import { AiChip } from '../ai/AiChip'

export function OpportunityDrawer({ opp, onClose }: { opp: Opportunity | null; onClose: () => void }) {
  const { state, patch, upsert } = useDemo()
  const nav = useNavigate()
  const [noBid, setNoBid] = useState(false)
  const [reason, setReason] = useState('Outside our typical scope')
  const [summary, setSummary] = useState<{ text: string; live: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  if (!opp) return null
  const score = scoreFor(state, opp)
  const inPipeline = opp.status === 'pipeline'

  function addToPipeline() {
    if (!opp) return
    patch('opportunities', opp.id, { status: 'pipeline', stage: opp.stage ?? 'found', lastTouchedAt: new Date().toISOString(), pipelineAmount: opp.pipelineAmount ?? opp.estValue }, `Add ${opp.title} to pipeline`)
    nav('/demo/pipeline')
  }
  function markNoBid() {
    if (!opp) return
    patch('opportunities', opp.id, { status: 'no_bid', noBidReason: reason, stage: undefined, lastTouchedAt: new Date().toISOString() }, `Mark ${opp.title} no-bid`)
    setNoBid(false)
    onClose()
  }
  function createContact() {
    if (!opp) return
    const existing = state.contacts.find((c) => `${c.firstName} ${c.lastName}`.trim().toLowerCase() === opp.owner.toLowerCase() || (c.company ?? '').toLowerCase() === opp.owner.toLowerCase())
    if (existing) {
      nav(`/demo/contacts/${existing.id}`)
      return
    }
    const parts = opp.owner.replace(/\(.*\)/, '').trim().split(' ')
    const isCompany = /\b(LLC|Inc|HOA|Management|Realty|Government|Agency|Schools|County|Clinic|Dental|Trust|Construction|Builders)\b/i.test(opp.owner)
    const c: Contact = {
      id: uid('ct'), type: 'lead', firstName: isCompany ? '' : parts[0] ?? '', lastName: isCompany ? '' : parts.slice(1).join(' '), company: isCompany ? opp.owner : undefined,
      address: opp.address, tags: [opp.source], notesHtml: `<p>Created from ${opp.kind} "${opp.title}".</p>`, attachments: [], logs: [], createdAt: new Date().toISOString(), source: opp.source, compliance: [],
    }
    upsert('contacts', c, `Create contact ${opp.owner}`)
    nav(`/demo/contacts/${c.id}`)
  }
  async function aiSummary() {
    if (!opp) return
    setBusy(true)
    const prompt = `Summarize this ${opp.kind} for a contractor in 3 sentences and suggest a next step.\nTitle: ${opp.title}\nOwner: ${opp.owner}\nSource: ${opp.source}\nScope: ${opp.scopeSummary}\nWhy it fits: ${opp.whyFits.join('; ')}\nConcerns: ${opp.whyNot.join('; ')}`
    const live = await askLive('You write concise summaries for construction contractors.', prompt)
    setSummary(live ?? { text: generateLeadSummary(opp.title, opp.owner, opp.source, opp.scopeSummary, opp.whyFits), live: false })
    setBusy(false)
  }

  return (
    <Drawer open={!!opp} onClose={onClose} title={opp.title} subtitle={`${opp.owner} · ${opp.source}`} wide
      footer={
        <>
          {!inPipeline && opp.status !== 'no_bid' && <Button onClick={addToPipeline} icon={<KanbanSquare size={16} />}>Add to pipeline</Button>}
          {inPipeline && <Button variant="secondary" onClick={() => nav('/demo/pipeline')} icon={<KanbanSquare size={16} />}>View on pipeline</Button>}
          {opp.kind === 'bid' && <Button variant="outline" onClick={() => window.open(`/demo/print/prequal/${opp.id}?auto=1`, '_blank')} icon={<Printer size={16} />}>Generate prequal packet</Button>}
          {opp.kind === 'lead' && <Button variant="outline" onClick={createContact} icon={<UserPlus size={16} />}>Create contact</Button>}
          {opp.status !== 'no_bid' && <Button variant="ghost" onClick={() => setNoBid(true)} icon={<Ban size={16} />}>Mark no-bid</Button>}
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ScoreBadge score={score} large />
        <NewBadge foundAt={opp.foundAt} />
        {opp.kind === 'bid' && <DueBadge date={opp.dueDate} />}
        {opp.preBidDate && <Badge tone="blueprint" mono>Pre-bid {fmtDate(opp.preBidDate, { month: 'numeric', day: 'numeric' })}</Badge>}
        {opp.bondRequired && <Badge tone="warning">Bond required</Badge>}
        {opp.prevailingWage && <Badge tone="warning">Davis-Bacon</Badge>}
        {opp.setAside && opp.setAside !== 'None' && <Badge tone="blueprint">{opp.setAside}</Badge>}
        {opp.status === 'no_bid' && <Badge tone="danger">No-bid: {opp.noBidReason}</Badge>}
      </div>
      <StampLabel>Found {stamp(opp.foundAt)}</StampLabel>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><dt className="stamp">Est. value</dt><dd className="font-semibold">{money0(opp.estValue)}</dd></div>
        <div><dt className="stamp">Trade</dt><dd>{opp.requiredTrades.join(', ')}</dd></div>
        <div><dt className="stamp">County</dt><dd>{opp.county} · {opp.distanceMiles} mi</dd></div>
        {opp.address && <div className="col-span-2"><dt className="stamp">Address</dt><dd className="break-words">{opp.address}</dd></div>}
        {opp.sourceUrl && (
          <div className="col-span-2">
            <dt className="stamp">Source link</dt>
            <dd><a href={opp.sourceUrl} target="_blank" rel="noreferrer" className="text-blueprint underline inline-flex items-center gap-1 break-all">{opp.sourceUrl} <ExternalLink size={12} /></a></dd>
          </div>
        )}
      </dl>

      {opp.permit && (
        <section className="mt-5 rounded-xl border border-line bg-concrete/60 p-4">
          <h3 className="stamp mb-2">Permit record (sample)</h3>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-steel text-xs">Permit number</dt><dd className="font-mono">{opp.permit.number}</dd></div>
            <div><dt className="text-steel text-xs">Type</dt><dd>{opp.permit.type}</dd></div>
            <div><dt className="text-steel text-xs">Valuation</dt><dd>{money0(opp.permit.valuation)}</dd></div>
            <div><dt className="text-steel text-xs">Filed</dt><dd>{fmtDate(opp.permit.filedDate)}</dd></div>
            <div className="col-span-2"><dt className="text-steel text-xs">Applicant</dt><dd>{opp.permit.applicant}</dd></div>
          </dl>
        </section>
      )}

      <section className="mt-5">
        <h3 className="font-semibold">Scope summary</h3>
        <p className="text-sm text-steel mt-1 leading-relaxed">{opp.scopeSummary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={aiSummary} disabled={busy} icon={<Sparkles size={14} />}>{busy ? 'Summarizing...' : 'Auto-fill summary'}</Button>
          {summary && <AiChip live={summary.live} />}
        </div>
        {summary && <p className="mt-2 text-sm bg-blueprint-50 rounded-lg p-3 break-words">{summary.text}</p>}
      </section>

      <section className="mt-5 grid sm:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-success">Why it fits</h3>
          <ul className="mt-1 space-y-1 text-sm text-steel list-disc pl-5">{opp.whyFits.map((w) => <li key={w}>{w}</li>)}{opp.whyFits.length === 0 && <li>Nothing specific noted.</li>}</ul>
        </div>
        <div>
          <h3 className="font-semibold text-danger">Why it might not</h3>
          <ul className="mt-1 space-y-1 text-sm text-steel list-disc pl-5">{opp.whyNot.map((w) => <li key={w}>{w}</li>)}{opp.whyNot.length === 0 && <li>No concerns noted.</li>}</ul>
        </div>
      </section>

      <section className="mt-5">
        <h3 className="font-semibold mb-2">Go / no-go breakdown</h3>
        <ScoreBreakdown score={score} />
      </section>

      {opp.kind === 'bid' && (
        <section className="mt-5">
          <h3 className="font-semibold">Addenda</h3>
          {opp.addenda.length === 0 ? <p className="text-sm text-steel mt-1">No addenda issued.</p> : (
            <ul className="mt-1 space-y-1 text-sm">
              {opp.addenda.map((a) => <li key={a.id} className="rounded-lg border border-line p-2"><span className="font-mono text-xs text-steel">Addendum {a.number} · {fmtDate(a.date)}</span><br />{a.summary}</li>)}
            </ul>
          )}
          <h3 className="font-semibold mt-4">Documents</h3>
          <ul className="mt-1 space-y-1 text-sm">
            {opp.documents.map((d) => <li key={d.id} className="flex items-center gap-2 text-steel"><FileText size={14} /> {d.name} <span className="text-xs">({d.type})</span></li>)}
            {opp.documents.length === 0 && <li className="text-steel">Plan and spec links appear here when the source publishes them.</li>}
          </ul>
        </section>
      )}

      {(opp.draftResponse || opp.draftCallScript) && (
        <section className="mt-5">
          <h3 className="font-semibold">Drafted {opp.kind === 'bid' ? 'response' : 'outreach'}</h3>
          {opp.draftResponse && <p className="mt-1 text-sm whitespace-pre-wrap rounded-lg bg-concrete p-3 break-words">{opp.draftResponse}</p>}
          {opp.draftCallScript && <><h4 className="stamp mt-3">Call script</h4><p className="mt-1 text-sm whitespace-pre-wrap rounded-lg bg-concrete p-3 break-words">{opp.draftCallScript}</p></>}
          <Button size="sm" variant="secondary" className="mt-2" onClick={() => nav('/demo/outreach')}>Open in Outreach</Button>
        </section>
      )}

      <section className="mt-5">
        <h3 className="font-semibold">Notes</h3>
        <Textarea aria-label="Notes" value={opp.notes} onChange={(e) => patch('opportunities', opp.id, { notes: e.target.value })} placeholder="Add a note about this opportunity" trailing={<MicButton size="sm" onTranscript={(t) => patch('opportunities', opp.id, { notes: `${opp.notes} ${t}`.trim() })} />} />
        {opp.dueDate && (daysUntil(opp.dueDate) ?? 0) < 0 && <p className="text-xs text-steel mt-1">This deadline has passed.</p>}
      </section>

      <Modal open={noBid} onClose={() => setNoBid(false)} title="Mark as no-bid" size="sm" footer={<><Button variant="ghost" onClick={() => setNoBid(false)}>Cancel</Button><Button variant="danger" onClick={markNoBid}>Mark no-bid</Button></>}>
        <Select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>
          {['Outside our typical scope', 'Too far', 'Exceeds bonding', 'Set-aside not held', 'Too busy', 'Deadline too tight', 'Low margin', 'Other'].map((r) => <option key={r}>{r}</option>)}
        </Select>
        <p className="text-xs text-steel mt-2">The engine records the reason so it can stop surfacing similar work.</p>
      </Modal>
    </Drawer>
  )
}
