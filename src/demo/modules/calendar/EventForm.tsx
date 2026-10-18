import { useState } from 'react'
import { Trash2, Download } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { Input, Select, Textarea } from '@/components/Field'
import { MicButton } from '@/components/MicButton'
import { WheelTimePicker } from '@/components/WheelTimePicker'
import { useDemo } from '../../store'
import { contactName } from '../../selectors'
import type { CalendarEvent, EventType } from '../../types'
import { uid } from '../../lib/ids'
import { ymd } from '../../lib/dates'
import { buildIcs, downloadIcs } from '../../lib/ics'

export const eventTypeLabels: Record<EventType, string> = { job: 'Job', site_visit: 'Site visit', inspection: 'Inspection', pre_bid: 'Pre-bid meeting', bid_due: 'Bid due', meeting: 'Meeting' }
export const eventTypeColor: Record<EventType, string> = { job: 'bg-blueprint', site_visit: 'bg-survey', inspection: 'bg-success', pre_bid: 'bg-[#6B4EAA]', bid_due: 'bg-danger', meeting: 'bg-steel' }

function hhmm(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function combine(date: string, time: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm).toISOString()
}

export function EventForm({ open, onClose, initial, defaultDate, defaultProjectId }: { open: boolean; onClose: () => void; initial?: CalendarEvent; defaultDate?: string; defaultProjectId?: string }) {
  const { state, upsert, remove } = useDemo()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [type, setType] = useState<EventType>(initial?.type ?? 'site_visit')
  const [date, setDate] = useState(initial ? ymd(initial.start) : defaultDate ?? ymd(new Date()))
  const [start, setStart] = useState(initial ? hhmm(initial.start) : '09:00')
  const [end, setEnd] = useState(initial ? hhmm(initial.end) : '10:00')
  const [allDay, setAllDay] = useState(initial?.allDay ?? false)
  const [projectId, setProjectId] = useState(initial?.projectId ?? defaultProjectId ?? '')
  const [contactId, setContactId] = useState(initial?.contactId ?? '')
  const [opportunityId, setOpportunityId] = useState(initial?.opportunityId ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [picker, setPicker] = useState<'start' | 'end' | null>(null)

  function save() {
    if (!title.trim()) return
    const e: CalendarEvent = { id: initial?.id ?? uid('ev'), title: title.trim(), type, start: combine(date, allDay ? '00:00' : start), end: combine(date, allDay ? '00:00' : end), allDay, projectId: projectId || undefined, contactId: contactId || undefined, opportunityId: opportunityId || undefined, location: location || undefined, notes: notes || undefined }
    upsert('events', e, `${initial ? 'Update' : 'Add'} event ${e.title}`)
    onClose()
  }
  function exportOne() {
    const ics = buildIcs([{ uid: initial?.id ?? uid('ev'), title, start: combine(date, allDay ? '00:00' : start), end: combine(date, allDay ? '00:00' : end), allDay, location, description: notes }])
    downloadIcs(ics, title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'event')
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit event' : 'New event'} footer={
      <>
        {initial && <Button variant="ghost" onClick={() => { remove('events', initial.id, 'Delete event'); onClose() }} icon={<Trash2 size={16} />}>Delete</Button>}
        <Button variant="outline" onClick={exportOne} icon={<Download size={16} />}>Export .ics</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={!title.trim()}>Save</Button>
      </>
    }>
      <div className="space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} trailing={<MicButton size="sm" onTranscript={(t) => setTitle((v) => `${v} ${t}`.trim())} />} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value as EventType)}>{(Object.keys(eventTypeLabels) as EventType[]).map((t) => <option key={t} value={t}>{eventTypeLabels[t]}</option>)}</Select>
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-5 w-5 accent-[#E8590C]" /> All day</label>
        {!allDay && (
          <div className="grid grid-cols-2 gap-3">
            {(['start', 'end'] as const).map((k) => {
              const v = k === 'start' ? start : end
              const [h, m] = v.split(':').map(Number)
              const label = new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
              return (
                <div key={k}>
                  <p className="text-sm font-medium mb-1">{k === 'start' ? 'Start' : 'End'}</p>
                  <button type="button" onClick={() => setPicker(picker === k ? null : k)} aria-expanded={picker === k} className="w-full rounded-lg border border-line px-3 min-h-[44px] text-left font-mono text-sm hover:border-blueprint">{label}</button>
                </div>
              )
            })}
            {picker && (
              <div className="col-span-2">
                <p className="text-xs text-steel mb-1">Scroll to pick the {picker} time</p>
                <WheelTimePicker value={picker === 'start' ? start : end} onChange={(v) => (picker === 'start' ? setStart(v) : setEnd(v))} />
              </div>
            )}
          </div>
        )}
        <div className="grid sm:grid-cols-3 gap-3">
          <Select label="Project" value={projectId} onChange={(e) => setProjectId(e.target.value)}><option value="">None</option>{state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
          <Select label="Contact" value={contactId} onChange={(e) => setContactId(e.target.value)}><option value="">None</option>{state.contacts.map((c) => <option key={c.id} value={c.id}>{contactName(c)}</option>)}</Select>
          <Select label="Bid or lead" value={opportunityId} onChange={(e) => setOpportunityId(e.target.value)}><option value="">None</option>{state.opportunities.filter((o) => o.status !== 'no_bid').map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}</Select>
        </div>
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Textarea label="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} trailing={<MicButton size="sm" onTranscript={(t) => setNotes((v) => `${v} ${t}`.trim())} />} />
      </div>
    </Modal>
  )
}
