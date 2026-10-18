import { useMemo, useState } from 'react'
import { Plus, Phone, AlertTriangle, HardHat, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Input, Select } from '@/components/Field'
import { Modal } from '@/components/Modal'
import { Sheet } from '@/components/Sheet'
import { Tabs } from '@/components/Tabs'
import { useDemo } from '../../store'
import type { CrewMember } from '../../types'
import { money } from '../../lib/money'
import { uid } from '../../lib/ids'
import { ymd, addDays, fmtDate, daysUntil } from '../../lib/dates'
import { formatPhone } from '../../lib/vcard'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'

export default function Crew() {
  const { state, upsert, remove, patch } = useDemo()
  const [tab, setTab] = useState<'board' | 'members' | 'availability'>('board')
  const [weekStart, setWeekStart] = useState(() => new Date())
  const [assignFor, setAssignFor] = useState<{ crewId: string; date: string } | null>(null)
  const [editing, setEditing] = useState<Partial<CrewMember> | null>(null)
  const [drag, setDrag] = useState<{ crewId: string } | null>(null)
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).filter((d) => d.getDay() !== 0 && d.getDay() !== 6), [weekStart])
  const activeProjects = state.projects.filter((p) => p.status === 'in_progress' || p.status === 'punch' || p.status === 'proposed')

  function assignment(crewId: string, date: string) {
    return state.assignments.find((a) => a.crewId === crewId && a.date === date)
  }
  function setAssign(crewId: string, date: string, projectId: string | null) {
    const ex = assignment(crewId, date)
    if (ex) remove('assignments', ex.id, 'Unassign crew')
    if (projectId) upsert('assignments', { id: uid('as'), crewId, projectId, date }, 'Assign crew')
    setAssignFor(null)
  }
  function saveMember() {
    if (!editing?.name?.trim()) return
    const m: CrewMember = { id: editing.id ?? uid('cr'), name: editing.name.trim(), role: editing.role ?? 'Carpenter', trade: editing.trade ?? 'General', phone: editing.phone ?? '', hourlyCost: Number(editing.hourlyCost) || 0, certifications: editing.certifications ?? [], availability: editing.availability ?? {} }
    upsert('crew', m, `Save crew member ${m.name}`)
    setEditing(null)
  }

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Crew" helpKey="crew" subtitle={`${state.crew.length} crew members · ${state.crew.reduce((s, c) => s + c.hourlyCost, 0) ? money(state.crew.reduce((s, c) => s + c.hourlyCost, 0)) : ''} per hour fully loaded`} actions={<Button onClick={() => setEditing({ certifications: [] })} icon={<Plus size={16} />}>Add crew member</Button>} />
      <Tabs className="mb-4" value={tab} onChange={setTab} items={[{ id: 'board', label: 'Assignment board' }, { id: 'members', label: 'Members', count: state.crew.length }, { id: 'availability', label: 'Availability' }]} />

      {tab === 'board' && (
        <Card>
          <CardHeader title="Who is where, this week" subtitle="Tap a cell to assign, or drag a name from the left onto a day. Days marked off or PTO are greyed." action={<div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setWeekStart(addDays(weekStart, -7))}>Previous</Button><Button size="sm" variant="outline" onClick={() => setWeekStart(new Date())}>This week</Button><Button size="sm" variant="outline" onClick={() => setWeekStart(addDays(weekStart, 7))}>Next</Button></div>} />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead><tr><th className="text-left py-1 pr-2 text-xs uppercase text-steel">Crew</th>{days.map((d) => <th key={ymd(d)} className={`py-1 px-1 text-xs uppercase ${ymd(d) === ymd(new Date()) ? 'text-survey' : 'text-steel'}`}>{fmtDate(d, { weekday: 'short', day: 'numeric' })}</th>)}</tr></thead>
                <tbody>
                  {state.crew.map((c) => (
                    <tr key={c.id} className="border-t border-line">
                      <td className="py-1.5 pr-2">
                        <div draggable onDragStart={() => setDrag({ crewId: c.id })} onDragEnd={() => setDrag(null)} className="cursor-grab select-none">
                          <p className="font-medium">{c.name}</p><p className="text-xs text-steel">{c.role}</p>
                        </div>
                      </td>
                      {days.map((d) => {
                        const k = ymd(d)
                        const a = assignment(c.id, k)
                        const avail = c.availability[k]
                        const proj = a ? state.projects.find((p) => p.id === a.projectId) : null
                        return (
                          <td key={k} className="py-1 px-1" onDragOver={(e) => { if (drag) e.preventDefault() }} onDrop={(e) => { e.preventDefault(); if (drag) { setAssignFor({ crewId: drag.crewId, date: k }); setDrag(null) } }}>
                            <button type="button" onClick={() => setAssignFor({ crewId: c.id, date: k })} disabled={avail === 'off' || avail === 'pto'} className={`w-full min-h-[44px] rounded-lg border text-xs px-1.5 text-left ${avail ? 'bg-concrete border-line text-steel cursor-not-allowed' : proj ? 'bg-blueprint-50 border-blueprint/30 text-blueprint' : 'border-dashed border-line text-steel/60 hover:border-blueprint'}`} aria-label={`${c.name} on ${fmtDate(d)}: ${avail ? avail : proj ? proj.name : 'unassigned'}`}>
                              {avail ? avail.toUpperCase() : proj ? <span className="line-clamp-2 break-words">{proj.name}</span> : 'Assign'}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {tab === 'members' && (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {state.crew.map((c) => {
            const expired = c.certifications.filter((x) => (daysUntil(x.expires) ?? 0) < 0)
            return (
              <li key={c.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div><p className="font-semibold">{c.name}</p><p className="text-sm text-steel">{c.role} · {c.trade}</p></div>
                  <span className="font-mono text-xs">{money(c.hourlyCost)}/hr</span>
                </div>
                <p className="text-xs text-steel mt-1 flex items-center gap-1"><Phone size={12} /> {formatPhone(c.phone)}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.certifications.length === 0 && <span className="text-xs text-steel">No certifications on file</span>}
                  {c.certifications.map((x) => {
                    const d = daysUntil(x.expires) ?? 0
                    return <Badge key={x.id} tone={d < 0 ? 'danger' : d <= 30 ? 'warning' : 'success'} mono>{x.name} · {d < 0 ? 'expired' : `${d}d`}</Badge>
                  })}
                </div>
                {expired.length > 0 && <p className="text-xs text-danger mt-2 flex gap-1"><AlertTriangle size={12} className="mt-0.5" /> Renew before assigning to a public job.</p>}
                <div className="mt-3 flex gap-1.5"><Button size="sm" variant="outline" onClick={() => setEditing(c)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => remove('crew', c.id, `Remove ${c.name}`)} icon={<Trash2 size={14} />}>Remove</Button></div>
              </li>
            )
          })}
        </ul>
      )}

      {tab === 'availability' && (
        <Card>
          <CardHeader title="Availability, next 14 days" subtitle="Tap a day to cycle: available, off, PTO." />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[720px]">
                <thead><tr><th className="text-left py-1 pr-2 uppercase text-steel">Crew</th>{Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)).map((d) => <th key={ymd(d)} className="py-1 px-0.5 font-mono text-steel">{fmtDate(d, { day: 'numeric' })}</th>)}</tr></thead>
                <tbody>
                  {state.crew.map((c) => (
                    <tr key={c.id} className="border-t border-line">
                      <td className="py-1 pr-2 font-medium">{c.name}</td>
                      {Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)).map((d) => {
                        const k = ymd(d)
                        const v = c.availability[k] ?? 'available'
                        const next = v === 'available' ? 'off' : v === 'off' ? 'pto' : undefined
                        const weekend = d.getDay() === 0 || d.getDay() === 6
                        return (
                          <td key={k} className="py-1 px-0.5">
                            <button type="button" onClick={() => { const availability = { ...c.availability }; if (next) availability[k] = next; else delete availability[k]; patch('crew', c.id, { availability }, 'Update availability') }} className={`w-full min-h-[36px] rounded text-[10px] font-mono ${weekend ? 'opacity-50' : ''} ${v === 'available' ? 'bg-[#E6F3EC] text-success' : v === 'off' ? 'bg-line text-steel' : 'bg-[#FBF2E0] text-warning'}`} aria-label={`${c.name} ${fmtDate(d)}: ${v}`}>{v === 'available' ? 'OK' : v.toUpperCase()}</button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      <Sheet open={!!assignFor} onClose={() => setAssignFor(null)} title={assignFor ? `${state.crew.find((c) => c.id === assignFor.crewId)?.name} on ${fmtDate(assignFor.date, { weekday: 'long', month: 'short', day: 'numeric' })}` : ''}>
        <ul className="space-y-1">
          {activeProjects.map((p) => <li key={p.id}><button type="button" onClick={() => assignFor && setAssign(assignFor.crewId, assignFor.date, p.id)} className="w-full text-left rounded-lg px-3 py-3 text-sm hover:bg-concrete min-h-[44px]"><HardHat size={14} className="inline mr-2 text-blueprint" />{p.name}<span className="block text-xs text-steel ml-6">{p.address}</span></button></li>)}
          <li><button type="button" onClick={() => assignFor && setAssign(assignFor.crewId, assignFor.date, null)} className="w-full text-left rounded-lg px-3 py-3 text-sm text-danger hover:bg-concrete min-h-[44px]">Unassign</button></li>
        </ul>
      </Sheet>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit crew member' : 'Add crew member'} footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveMember}>Save</Button></>}>
        {editing && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Name" value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Input label="Role" value={editing.role ?? ''} onChange={(e) => setEditing({ ...editing, role: e.target.value })} placeholder="Foreman, Carpenter, Laborer" />
            <Select label="Trade" value={editing.trade ?? 'General'} onChange={(e) => setEditing({ ...editing, trade: e.target.value })}>{['General', 'Carpentry', 'Finish carpentry', 'Framing', 'Roofing', 'Painting', 'Tile'].map((t) => <option key={t}>{t}</option>)}</Select>
            <Input label="Phone" type="tel" value={editing.phone ?? ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
            <Input label="Hourly cost ($)" type="number" min={0} value={editing.hourlyCost ?? 0} onChange={(e) => setEditing({ ...editing, hourlyCost: Number(e.target.value) })} />
            <div className="sm:col-span-2">
              <p className="text-sm font-medium mb-1">Certifications</p>
              <ul className="space-y-2">
                {(editing.certifications ?? []).map((x) => (
                  <li key={x.id} className="flex gap-2">
                    <Input aria-label="Certification name" value={x.name} onChange={(e) => setEditing({ ...editing, certifications: editing.certifications!.map((y) => (y.id === x.id ? { ...y, name: e.target.value } : y)) })} className="flex-1" />
                    <Input aria-label="Expires" type="date" value={x.expires} onChange={(e) => setEditing({ ...editing, certifications: editing.certifications!.map((y) => (y.id === x.id ? { ...y, expires: e.target.value } : y)) })} className="w-40" />
                    <button type="button" onClick={() => setEditing({ ...editing, certifications: editing.certifications!.filter((y) => y.id !== x.id) })} className="tap inline-flex items-center justify-center text-steel hover:text-danger" aria-label="Remove certification"><Trash2 size={16} /></button>
                  </li>
                ))}
              </ul>
              <Button size="sm" variant="outline" className="mt-2" icon={<Plus size={14} />} onClick={() => setEditing({ ...editing, certifications: [...(editing.certifications ?? []), { id: uid('cc'), name: 'OSHA 10', expires: ymd(addDays(new Date(), 365)) }] })}>Add certification</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
