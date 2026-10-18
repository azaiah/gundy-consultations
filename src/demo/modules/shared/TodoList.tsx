import { useState } from 'react'
import { Plus, Trash2, CheckSquare } from 'lucide-react'
import { Button } from '@/components/Button'
import { Input } from '@/components/Field'
import { MicButton } from '@/components/MicButton'
import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import type { Todo } from '../../types'
import { uid } from '../../lib/ids'
import { daysUntil, fmtDate, ymd } from '../../lib/dates'

export function TodoList({ todos, contactId, projectId, showEmpty = true }: { todos: Todo[]; contactId?: string; projectId?: string; showEmpty?: boolean }) {
  const { upsert, patch, remove } = useDemo()
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  function add() {
    if (!title.trim()) return
    upsert('todos', { id: uid('td'), title: title.trim(), due: due || undefined, done: false, contactId, projectId, createdAt: new Date().toISOString() }, `Add to-do ${title}`)
    setTitle('')
    setDue('')
  }
  const sorted = [...todos].sort((a, b) => Number(a.done) - Number(b.done) || (a.due ?? '9999').localeCompare(b.due ?? '9999'))

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input aria-label="New to-do" placeholder="Add a to-do" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add() }} className="flex-1" trailing={<MicButton size="sm" onTranscript={(t) => setTitle((v) => `${v} ${t}`.trim())} />} />
        <Input aria-label="Due date" type="date" value={due} onChange={(e) => setDue(e.target.value)} className="sm:w-44" />
        <Button onClick={add} icon={<Plus size={16} />}>Add</Button>
      </div>
      {sorted.length === 0 ? (showEmpty ? <div className="mt-3"><EmptyState compact icon={CheckSquare} title="No to-dos" text="Add the next step so it does not live in your head." /></div> : null) : (
        <ul className="mt-3 divide-y divide-line">
          {sorted.map((t) => {
            const d = t.due ? daysUntil(t.due) : null
            return (
              <li key={t.id} className="py-2 flex items-start gap-3">
                <input type="checkbox" checked={t.done} onChange={(e) => patch('todos', t.id, { done: e.target.checked }, `${e.target.checked ? 'Complete' : 'Reopen'} to-do`)} className="mt-1 h-5 w-5 accent-[#E8590C]" aria-label={`Mark ${t.title} ${t.done ? 'not done' : 'done'}`} />
                <div className="min-w-0 flex-1">
                  {editId === t.id ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input aria-label="Edit to-do" value={t.title} onChange={(e) => patch('todos', t.id, { title: e.target.value })} className="flex-1" />
                      <Input aria-label="Edit due date" type="date" value={t.due ?? ''} onChange={(e) => patch('todos', t.id, { due: e.target.value || undefined })} className="sm:w-44" />
                      <Button size="sm" variant="outline" onClick={() => setEditId(null)}>Done</Button>
                    </div>
                  ) : (
                    <>
                      <button type="button" onClick={() => setEditId(t.id)} className={`text-left text-sm break-words min-h-[24px] ${t.done ? 'line-through text-steel' : 'text-ink'}`}>{t.title}</button>
                      <div className="mt-0.5 flex flex-wrap gap-1.5">
                        {t.due && <Badge tone={t.done ? 'neutral' : d !== null && d < 0 ? 'danger' : d === 0 ? 'warning' : 'neutral'} mono>{d !== null && d < 0 && !t.done ? `Overdue · ${fmtDate(t.due, { month: 'numeric', day: 'numeric' })}` : t.due === ymd(new Date()) ? 'Today' : fmtDate(t.due, { month: 'short', day: 'numeric' })}</Badge>}
                      </div>
                    </>
                  )}
                </div>
                <button type="button" onClick={() => remove('todos', t.id, 'Delete to-do')} className="tap inline-flex items-center justify-center rounded-lg text-steel hover:text-danger" aria-label={`Delete ${t.title}`}><Trash2 size={16} /></button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
