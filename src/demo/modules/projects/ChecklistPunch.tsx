import { useState } from 'react'
import { Plus, Trash2, ListChecks, ClipboardCheck, Camera } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Input, Select } from '@/components/Field'
import { MicButton } from '@/components/MicButton'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import type { Project, PunchItem } from '../../types'
import { uid } from '../../lib/ids'
import { PhotoAttach } from '../shared/PhotoAttach'

export function ChecklistTab({ project }: { project: Project }) {
  const { patch } = useDemo()
  const [text, setText] = useState('')
  const items = project.checklist
  const done = items.filter((i) => i.done).length
  const set = (checklist: Project['checklist'], label = 'Update checklist') => patch('projects', project.id, { checklist }, label)
  return (
    <Card>
      <CardHeader title="Checklist" subtitle={`${done} of ${items.length} complete`} />
      <CardBody>
        <div className="h-1.5 rounded-full bg-line overflow-hidden mb-4"><div className="h-full bg-success" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} /></div>
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { set([...items, { id: uid('ck'), text: text.trim(), done: false }], 'Add checklist item'); setText('') } }} className="flex gap-2 mb-3">
          <Input aria-label="New checklist item" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a checklist item" className="flex-1" trailing={<MicButton size="sm" onTranscript={(t) => setText((v) => `${v} ${t}`.trim())} />} />
          <Button type="submit" icon={<Plus size={16} />}>Add</Button>
        </form>
        {items.length === 0 ? <EmptyState compact icon={ListChecks} title="Empty checklist" text="Permits, inspections, deliveries, milestones. Add the steps that mean done." /> : (
          <ul className="divide-y divide-line">
            {items.map((i) => (
              <li key={i.id} className="py-2 flex items-center gap-3">
                <input type="checkbox" checked={i.done} onChange={(e) => set(items.map((x) => (x.id === i.id ? { ...x, done: e.target.checked } : x)))} className="h-5 w-5 accent-[#E8590C]" aria-label={i.text} />
                <input aria-label="Edit item" value={i.text} onChange={(e) => set(items.map((x) => (x.id === i.id ? { ...x, text: e.target.value } : x)))} className={`flex-1 bg-transparent text-sm min-h-[36px] outline-none focus:bg-concrete rounded px-1 ${i.done ? 'line-through text-steel' : ''}`} />
                <button type="button" onClick={() => set(items.filter((x) => x.id !== i.id), 'Remove checklist item')} className="tap inline-flex items-center justify-center rounded-lg text-steel hover:text-danger" aria-label={`Remove ${i.text}`}><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}

export function PunchListTab({ project, compact = false }: { project: Project; compact?: boolean }) {
  const { state, patch } = useDemo()
  const [text, setText] = useState('')
  const [location, setLocation] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const items = project.punchList
  const open = items.filter((i) => !i.done).length
  const set = (punchList: PunchItem[], label = 'Update punch list') => patch('projects', project.id, { punchList }, label)
  const crew = state.crew.filter((c) => project.crewIds.includes(c.id))
  return (
    <Card>
      <CardHeader title="Punch list" subtitle={`${open} open · ${items.length - open} done`} />
      <CardBody>
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { set([...items, { id: uid('pl'), text: text.trim(), location: location.trim(), done: false, photos: [], createdAt: new Date().toISOString() }], 'Add punch item'); setText(''); setLocation('') } }} className="flex flex-col sm:flex-row gap-2 mb-3">
          <Input aria-label="Punch item" value={text} onChange={(e) => setText(e.target.value)} placeholder="What needs fixing" className="flex-1" trailing={<MicButton size="sm" onTranscript={(t) => setText((v) => `${v} ${t}`.trim())} />} />
          <Input aria-label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room or area" className="sm:w-40" />
          <Button type="submit" icon={<Plus size={16} />}>Add</Button>
        </form>
        {items.length === 0 ? <EmptyState compact icon={ClipboardCheck} title="No punch items" text="Walk the job with the client and add every item with a photo." /> : (
          <ul className="divide-y divide-line">
            {items.map((i) => (
              <li key={i.id} className="py-2.5">
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={i.done} onChange={(e) => set(items.map((x) => (x.id === i.id ? { ...x, done: e.target.checked } : x)))} className="mt-1 h-5 w-5 accent-[#E8590C]" aria-label={i.text} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm break-words ${i.done ? 'line-through text-steel' : ''}`}>{i.text}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {i.location && <Badge tone="neutral">{i.location}</Badge>}
                      {i.photos.length > 0 && <Badge tone="blueprint" mono><Camera size={10} /> {i.photos.length}</Badge>}
                      {!compact && (
                        <Select aria-label="Assign to" value={i.assignedTo ?? ''} onChange={(e) => set(items.map((x) => (x.id === i.id ? { ...x, assignedTo: e.target.value || undefined } : x)))} className="w-40 [&_select]:min-h-[32px] [&_select]:py-1 [&_select]:text-xs">
                          <option value="">Unassigned</option>
                          {crew.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                      )}
                      <button type="button" onClick={() => setExpanded(expanded === i.id ? null : i.id)} className="text-xs text-blueprint underline min-h-[28px]">{expanded === i.id ? 'Hide photos' : 'Photos'}</button>
                    </div>
                    {expanded === i.id && <div className="mt-2"><PhotoAttach compact attachments={i.photos} onChange={(photos) => set(items.map((x) => (x.id === i.id ? { ...x, photos } : x)), 'Update punch photos')} /></div>}
                  </div>
                  <button type="button" onClick={() => set(items.filter((x) => x.id !== i.id), 'Remove punch item')} className="tap inline-flex items-center justify-center rounded-lg text-steel hover:text-danger" aria-label={`Remove ${i.text}`}><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
