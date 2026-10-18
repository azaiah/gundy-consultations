import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Pencil, Trash2, Plus, AlertTriangle, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button, LinkButton } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Tabs } from '@/components/Tabs'
import { Modal } from '@/components/Modal'
import { Input, Select, Textarea } from '@/components/Field'
import { MicButton } from '@/components/MicButton'
import { RichTextEditor } from '@/components/RichTextEditor'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import { contactName, subBlockReason } from '../../selectors'
import type { Contact, ContactLog } from '../../types'
import { formatPhone } from '../../lib/vcard'
import { fmtDateTime, relative } from '../../lib/dates'
import { uid } from '../../lib/ids'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { ContactForm } from './ContactForm'
import { PhotoAttach } from '../shared/PhotoAttach'
import { TodoList } from '../shared/TodoList'
import { ComplianceDocs } from '../shared/ComplianceDocs'

const logTypes: { id: ContactLog['type']; label: string }[] = [
  { id: 'call', label: 'Call' }, { id: 'text', label: 'Text' }, { id: 'email', label: 'Email' }, { id: 'meeting', label: 'Meeting' }, { id: 'site_visit', label: 'Site visit' }, { id: 'note', label: 'Note' },
]

export default function ContactDetail() {
  const { id } = useParams()
  const { state, upsert, remove } = useDemo()
  const nav = useNavigate()
  const c = state.contacts.find((x) => x.id === id)
  const [tab, setTab] = useState<'notes' | 'logs' | 'todos' | 'compliance' | 'related'>('notes')
  const [editing, setEditing] = useState(false)
  const [logOpen, setLogOpen] = useState<ContactLog | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const todos = useMemo(() => state.todos.filter((t) => t.contactId === id), [state.todos, id])

  if (!c) return <EmptyState icon={AlertTriangle} title="Contact not found" text="It may have been deleted." action={<LinkButton to="/demo/contacts">Back to contacts</LinkButton>} />
  const update = (patch: Partial<Contact>, label?: string) => upsert('contacts', { ...c, ...patch }, label ?? `Update ${contactName(c)}`)
  const block = c.type === 'sub' ? subBlockReason(c) : null
  const related = {
    projects: state.projects.filter((p) => p.customerId === c.id || p.subIds.includes(c.id)),
    opps: state.opportunities.filter((o) => o.owner.toLowerCase().includes((c.company ?? `${c.firstName} ${c.lastName}`).toLowerCase().trim()) && (c.company || c.lastName)),
    outreach: state.outreach.filter((o) => o.contactId === c.id),
  }

  function saveLog(l: ContactLog) {
    const exists = c!.logs.some((x) => x.id === l.id)
    update({ logs: exists ? c!.logs.map((x) => (x.id === l.id ? l : x)) : [...c!.logs, l] }, `Log ${l.type} with ${contactName(c!)}`)
    setLogOpen(null)
  }

  return (
    <div>
      <SampleRibbon />
      <Link to="/demo/contacts" className="inline-flex items-center gap-1 text-sm text-blueprint min-h-[32px] mb-1"><ArrowLeft size={14} /> Contacts</Link>
      <PageHeader title={`${c.firstName} ${c.lastName}`.trim() || c.company || 'Contact'} helpKey="contacts" subtitle={<span className="flex flex-wrap items-center gap-2"><Badge tone={c.type === 'sub' ? 'blueprint' : c.type === 'customer' ? 'success' : 'survey'}>{c.type === 'sub' ? 'Subcontractor' : c.type === 'customer' ? 'Customer' : 'Lead'}</Badge>{c.company && (c.firstName || c.lastName) ? c.company : null}{c.trade ? <Badge tone="neutral">{c.trade}</Badge> : null}{block && <Badge tone="danger"><AlertTriangle size={11} /> Blocked from assignment</Badge>}</span>}
        actions={<><Button variant="outline" onClick={() => setEditing(true)} icon={<Pencil size={16} />}>Edit</Button><LinkButton to={`/demo/ai?contact=${c.id}`} variant="outline" icon={<Sparkles size={16} />}>Write message</LinkButton><Button variant="ghost" onClick={() => setConfirmDelete(true)} icon={<Trash2 size={16} />}>Delete</Button></>} />

      <div className="grid gap-4 sm:grid-cols-3 mb-5">
        <Card className="p-4 sm:col-span-2">
          <ul className="space-y-1.5 text-sm">
            {c.phone && <li><a href={`tel:${c.phone}`} className="inline-flex items-center gap-2 text-ink hover:text-blueprint min-h-[32px]"><Phone size={16} className="text-steel" /> {formatPhone(c.phone)}</a></li>}
            {c.email && <li><a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 text-ink hover:text-blueprint min-h-[32px] break-all"><Mail size={16} className="text-steel" /> {c.email}</a></li>}
            {c.address && <li className="inline-flex items-start gap-2"><MapPin size={16} className="text-steel mt-2" /> <span className="min-h-[32px] inline-flex items-center break-words">{c.address}</span></li>}
            {!c.phone && !c.email && !c.address && <li className="text-steel">No contact details yet.</li>}
          </ul>
          <div className="mt-3 flex flex-wrap gap-1.5 items-center">
            {c.tags.map((t) => <Badge key={t} tone="neutral">{t} <button type="button" aria-label={`Remove tag ${t}`} className="ml-0.5 text-steel hover:text-danger" onClick={() => update({ tags: c.tags.filter((x) => x !== t) })}>x</button></Badge>)}
            <TagAdder onAdd={(t) => update({ tags: Array.from(new Set([...c.tags, t])) })} />
          </div>
        </Card>
        <Card className="p-4">
          <p className="stamp">Added</p>
          <p className="text-sm">{relative(c.createdAt)}{c.source ? ` · ${c.source}` : ''}</p>
          <p className="stamp mt-3">Activity</p>
          <p className="text-sm">{c.logs.length} log{c.logs.length === 1 ? '' : 's'} · {todos.filter((t) => !t.done).length} open to-do{todos.filter((t) => !t.done).length === 1 ? '' : 's'}</p>
          {c.type === 'sub' && (
            <>
              <p className="stamp mt-3">Rating</p>
              <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={c.rating === n} onClick={() => update({ rating: n })} className={`h-8 w-8 rounded-md border text-sm font-mono ${(c.rating ?? 0) >= n ? 'bg-survey text-white border-survey' : 'border-line text-steel'}`}>{n}</button>)}
              </div>
            </>
          )}
        </Card>
      </div>

      <Tabs items={[{ id: 'notes', label: 'Notes and photos' }, { id: 'logs', label: 'Logs', count: c.logs.length }, { id: 'todos', label: 'To-dos', count: todos.filter((t) => !t.done).length }, ...(c.type === 'sub' ? [{ id: 'compliance' as const, label: 'Compliance', count: c.compliance.length }] : []), { id: 'related', label: 'Related' }]} value={tab} onChange={setTab} className="mb-4" />

      {tab === 'notes' && (
        <Card>
          <CardHeader title="Notes" subtitle="Bold, italic, lists, and dictation." />
          <CardBody className="space-y-4">
            <RichTextEditor label="Contact notes" value={c.notesHtml} onChange={(html) => update({ notesHtml: html }, 'Update notes')} />
            <PhotoAttach attachments={c.attachments} onChange={(a) => update({ attachments: a }, 'Update photos')} />
          </CardBody>
        </Card>
      )}

      {tab === 'logs' && (
        <Card>
          <CardHeader title="Contact log" subtitle="Calls, texts, emails, meetings and site visits." action={<Button size="sm" onClick={() => setLogOpen({ id: uid('lg'), type: 'call', at: new Date().toISOString(), outcome: '', notes: '' })} icon={<Plus size={14} />}>Log activity</Button>} />
          <CardBody>
            {c.logs.length === 0 ? <EmptyState compact icon={Phone} title="No activity yet" text="Log the first call so the follow-up has a history." action={<Button size="sm" onClick={() => setLogOpen({ id: uid('lg'), type: 'call', at: new Date().toISOString(), outcome: '', notes: '' })}>Log a call</Button>} /> : (
              <ol className="relative border-l border-line ml-2 space-y-4">
                {[...c.logs].sort((a, b) => b.at.localeCompare(a.at)).map((l) => (
                  <li key={l.id} className="pl-5 relative">
                    <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-survey" aria-hidden="true" />
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="blueprint">{logTypes.find((t) => t.id === l.type)?.label}</Badge>
                      <span className="text-xs text-steel font-mono">{fmtDateTime(l.at)}</span>
                      {l.outcome && <span className="text-sm font-medium">{l.outcome}</span>}
                      <button type="button" onClick={() => setLogOpen(l)} className="ml-auto text-xs text-blueprint underline min-h-[32px]">Edit</button>
                    </div>
                    {l.notes && <p className="text-sm text-steel mt-1 whitespace-pre-wrap break-words">{l.notes}</p>}
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      )}

      {tab === 'todos' && (
        <Card>
          <CardHeader title="To-dos" subtitle="Tied to this contact. Also visible on the global To-dos tab." />
          <CardBody><TodoList todos={todos} contactId={c.id} /></CardBody>
        </Card>
      )}

      {tab === 'compliance' && c.type === 'sub' && (
        <Card>
          <CardHeader title="Compliance" subtitle={block ? <span className="text-danger">{block} This sub cannot be assigned to a job until it is renewed.</span> : 'COI and license are current. This sub can be assigned.'} />
          <CardBody><ComplianceDocs docs={c.compliance} onChange={(d) => update({ compliance: d }, 'Update compliance docs')} /></CardBody>
        </Card>
      )}

      {tab === 'related' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader title="Projects" /><CardBody>{related.projects.length === 0 ? <p className="text-sm text-steel">None</p> : <ul className="space-y-1 text-sm">{related.projects.map((p) => <li key={p.id}><Link className="text-blueprint underline" to={`/demo/projects/${p.id}`}>{p.name}</Link></li>)}</ul>}</CardBody></Card>
          <Card><CardHeader title="Bids and leads" /><CardBody>{related.opps.length === 0 ? <p className="text-sm text-steel">None</p> : <ul className="space-y-1 text-sm">{related.opps.map((o) => <li key={o.id}><Link className="text-blueprint underline" to={o.kind === 'bid' ? `/demo/bids?open=${o.id}` : `/demo/leads?open=${o.id}`}>{o.title}</Link></li>)}</ul>}</CardBody></Card>
          <Card><CardHeader title="Outreach" /><CardBody>{related.outreach.length === 0 ? <p className="text-sm text-steel">None</p> : <ul className="space-y-1 text-sm">{related.outreach.map((o) => <li key={o.id}><Link className="text-blueprint underline" to="/demo/outreach">{o.subject}</Link> <Badge tone="neutral" mono>{o.status}</Badge></li>)}</ul>}</CardBody></Card>
        </div>
      )}

      {editing && <ContactForm open={editing} onClose={() => setEditing(false)} initial={c} onSave={(x) => upsert('contacts', x, `Update ${contactName(x)}`)} />}
      {logOpen && <LogModal log={logOpen} onClose={() => setLogOpen(null)} onSave={saveLog} />}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete contact?" size="sm" footer={<><Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button><Button variant="danger" onClick={() => { remove('contacts', c.id, `Delete ${contactName(c)}`); nav('/demo/contacts') }}>Delete</Button></>}>
        <p className="text-sm text-steel">This removes {contactName(c)} and their logs and photos. To-dos stay on the To-dos tab.</p>
      </Modal>
    </div>
  )
}

function TagAdder({ onAdd }: { onAdd: (t: string) => void }) {
  const [v, setV] = useState('')
  const [open, setOpen] = useState(false)
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="text-xs text-blueprint underline min-h-[28px]">+ tag</button>
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (v.trim()) onAdd(v.trim()); setV(''); setOpen(false) }} className="inline-flex gap-1">
      <input value={v} onChange={(e) => setV(e.target.value)} aria-label="New tag" className="rounded border border-line px-2 py-1 text-xs min-h-[28px]" autoFocus />
      <Button size="sm" type="submit">Add</Button>
    </form>
  )
}

