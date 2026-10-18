import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Download, Smartphone, CalendarDays } from 'lucide-react'
import { Card, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Toggle } from '@/components/Field'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import type { CalendarEvent } from '../../types'
import { ymd, parseYmd, addDays, startOfWeek, monthLabel, fmtTime, fmtDate } from '../../lib/dates'
import { buildIcs, downloadIcs } from '../../lib/ics'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { EventForm, eventTypeColor, eventTypeLabels } from './EventForm'

type View = 'month' | 'week' | 'agenda'

export default function Calendar() {
  const { state, set } = useDemo()
  const [params] = useSearchParams()
  const [view, setView] = useState<View>('month')
  const [cursor, setCursor] = useState(() => new Date())
  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [creating, setCreating] = useState<string | null>(null)
  const projectFilter = params.get('project')

  const events = useMemo(() => state.events.filter((e) => !projectFilter || e.projectId === projectFilter).sort((a, b) => a.start.localeCompare(b.start)), [state.events, projectFilter])
  const byDay = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      const k = ymd(e.start)
      m.set(k, [...(m.get(k) ?? []), e])
    }
    return m
  }, [events])

  const today = ymd(new Date())
  function shift(n: number) {
    const d = new Date(cursor)
    if (view === 'month') d.setMonth(d.getMonth() + n)
    else d.setDate(d.getDate() + n * 7)
    setCursor(d)
  }
  function exportAll() {
    downloadIcs(buildIcs(events.map((e) => ({ uid: e.id, title: e.title, start: e.start, end: e.end, allDay: e.allDay, location: e.location, description: e.notes })), `${state.brain.name} calendar`), 'gundy-portal-calendar')
  }

  const monthGrid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const start = startOfWeek(first)
    return Array.from({ length: 42 }, (_, i) => addDays(start, i))
  }, [cursor])
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i)), [cursor])
  const agenda = useMemo(() => events.filter((e) => new Date(e.start).getTime() >= Date.now() - 86_400_000).slice(0, 40), [events])

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Calendar" helpKey="calendar" subtitle={projectFilter ? `Showing events for ${state.projects.find((p) => p.id === projectFilter)?.name ?? 'project'}` : 'Jobs, site visits, inspections, pre-bids and bid deadlines.'} actions={<><Button variant="outline" onClick={exportAll} icon={<Download size={16} />}>Export .ics</Button><Button onClick={() => setCreating(today)} icon={<Plus size={16} />}>Add event</Button></>} />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="inline-flex rounded-lg border border-line overflow-hidden" role="tablist" aria-label="View">
          {(['month', 'week', 'agenda'] as View[]).map((v) => <button key={v} role="tab" aria-selected={view === v} type="button" onClick={() => setView(v)} className={`px-3 min-h-[40px] text-sm capitalize ${view === v ? 'bg-ink text-white' : 'text-steel hover:bg-concrete'}`}>{v}</button>)}
        </div>
        {view !== 'agenda' && (
          <div className="inline-flex items-center gap-1 ml-auto">
            <button type="button" onClick={() => shift(-1)} className="tap inline-flex items-center justify-center rounded-lg border border-line" aria-label="Previous"><ChevronLeft size={18} /></button>
            <button type="button" onClick={() => setCursor(new Date())} className="px-3 min-h-[44px] text-sm font-medium rounded-lg border border-line">Today</button>
            <button type="button" onClick={() => shift(1)} className="tap inline-flex items-center justify-center rounded-lg border border-line" aria-label="Next"><ChevronRight size={18} /></button>
            <span className="ml-2 font-display uppercase text-xl">{view === 'month' ? monthLabel(cursor) : `Week of ${fmtDate(weekDays[0], { month: 'short', day: 'numeric' })}`}</span>
          </div>
        )}
      </div>

      {view === 'month' && (
        <div className="rounded-xl border border-line bg-paper overflow-hidden">
          <div className="grid grid-cols-7 text-center text-[11px] font-mono uppercase text-steel border-b border-line">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="py-1.5">{d}</div>)}</div>
          <div className="grid grid-cols-7">
            {monthGrid.map((d) => {
              const k = ymd(d)
              const evs = byDay.get(k) ?? []
              const inMonth = d.getMonth() === cursor.getMonth()
              return (
                <div key={k} className={`min-h-[72px] sm:min-h-[104px] border-b border-r border-line p-1 ${inMonth ? '' : 'bg-concrete/50 text-steel'}`}>
                  <button type="button" onClick={() => setCreating(k)} className={`h-7 w-7 rounded-full text-xs font-mono ${k === today ? 'bg-survey text-white' : 'hover:bg-concrete'}`} aria-label={`Add event on ${fmtDate(d)}`}>{d.getDate()}</button>
                  <ul className="mt-0.5 space-y-0.5">
                    {evs.slice(0, 3).map((e) => (
                      <li key={e.id}>
                        <button type="button" onClick={() => setEditing(e)} className={`w-full text-left truncate rounded px-1 py-0.5 text-[10px] sm:text-[11px] text-white ${eventTypeColor[e.type]}`} title={e.title}>{e.title}</button>
                      </li>
                    ))}
                    {evs.length > 3 && <li className="text-[10px] text-steel px-1">+{evs.length - 3} more</li>}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === 'week' && (
        <div className="grid gap-2 sm:grid-cols-7">
          {weekDays.map((d) => {
            const k = ymd(d)
            const evs = byDay.get(k) ?? []
            return (
              <div key={k} className={`rounded-xl border bg-paper p-2 ${k === today ? 'border-survey' : 'border-line'}`}>
                <div className="flex items-center justify-between"><span className="font-mono text-xs uppercase text-steel">{fmtDate(d, { weekday: 'short' })}</span><button type="button" onClick={() => setCreating(k)} className={`h-7 w-7 rounded-full text-xs font-mono ${k === today ? 'bg-survey text-white' : 'hover:bg-concrete'}`} aria-label={`Add event on ${fmtDate(d)}`}>{d.getDate()}</button></div>
                <ul className="mt-1 space-y-1">
                  {evs.length === 0 && <li className="text-[11px] text-steel/70">Free</li>}
                  {evs.map((e) => (
                    <li key={e.id}><button type="button" onClick={() => setEditing(e)} className="w-full text-left rounded-lg border border-line p-1.5 hover:border-blueprint"><span className={`inline-block h-2 w-2 rounded-full mr-1 ${eventTypeColor[e.type]}`} /><span className="text-[11px] font-mono text-steel">{e.allDay ? 'All day' : fmtTime(e.start)}</span><p className="text-xs break-words">{e.title}</p></button></li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      {view === 'agenda' && (
        agenda.length === 0 ? <EmptyState icon={CalendarDays} title="Nothing scheduled" text="Add a site visit, inspection or bid deadline." action={<Button onClick={() => setCreating(today)}>Add event</Button>} /> : (
          <ul className="space-y-2">
            {agenda.map((e) => (
              <li key={e.id}>
                <button type="button" onClick={() => setEditing(e)} className="card w-full text-left p-3 flex items-center gap-3 hover:border-blueprint">
                  <span className={`w-1.5 self-stretch rounded-full ${eventTypeColor[e.type]}`} aria-hidden="true" />
                  <span className="font-mono text-xs text-steel w-24 shrink-0">{fmtDate(e.start, { weekday: 'short', month: 'short', day: 'numeric' })}<br />{e.allDay ? 'All day' : fmtTime(e.start)}</span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium break-words">{e.title}</span>{e.location && <span className="text-xs text-steel break-words">{e.location}</span>}</span>
                  <Badge tone="neutral">{eventTypeLabels[e.type]}</Badge>
                </button>
              </li>
            ))}
          </ul>
        )
      )}

      <Card className="mt-5">
        <CardBody className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-blueprint-50 text-blueprint flex items-center justify-center shrink-0"><Smartphone size={22} /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap"><h2 className="font-semibold">Calendar sync</h2><Badge tone={state.settings.calendarSync ? 'success' : 'neutral'} mono>{state.settings.calendarSync ? 'Connected' : 'Not connected'}</Badge></div>
            <p className="text-sm text-steel mt-1">The live app reads and writes your phone's native calendar, so jobs and bid deadlines show up next to everything else. In this demo the toggle only changes the badge; use Export .ics to try a real import.</p>
          </div>
          <Toggle label="Sync with phone calendar" checked={state.settings.calendarSync} onChange={(v) => set('settings', { ...state.settings, calendarSync: v })} />
        </CardBody>
      </Card>

      {editing && <EventForm open onClose={() => setEditing(null)} initial={editing} />}
      {creating && <EventForm open onClose={() => setCreating(null)} defaultDate={creating} defaultProjectId={projectFilter ?? undefined} />}
      <p className="sr-only">{parseYmd(today).toDateString()}</p>
    </div>
  )
}
