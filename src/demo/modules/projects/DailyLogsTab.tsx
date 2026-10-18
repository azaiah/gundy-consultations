import { useState } from 'react'
import { Plus, History, ClipboardList } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Input, Textarea } from '@/components/Field'
import { MicButton } from '@/components/MicButton'
import { Modal } from '@/components/Modal'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import type { DailyLog, Project } from '../../types'
import { uid } from '../../lib/ids'
import { fmtDate, fmtDateTime, ymd } from '../../lib/dates'
import { PhotoAttach } from '../shared/PhotoAttach'

export function DailyLogsTab({ project, author = 'Office' }: { project: Project; author?: string }) {
  const { state, upsert } = useDemo()
  const logs = state.dailyLogs.filter((l) => l.projectId === project.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const superseded = new Set(logs.map((l) => l.supersedes).filter(Boolean))
  const [editing, setEditing] = useState<DailyLog | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const crewNames = state.crew.filter((c) => project.crewIds.includes(c.id)).map((c) => c.name)

  function blank(from?: DailyLog): DailyLog {
    return { id: uid('dl'), projectId: project.id, date: from?.date ?? ymd(new Date()), createdAt: new Date().toISOString(), author, weather: from?.weather ?? '', crewOnSite: from?.crewOnSite ?? crewNames, workDone: from?.workDone ?? '', deliveries: from?.deliveries ?? '', issues: from?.issues ?? '', photos: from?.photos ?? [], supersedes: from?.id }
  }
  function save() {
    if (!editing) return
    upsert('dailyLogs', { ...editing, createdAt: new Date().toISOString() }, editing.supersedes ? 'Revise daily log' : 'Add daily log')
    setEditing(null)
  }
  const visible = showHistory ? logs : logs.filter((l) => !superseded.has(l.id))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Daily logs" subtitle="Append-only. Editing creates a new entry and keeps the original in the history." action={<div className="flex gap-1.5"><Button size="sm" variant="ghost" onClick={() => setShowHistory((v) => !v)} icon={<History size={14} />}>{showHistory ? 'Hide history' : 'Full history'}</Button><Button size="sm" onClick={() => setEditing(blank())} icon={<Plus size={14} />}>Add log</Button></div>} />
        <CardBody>
          {visible.length === 0 ? <EmptyState compact icon={ClipboardList} title="No daily logs" text="Weather, crew, work done, deliveries, issues and photos. One minute at the end of the day." action={<Button size="sm" onClick={() => setEditing(blank())}>Add today's log</Button>} /> : (
            <ol className="relative border-l border-line ml-2 space-y-5">
              {visible.map((l) => (
                <li key={l.id} className={`pl-5 relative ${superseded.has(l.id) ? 'opacity-60' : ''}`}>
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-blueprint" aria-hidden="true" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{fmtDate(l.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span className="font-mono text-xs text-steel">logged {fmtDateTime(l.createdAt)} by {l.author}</span>
                    {l.supersedes && <Badge tone="blueprint" mono>Revision</Badge>}
                    {superseded.has(l.id) && <Badge tone="neutral" mono>Superseded</Badge>}
                    {!superseded.has(l.id) && <button type="button" onClick={() => setEditing(blank(l))} className="ml-auto text-xs text-blueprint underline min-h-[32px]">Revise</button>}
                  </div>
                  <dl className="mt-1 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div><dt className="text-xs text-steel">Weather</dt><dd>{l.weather || 'Not recorded'}</dd></div>
                    <div><dt className="text-xs text-steel">Crew on site</dt><dd>{l.crewOnSite.join(', ') || 'None recorded'}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-xs text-steel">Work done</dt><dd className="break-words">{l.workDone}</dd></div>
                    {l.deliveries && <div><dt className="text-xs text-steel">Deliveries</dt><dd className="break-words">{l.deliveries}</dd></div>}
                    {l.issues && <div><dt className="text-xs text-steel">Issues</dt><dd className="break-words">{l.issues}</dd></div>}
                  </dl>
                  {l.photos.length > 0 && <ul className="mt-2 flex gap-2 flex-wrap">{l.photos.map((p) => <li key={p.id}><img src={p.dataUrl} alt={p.name} className="h-20 w-20 object-cover rounded-lg border border-line" /></li>)}</ul>}
                </li>
              ))}
            </ol>
          )}
        </CardBody>
      </Card>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.supersedes ? 'Revise daily log (new entry)' : 'Daily log'} footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} disabled={!editing?.workDone.trim()}>Save entry</Button></>}>
        {editing && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date" type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
              <Input label="Weather" value={editing.weather} onChange={(e) => setEditing({ ...editing, weather: e.target.value })} placeholder="Sunny, 74 F" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Crew on site</p>
              <div className="flex flex-wrap gap-1.5">
                {state.crew.map((c) => {
                  const on = editing.crewOnSite.includes(c.name)
                  return <button key={c.id} type="button" aria-pressed={on} onClick={() => setEditing({ ...editing, crewOnSite: on ? editing.crewOnSite.filter((n) => n !== c.name) : [...editing.crewOnSite, c.name] })} className={`rounded-lg border px-2.5 min-h-[36px] text-xs ${on ? 'border-survey bg-survey-50 text-survey' : 'border-line text-steel'}`}>{c.name}</button>
                })}
              </div>
            </div>
            <Textarea label="Work done" value={editing.workDone} onChange={(e) => setEditing({ ...editing, workDone: e.target.value })} trailing={<MicButton size="sm" onTranscript={(t) => setEditing((x) => x && { ...x, workDone: `${x.workDone} ${t}`.trim() })} />} />
            <Textarea label="Deliveries" rows={2} value={editing.deliveries} onChange={(e) => setEditing({ ...editing, deliveries: e.target.value })} trailing={<MicButton size="sm" onTranscript={(t) => setEditing((x) => x && { ...x, deliveries: `${x.deliveries} ${t}`.trim() })} />} />
            <Textarea label="Issues" rows={2} value={editing.issues} onChange={(e) => setEditing({ ...editing, issues: e.target.value })} trailing={<MicButton size="sm" onTranscript={(t) => setEditing((x) => x && { ...x, issues: `${x.issues} ${t}`.trim() })} />} />
            <PhotoAttach attachments={editing.photos} onChange={(photos) => setEditing({ ...editing, photos })} />
          </div>
        )}
      </Modal>
    </div>
  )
}