function LogModal({ log, onClose, onSave }: { log: ContactLog; onClose: () => void; onSave: (l: ContactLog) => void }) {
  const [l, setL] = useState(log)
  const local = new Date(l.at)
  const localValue = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}T${String(local.getHours()).padStart(2, '0')}:${String(local.getMinutes()).padStart(2, '0')}`
  return (
    <Modal open onClose={onClose} title="Log activity" footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={() => onSave(l)}>Save</Button></>}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Select label="Type" value={l.type} onChange={(e) => setL({ ...l, type: e.target.value as ContactLog['type'] })}>{logTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</Select>
        <Input label="Date and time" type="datetime-local" value={localValue} onChange={(e) => setL({ ...l, at: new Date(e.target.value).toISOString() })} />
        <Input label="Outcome" className="sm:col-span-2" value={l.outcome} onChange={(e) => setL({ ...l, outcome: e.target.value })} placeholder="Left voicemail, Scheduled visit, Sent estimate..." />
        <Textarea label="Notes" className="sm:col-span-2" value={l.notes} onChange={(e) => setL({ ...l, notes: e.target.value })} trailing={<MicButton size="sm" onTranscript={(t) => setL((x) => ({ ...x, notes: `${x.notes} ${t}`.trim() }))} />} />
      </div>
    </Modal>
  )
}
