import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Pencil, AlertTriangle, Trash2, Users, HardHat, Calendar as CalIcon } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button, LinkButton } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Tabs } from '@/components/Tabs'
import { Modal } from '@/components/Modal'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import { contactById, contactName, subBlockReason, projectContractWithCOs } from '../../selectors'
import { money, money0 } from '../../lib/money'
import { fmtDate, ymd } from '../../lib/dates'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { ProjectForm, statusLabels } from './ProjectForm'
import { Estimator } from './Estimator'
import { ProposalTab } from './ProposalTab'
import { ChangeOrdersTab } from './ChangeOrdersTab'
import { DailyLogsTab } from './DailyLogsTab'
import { ChecklistTab, PunchListTab } from './ChecklistPunch'
import { CostsTab } from './CostsTab'
import { ProjectInvoices } from '../invoices/ProjectInvoices'
import { ClientView } from '../client/ClientView'
import { PhotoAttach } from '../shared/PhotoAttach'

type Tab = 'overview' | 'checklist' | 'punch' | 'estimate' | 'proposal' | 'cos' | 'logs' | 'schedule' | 'costs' | 'invoices' | 'client'

export default function ProjectDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { state, upsert, patch, remove } = useDemo()
  const nav = useNavigate()
  const p = state.projects.find((x) => x.id === id)
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'overview')
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(false)
  if (!p) return <EmptyState icon={AlertTriangle} title="Project not found" text="It may have been deleted." action={<LinkButton to="/demo/projects">Back to projects</LinkButton>} />
  const customer = contactById(state, p.customerId)
  const value = projectContractWithCOs(state, p)
  const events = state.events.filter((e) => e.projectId === p.id).sort((a, b) => a.start.localeCompare(b.start))
  const subs = state.contacts.filter((c) => c.type === 'sub')
  const crew = state.crew

  return (
    <div>
      <SampleRibbon />
      <Link to="/demo/projects" className="inline-flex items-center gap-1 text-sm text-blueprint min-h-[32px] mb-1"><ArrowLeft size={14} /> Projects</Link>
      <PageHeader title={p.name} helpKey="projects" subtitle={<span className="flex flex-wrap items-center gap-2"><Badge tone={p.status === 'in_progress' ? 'success' : p.status === 'punch' ? 'warning' : p.status === 'complete' ? 'ink' : 'blueprint'}>{statusLabels[p.status]}</Badge><Link to={`/demo/contacts/${p.customerId}`} className="underline">{contactName(customer)}</Link><span className="text-steel">{p.address}</span></span>}
        actions={<><Button variant="outline" onClick={() => setEditing(true)} icon={<Pencil size={16} />}>Edit</Button><Button variant="ghost" onClick={() => setConfirm(true)} icon={<Trash2 size={16} />}>Delete</Button></>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Card className="p-3"><p className="stamp">Contract value</p><p className="font-display text-2xl">{value ? money0(value) : 'TBD'}</p></Card>
        <Card className="p-3"><p className="stamp">Complete</p><p className="font-display text-2xl">{p.percentComplete}%</p><input type="range" min={0} max={100} value={p.percentComplete} onChange={(e) => patch('projects', p.id, { percentComplete: Number(e.target.value) })} aria-label="Percent complete" className="w-full accent-[#E8590C]" /></Card>
        <Card className="p-3"><p className="stamp">Start</p><p className="font-display text-2xl">{fmtDate(p.startDate, { month: 'short', day: 'numeric' })}</p></Card>
        <Card className="p-3"><p className="stamp">End</p><p className="font-display text-2xl">{fmtDate(p.endDate, { month: 'short', day: 'numeric' })}</p></Card>
      </div>

      <Tabs className="mb-4" value={tab} onChange={setTab} items={[
        { id: 'overview', label: 'Overview' }, { id: 'checklist', label: 'Checklist', count: p.checklist.filter((c) => !c.done).length }, { id: 'punch', label: 'Punch list', count: p.punchList.filter((c) => !c.done).length },
        { id: 'estimate', label: 'Estimate' }, { id: 'proposal', label: 'Proposal' }, { id: 'cos', label: 'Change orders', count: state.changeOrders.filter((c) => c.projectId === p.id && c.status === 'pending').length },
        { id: 'logs', label: 'Daily logs' }, { id: 'schedule', label: 'Schedule' }, { id: 'costs', label: 'Costs' }, { id: 'invoices', label: 'Invoices' }, { id: 'client', label: 'Client view' },
      ]} />

      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <Card><CardHeader title="Description" /><CardBody><p className="text-sm text-steel leading-relaxed break-words">{p.description || 'No description yet.'}</p></CardBody></Card>
            <Card><CardHeader title="Progress photos" subtitle="Shown to the client in their portal." /><CardBody><PhotoAttach attachments={p.progressPhotos} onChange={(a) => patch('projects', p.id, { progressPhotos: a }, 'Update progress photos')} /></CardBody></Card>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader title={<span className="inline-flex items-center gap-2"><HardHat size={16} /> Crew</span>} subtitle="Foreman and crew assigned to this job." />
              <CardBody>
                <label className="text-sm font-medium block mb-1" htmlFor="foreman">Foreman</label>
                <select id="foreman" value={p.foremanId ?? ''} onChange={(e) => patch('projects', p.id, { foremanId: e.target.value || undefined }, 'Set foreman')} className="w-full rounded-lg border border-line px-3 py-2 text-sm min-h-[44px] mb-3">
                  <option value="">None</option>
                  {crew.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)}
                </select>
                <div className="flex flex-wrap gap-1.5">
                  {crew.map((c) => {
                    const on = p.crewIds.includes(c.id)
                    return <button key={c.id} type="button" aria-pressed={on} onClick={() => patch('projects', p.id, { crewIds: on ? p.crewIds.filter((x) => x !== c.id) : [...p.crewIds, c.id] }, 'Update crew')} className={`rounded-lg border px-2.5 min-h-[36px] text-xs ${on ? 'border-survey bg-survey-50 text-survey' : 'border-line text-steel'}`}>{c.name}</button>
                  })}
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title={<span className="inline-flex items-center gap-2"><Users size={16} /> Subcontractors</span>} subtitle="Subs with expired paperwork cannot be assigned." />
              <CardBody>
                <ul className="space-y-1.5">
                  {subs.map((s) => {
                    const on = p.subIds.includes(s.id)
                    const block = subBlockReason(s)
                    return (
                      <li key={s.id} className="flex items-center justify-between gap-2">
                        <div className="min-w-0"><p className="text-sm">{s.company ?? contactName(s)}</p><p className="text-xs text-steel">{s.trade}{block ? ` · ${block}` : ''}</p></div>
                        <button type="button" aria-pressed={on} disabled={!!block && !on} onClick={() => patch('projects', p.id, { subIds: on ? p.subIds.filter((x) => x !== s.id) : [...p.subIds, s.id] }, 'Update subs')} className={`rounded-lg border px-2.5 min-h-[36px] text-xs shrink-0 ${on ? 'border-survey bg-survey-50 text-survey' : block ? 'border-line text-steel/50 cursor-not-allowed' : 'border-line text-steel'}`} title={block ?? undefined}>
                          {on ? 'Assigned' : block ? 'Blocked' : 'Assign'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {subs.some((s) => subBlockReason(s)) && <p className="mt-2 text-xs text-danger flex gap-1"><AlertTriangle size={12} className="mt-0.5 shrink-0" /> Blocked subs need a current COI and license in the Compliance vault before they can be assigned.</p>}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
      {tab === 'checklist' && <ChecklistTab project={p} />}
      {tab === 'punch' && <PunchListTab project={p} />}
      {tab === 'estimate' && <Estimator project={p} />}
      {tab === 'proposal' && <ProposalTab project={p} />}
      {tab === 'cos' && <ChangeOrdersTab project={p} />}
      {tab === 'logs' && <DailyLogsTab project={p} author={state.settings.profile.ownerName} />}
      {tab === 'schedule' && (
        <Card>
          <CardHeader title="Schedule" subtitle={`${fmtDate(p.startDate)} to ${fmtDate(p.endDate)}`} action={<LinkButton size="sm" variant="outline" to={`/demo/calendar?project=${p.id}`} icon={<CalIcon size={14} />}>Open calendar</LinkButton>} />
          <CardBody>
            {events.length === 0 ? <p className="text-sm text-steel">No events linked to this project. Add one from the calendar.</p> : (
              <ul className="divide-y divide-line">
                {events.map((e) => (
                  <li key={e.id} className="py-2 flex items-center gap-3 text-sm">
                    <span className={`font-mono text-xs w-20 shrink-0 ${ymd(e.start) === ymd(new Date()) ? 'text-survey font-medium' : 'text-steel'}`}>{fmtDate(e.start, { month: 'short', day: 'numeric' })}</span>
                    <span className="min-w-0 flex-1 break-words">{e.title}</span>
                    <Badge tone="neutral">{e.type.replace('_', ' ')}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}
      {tab === 'costs' && <CostsTab project={p} />}
      {tab === 'invoices' && <ProjectInvoices project={p} />}
      {tab === 'client' && <ClientView project={p} preview />}

      {editing && <ProjectForm open={editing} onClose={() => setEditing(false)} initial={p} onSave={(x) => upsert('projects', x, `Update ${x.name}`)} />}
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Delete project?" size="sm" footer={<><Button variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button><Button variant="danger" onClick={() => { remove('projects', p.id, `Delete ${p.name}`); nav('/demo/projects') }}>Delete</Button></>}>
        <p className="text-sm text-steel">This removes {p.name}. Estimates, invoices and logs stay in their lists for the record. Contract value {money(value)}.</p>
      </Modal>
    </div>
  )
}
