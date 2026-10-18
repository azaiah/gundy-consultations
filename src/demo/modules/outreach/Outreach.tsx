import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, Check, Send as SendIcon, Reply, Sparkles, Copy } from 'lucide-react'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button, LinkButton } from '@/components/Button'
import { Input, Textarea } from '@/components/Field'
import { MicButton } from '@/components/MicButton'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import { contactById, contactName } from '../../selectors'
import type { Outreach as OutreachT, OutreachStatus } from '../../types'
import { relative } from '../../lib/dates'
import { copyText } from '../../lib/download'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { FilterSelect } from '../shared/Filters'

const statusTone: Record<OutreachStatus, 'neutral' | 'blueprint' | 'success' | 'survey'> = { draft: 'neutral', approved: 'blueprint', sent: 'success', replied: 'survey' }
const statusLabel: Record<OutreachStatus, string> = { draft: 'Draft', approved: 'Approved', sent: 'Sent (demo)', replied: 'Replied' }

export default function Outreach() {
  const { state, patch, upsert } = useDemo()
  const [filter, setFilter] = useState<'all' | OutreachStatus>('all')
  const [editing, setEditing] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const items = useMemo(() => state.outreach.filter((o) => filter === 'all' || o.status === filter).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [state.outreach, filter])
  const counts = (s: OutreachStatus) => state.outreach.filter((o) => o.status === s).length

  function setStatus(o: OutreachT, status: OutreachStatus) {
    patch('outreach', o.id, { status, updatedAt: new Date().toISOString() }, `${statusLabel[status]}: ${o.subject}`)
    const opp = state.opportunities.find((x) => x.id === o.opportunityId)
    if (opp) patch('opportunities', opp.id, { lastTouchedAt: new Date().toISOString() })
    if (status === 'sent' && o.contactId) {
      const c = contactById(state, o.contactId)
      if (c) upsert('contacts', { ...c, logs: [...c.logs, { id: `lg_${Date.now()}`, type: o.channel === 'email' ? 'email' : 'call', at: new Date().toISOString(), outcome: 'Sent (demo)', notes: `${o.subject}\n\n${o.body}` }] })
    }
  }

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Outreach" helpKey="outreach" subtitle="Nothing is sent without your approval. Edit, approve, then send." actions={<LinkButton to="/demo/ai" variant="outline" icon={<Sparkles size={16} />}>Message generator</LinkButton>} />
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <FilterSelect label="Status" value={filter} onChange={setFilter} options={[{ value: 'all', label: `All (${state.outreach.length})` }, { value: 'draft', label: `Draft (${counts('draft')})` }, { value: 'approved', label: `Approved (${counts('approved')})` }, { value: 'sent', label: `Sent (${counts('sent')})` }, { value: 'replied', label: `Replied (${counts('replied')})` }]} />
        <p className="text-xs text-steel">Draft → Approved → Sent (demo) → Replied</p>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={SendIcon} title="No outreach here" text="Drafts are created for each lead and bid the sweep finds. Use the message generator to write a new one." action={<LinkButton to="/demo/ai">Open message generator</LinkButton>} />
      ) : (
        <div className="space-y-3">
          {items.map((o) => {
            const opp = state.opportunities.find((x) => x.id === o.opportunityId)
            const c = contactById(state, o.contactId)
            const isEditing = editing === o.id
            return (
              <Card key={o.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {o.channel === 'email' ? <Mail size={16} className="text-blueprint" /> : <Phone size={16} className="text-blueprint" />}
                      <h2 className="font-semibold break-words">{o.subject}</h2>
                      <Badge tone={statusTone[o.status]} mono>{statusLabel[o.status]}</Badge>
                    </div>
                    <p className="text-xs text-steel mt-1 break-words">
                      {c ? <Link to={`/demo/contacts/${c.id}`} className="text-blueprint underline">{contactName(c)}</Link> : o.contactId ? 'Contact removed' : 'No contact linked'}
                      {opp && <> · re: <Link to={opp.kind === 'bid' ? `/demo/bids?open=${opp.id}` : `/demo/leads?open=${opp.id}`} className="text-blueprint underline">{opp.title}</Link></>}
                      {' · '}updated {relative(o.updatedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="ghost" onClick={async () => { if (await copyText(o.body)) { setCopied(o.id); setTimeout(() => setCopied(null), 1500) } }} icon={<Copy size={14} />}>{copied === o.id ? 'Copied' : 'Copy'}</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(isEditing ? null : o.id)}>{isEditing ? 'Done' : 'Edit'}</Button>
                    {o.status === 'draft' && <Button size="sm" onClick={() => setStatus(o, 'approved')} icon={<Check size={14} />}>Approve</Button>}
                    {o.status === 'approved' && <Button size="sm" onClick={() => setStatus(o, 'sent')} icon={<SendIcon size={14} />}>{o.channel === 'email' ? 'Send (demo)' : 'Mark called'}</Button>}
                    {o.status === 'sent' && <Button size="sm" variant="secondary" onClick={() => setStatus(o, 'replied')} icon={<Reply size={14} />}>Log reply</Button>}
                  </div>
                </div>
                {isEditing ? (
                  <div className="mt-3 space-y-2">
                    <Input label="Subject" value={o.subject} onChange={(e) => patch('outreach', o.id, { subject: e.target.value, updatedAt: new Date().toISOString() })} />
                    <Textarea label="Body" rows={9} value={o.body} onChange={(e) => patch('outreach', o.id, { body: e.target.value, updatedAt: new Date().toISOString() })} trailing={<MicButton size="sm" onTranscript={(t) => patch('outreach', o.id, { body: `${o.body} ${t}`.trim(), updatedAt: new Date().toISOString() })} />} />
                  </div>
                ) : (
                  <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm text-ink bg-concrete/60 rounded-lg p-3">{o.body}</pre>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
