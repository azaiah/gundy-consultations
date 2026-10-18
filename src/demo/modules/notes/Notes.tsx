import { useMemo, useState } from 'react'
import { Pin, PinOff, Plus, Trash2, StickyNote, Mic } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Tabs } from '@/components/Tabs'
import { Input, Select, Textarea } from '@/components/Field'
import { MicButton, speechSupported } from '@/components/MicButton'
import { RichTextEditor, sanitizeHtml } from '@/components/RichTextEditor'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import { contactById, contactName, projectById } from '../../selectors'
import type { Note } from '../../types'
import { uid } from '../../lib/ids'
import { relative, daysUntil, ymd } from '../../lib/dates'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { SearchBox } from '../shared/Filters'
import { TodoList } from '../shared/TodoList'

type Tab = 'notes' | 'todos' | 'scratch'
type TodoFilter = 'all' | 'today' | 'overdue' | 'upcoming' | 'done'

export default function Notes() {
  const { state, upsert, patch, remove, set } = useDemo()
  const [tab, setTab] = useState<Tab>('notes')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Note | null>(null)
  const [todoFilter, setTodoFilter] = useState<TodoFilter>('all')
  const [interim, setInterim] = useState('')

  const notes = useMemo(() => state.notes.filter((n) => !q || `${n.title} ${n.bodyHtml}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)), [state.notes, q])
  const todos = useMemo(() => {
    const today = ymd(new Date())
    return state.todos.filter((t) => {
      if (todoFilter === 'done') return t.done
      if (t.done) return false
      if (todoFilter === 'today') return t.due === today
      if (todoFilter === 'overdue') return !!t.due && (daysUntil(t.due) ?? 0) < 0
      if (todoFilter === 'upcoming') return !!t.due && (daysUntil(t.due) ?? 0) > 0
      return true
    })
  }, [state.todos, todoFilter])
  const counts = { today: state.todos.filter((t) => !t.done && t.due === ymd(new Date())).length, overdue: state.todos.filter((t) => !t.done && t.due && (daysUntil(t.due) ?? 0) < 0).length }

  function newNote() {
    const n: Note = { id: uid('nt'), title: 'Untitled note', bodyHtml: '', pinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    upsert('notes', n, 'Add note')
    setEditing(n)
  }

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Notes and To-dos" helpKey="notes" subtitle="Global notes, every to-do in one place, and a voice scratchpad." actions={tab === 'notes' ? <Button onClick={newNote} icon={<Plus size={16} />}>New note</Button> : undefined} />
      <Tabs className="mb-4" value={tab} onChange={setTab} items={[{ id: 'notes', label: 'Notes', count: state.notes.length }, { id: 'todos', label: 'To-dos', count: state.todos.filter((t) => !t.done).length }, { id: 'scratch', label: 'Scratchpad' }]} />

      {tab === 'notes' && (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SearchBox value={q} onChange={setQ} placeholder="Search notes" className="mb-3" />
            {notes.length === 0 ? <EmptyState icon={StickyNote} title="No notes" text="Capture pricing, site conditions, client preferences." action={<Button onClick={newNote}>New note</Button>} /> : (
              <ul className="space-y-2">
                {notes.map((n) => (
                  <li key={n.id}>
                    <button type="button" onClick={() => setEditing(n)} className={`card w-full text-left p-3 hover:border-blueprint ${editing?.id === n.id ? 'border-blueprint' : ''}`}>
                      <div className="flex items-center gap-2">{n.pinned && <Pin size={14} className="text-survey" />}<span className="font-medium text-sm break-words flex-1">{n.title}</span><span className="text-[11px] text-steel">{relative(n.updatedAt)}</span></div>
                      <div className="text-xs text-steel mt-1 line-clamp-2 break-words" dangerouslySetInnerHTML={{ __html: sanitizeHtml(n.bodyHtml) }} />
                      <div className="mt-1.5 flex gap-1 flex-wrap">{n.projectId && <Badge tone="blueprint">{projectById(state, n.projectId)?.name}</Badge>}{n.contactId && <Badge tone="neutral">{contactName(contactById(state, n.contactId))}</Badge>}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            {editing && state.notes.some((n) => n.id === editing.id) ? (
              <Card>
                <CardHeader title={<Input aria-label="Note title" value={state.notes.find((n) => n.id === editing.id)?.title ?? ''} onChange={(e) => patch('notes', editing.id, { title: e.target.value, updatedAt: new Date().toISOString() })} className="w-full" />} action={
                  <div className="flex gap-1">
                    <button type="button" onClick={() => patch('notes', editing.id, { pinned: !state.notes.find((n) => n.id === editing.id)?.pinned })} className="tap inline-flex items-center justify-center rounded-lg hover:bg-concrete" aria-label="Pin or unpin">{state.notes.find((n) => n.id === editing.id)?.pinned ? <PinOff size={18} /> : <Pin size={18} />}</button>
                    <button type="button" onClick={() => { remove('notes', editing.id, 'Delete note'); setEditing(null) }} className="tap inline-flex items-center justify-center rounded-lg hover:bg-concrete text-steel hover:text-danger" aria-label="Delete note"><Trash2 size={18} /></button>
                  </div>
                } />
                <CardBody className="space-y-3">
                  <RichTextEditor label="Note body" value={state.notes.find((n) => n.id === editing.id)?.bodyHtml ?? ''} onChange={(html) => patch('notes', editing.id, { bodyHtml: html, updatedAt: new Date().toISOString() })} />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Select label="Tag to project" value={state.notes.find((n) => n.id === editing.id)?.projectId ?? ''} onChange={(e) => patch('notes', editing.id, { projectId: e.target.value || undefined })}><option value="">None</option>{state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
                    <Select label="Tag to contact" value={state.notes.find((n) => n.id === editing.id)?.contactId ?? ''} onChange={(e) => patch('notes', editing.id, { contactId: e.target.value || undefined })}><option value="">None</option>{state.contacts.map((c) => <option key={c.id} value={c.id}>{contactName(c)}</option>)}</Select>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <div className="hidden lg:block"><EmptyState icon={StickyNote} title="Select a note" text="Or create a new one." action={<Button onClick={newNote}>New note</Button>} /></div>
            )}
          </div>
        </div>
      )}

      {tab === 'todos' && (
        <Card>
          <CardHeader title="All to-dos" subtitle="From contacts, projects and here." action={
            <div className="inline-flex rounded-lg border border-line overflow-hidden flex-wrap">
              {([['all', 'All'], ['today', `Today (${counts.today})`], ['overdue', `Overdue (${counts.overdue})`], ['upcoming', 'Upcoming'], ['done', 'Done']] as [TodoFilter, string][]).map(([v, l]) => <button key={v} type="button" onClick={() => setTodoFilter(v)} className={`px-3 min-h-[36px] text-xs ${todoFilter === v ? 'bg-ink text-white' : 'text-steel hover:bg-concrete'}`}>{l}</button>)}
            </div>
          } />
          <CardBody><TodoList todos={todos} /></CardBody>
        </Card>
      )}

      {tab === 'scratch' && (
        <Card>
          <CardHeader title="Scratchpad" subtitle={speechSupported() ? 'Tap the mic and talk. Text appears as you speak; tap again to stop.' : 'Voice input is not supported in this browser (try Chrome, Edge or Safari). You can still type.'} action={<MicButton onTranscript={(t) => set('scratchpad', `${state.scratchpad}${state.scratchpad && !state.scratchpad.endsWith(' ') ? ' ' : ''}${t}`, 'Update scratchpad')} onInterim={setInterim} />} />
          <CardBody>
            <Textarea aria-label="Scratchpad" rows={10} value={state.scratchpad} onChange={(e) => set('scratchpad', e.target.value, 'Update scratchpad')} placeholder="Quick thoughts, measurements, things to remember..." />
            {interim && <p className="mt-2 text-sm text-steel italic flex items-center gap-2"><Mic size={14} className="text-danger animate-pulseDot" /> {interim}</p>}
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { const n: Note = { id: uid('nt'), title: state.scratchpad.slice(0, 40) || 'Scratchpad note', bodyHtml: `<p>${state.scratchpad.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`, pinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; upsert('notes', n, 'Save scratchpad as note'); set('scratchpad', ''); setTab('notes'); setEditing(n) }} disabled={!state.scratchpad.trim()}>Save as note</Button>
              <Button size="sm" variant="ghost" onClick={() => set('scratchpad', '')} disabled={!state.scratchpad}>Clear</Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
