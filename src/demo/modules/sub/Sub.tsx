import { HardHat, Landmark, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import { contactName, subBlockReason } from '../../selectors'
import { money0 } from '../../lib/money'
import { fmtDate } from '../../lib/dates'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { ComplianceDocs } from '../shared/ComplianceDocs'
import { DueBadge } from '../shared/DueBadge'

export default function Sub() {
  const { state, upsert, set, patch } = useDemo()
  const subs = state.contacts.filter((c) => c.type === 'sub')
  const me = subs.find((s) => s.id === state.subSelectedContactId) ?? subs[0]
  if (!me) return <EmptyState icon={HardHat} title="No subcontractors" text="Add a subcontractor contact to use this view." />
  const block = subBlockReason(me)
  const jobs = state.projects.filter((p) => p.subIds.includes(me.id))
  const invites = state.opportunities.filter((o) => o.kind === 'bid' && o.status !== 'no_bid' && o.requiredTrades.some((t) => (me.trade ?? '').toLowerCase().includes(t.toLowerCase().split(' ')[0])) || (o.kind === 'bid' && o.status === 'pipeline' && ['estimating', 'qualified'].includes(o.stage ?? ''))).slice(0, 5)

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="My jobs" helpKey="sub" subtitle={`Signed in as ${me.company ?? contactName(me)} · ${me.trade ?? 'Subcontractor'} (demo)`} actions={
        <select aria-label="View as subcontractor" value={me.id} onChange={(e) => set('subSelectedContactId', e.target.value)} className="rounded-lg border border-line bg-paper px-3 py-2 text-sm min-h-[44px]">
          {subs.map((s) => <option key={s.id} value={s.id}>{s.company ?? contactName(s)}</option>)}
        </select>
      } />
      <div className={`rounded-xl border p-4 mb-4 flex gap-3 ${block ? 'border-danger/40 bg-[#FBE9E7]' : 'border-success/30 bg-[#E6F3EC]'}`}>
        {block ? <AlertTriangle className="text-danger shrink-0" /> : <CheckCircle2 className="text-success shrink-0" />}
        <div><p className={`font-medium ${block ? 'text-danger' : 'text-success'}`}>{block ? 'Paperwork needed' : 'Paperwork current'}</p><p className="text-sm text-ink mt-0.5">{block ? `${block} Upload the renewed document below to be eligible for assignments.` : 'You can be assigned to jobs by Cumberland Ridge Builders.'}</p></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Assigned jobs" />
          <CardBody>
            {jobs.length === 0 ? <p className="text-sm text-steel">No current assignments.</p> : (
              <ul className="divide-y divide-line">{jobs.map((p) => <li key={p.id} className="py-2.5"><p className="font-medium text-sm">{p.name}</p><p className="text-xs text-steel">{p.address} · {fmtDate(p.startDate, { month: 'short', day: 'numeric' })} to {fmtDate(p.endDate, { month: 'short', day: 'numeric' })}</p><Badge tone="neutral" className="mt-1">{p.status.replace('_', ' ')}</Badge></li>)}</ul>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title={<span className="inline-flex items-center gap-2"><Landmark size={16} /> Bid invitations</span>} subtitle="Jobs the GC is pricing where your trade is needed." />
          <CardBody>
            {invites.length === 0 ? <p className="text-sm text-steel">No open invitations.</p> : (
              <ul className="divide-y divide-line">
                {invites.map((o) => (
                  <li key={o.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium break-words">{o.title}</p><p className="text-xs text-steel">{o.requiredTrades.join(', ')} · est. {money0(o.estValue)}</p></div>
                    <DueBadge date={o.dueDate} />
                    <Button size="sm" variant="outline" onClick={() => patch('opportunities', o.id, { notes: `${o.notes}\n${me.company ?? contactName(me)} will quote (sub portal).`.trim() }, 'Sub responded to invite')}>Will quote</Button>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader title="My paperwork" subtitle="Upload a current COI and license to stay eligible. Max 2 MB per file (demo)." />
        <CardBody><ComplianceDocs title="Documents" docs={me.compliance} onChange={(compliance) => upsert('contacts', { ...me, compliance }, 'Sub uploaded paperwork')} /></CardBody>
      </Card>
    </div>
  )
}
