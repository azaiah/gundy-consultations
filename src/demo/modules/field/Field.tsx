import { useMemo, useState } from 'react'
import { Clock, LogIn, LogOut, MapPin, PenLine, ClipboardList, ClipboardCheck, Smartphone } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Tabs } from '@/components/Tabs'
import { Modal } from '@/components/Modal'
import { SignaturePad } from '@/components/SignaturePad'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import { contactById, contactName } from '../../selectors'
import { ymd, fmtTime, fmtDateTime } from '../../lib/dates'
import { uid } from '../../lib/ids'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { DailyLogsTab } from '../projects/DailyLogsTab'
import { PunchListTab } from '../projects/ChecklistPunch'

type Tab = 'today' | 'log' | 'punch' | 'sign'

export default function Field({ initialTab = 'today' }: { initialTab?: string }) {
  const { state, upsert, patch } = useDemo()
  const [tab, setTab] = useState<Tab>((initialTab as Tab) || 'today')
  // The foreman persona: Marcus Vance (cr1) in the seed, or the first crew member
  const me = state.crew.find((c) => c.id === 'cr1') ?? state.crew[0]
  const today = ymd(new Date())
  const todaysAssignments = state.assignments.filter((a) => a.date === today && a.crewId === me?.id)
  const myProjects = useMemo(() => {
    const ids = new Set([...todaysAssignments.map((a) => a.projectId), ...state.projects.filter((p) => p.foremanId === me?.id && (p.status === 'in_progress' || p.status === 'punch')).map((p) => p.id)])
    return state.projects.filter((p) => ids.has(p.id))
  }, [state.projects, todaysAssignments, me])
  const [selected, setSelected] = useState<string>(myProjects[0]?.id ?? state.projects.find((p) => p.status === 'in_progress')?.id ?? '')
  const project = state.projects.find((p) => p.id === selected) ?? myProjects[0]
  const openEntry = state.clock.find((c) => c.crewId === me?.id && !c.outAt)
  const [locMsg, setLocMsg] = useState<string | null>(null)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState<{ name: string; at: string } | null>(null)

  function clockIn(projectId: string) {
    if (!me) return
    const entry = { id: uid('ck'), crewId: me.id, projectId, inAt: new Date().toISOString(), location: 'location not shared' }
    upsert('clock', entry, 'Clock in')
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
          patch('clock', entry.id, { location: loc })
          setLocMsg(`Location recorded: ${loc}`)
        },
        () => setLocMsg('Location not shared. Clock-in recorded without it.'),
        { timeout: 6000 },
      )
    } else setLocMsg('Location not available on this device.')
  }
  function clockOut() {
    if (openEntry) patch('clock', openEntry.id, { outAt: new Date().toISOString() }, 'Clock out')
  }

  if (!me) return <EmptyState icon={Smartphone} title="No crew member" text="Add crew in the Crew tab to use the field app." />

  return (
    <div className="max-w-2xl mx-auto">
      <SampleRibbon />
      <PageHeader title="Field app" helpKey="field" subtitle={`${me.name} · ${me.role} · ${fmtDateTime(new Date())}`} />
      <Tabs className="mb-4" value={tab} onChange={setTab} items={[{ id: 'today', label: 'Today' }, { id: 'log', label: 'Daily log' }, { id: 'punch', label: 'Punch list', count: project?.punchList.filter((x) => !x.done).length }, { id: 'sign', label: 'Signature' }]} />

      {tab === 'today' && (
        <div className="space-y-3">
          <Card className={openEntry ? 'border-success' : ''}>
            <CardBody className="pt-4">
              <div className="flex items-center justify-between gap-3">
                <div><p className="stamp">Time clock</p>{openEntry ? <p className="font-display text-2xl text-success">On the clock since {fmtTime(openEntry.inAt)}</p> : <p className="font-display text-2xl">Not clocked in</p>}{openEntry && <p className="text-xs text-steel flex items-center gap-1"><MapPin size={12} /> {openEntry.location ?? 'location not shared'} · {state.projects.find((p) => p.id === openEntry.projectId)?.name}</p>}</div>
                {openEntry && <Button variant="danger" onClick={clockOut} icon={<LogOut size={16} />}>Clock out</Button>}
              </div>
              {locMsg && <p className="text-xs text-steel mt-2">{locMsg}</p>}
            </CardBody>
          </Card>
          <h2 className="stamp mt-2">Today's jobs</h2>
          {myProjects.length === 0 ? <EmptyState compact icon={Clock} title="Nothing assigned today" text="Ask the office to assign you on the Crew board." /> : myProjects.map((p) => (
            <Card key={p.id} className={`p-4 ${selected === p.id ? 'border-blueprint' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <button type="button" onClick={() => setSelected(p.id)} className="text-left min-w-0 flex-1">
                  <p className="font-semibold break-words">{p.name}</p>
                  <p className="text-sm text-steel break-words">{p.address}</p>
                  <p className="text-xs text-steel">{contactName(contactById(state, p.customerId))} · {p.percentComplete}% complete</p>
                </button>
                {!openEntry && <Button size="sm" onClick={() => clockIn(p.id)} icon={<LogIn size={14} />}>Clock in</Button>}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone="neutral" mono>{p.checklist.filter((c) => !c.done).length} checklist open</Badge>
                <Badge tone={p.punchList.filter((c) => !c.done).length ? 'warning' : 'success'} mono>{p.punchList.filter((c) => !c.done).length} punch open</Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button size="sm" variant="outline" onClick={() => { setSelected(p.id); setTab('log') }} icon={<ClipboardList size={14} />}>Log</Button>
                <Button size="sm" variant="outline" onClick={() => { setSelected(p.id); setTab('punch') }} icon={<ClipboardCheck size={14} />}>Punch</Button>
                <Button size="sm" variant="outline" onClick={() => { setSelected(p.id); setTab('sign') }} icon={<PenLine size={14} />}>Sign</Button>
              </div>
            </Card>
          ))}
          <h2 className="stamp mt-4">Recent clock entries</h2>
          <ul className="card divide-y divide-line">
            {state.clock.filter((c) => c.crewId === me.id).sort((a, b) => b.inAt.localeCompare(a.inAt)).slice(0, 6).map((c) => (
              <li key={c.id} className="px-4 py-2 text-sm flex items-center justify-between gap-2"><span className="min-w-0 truncate">{state.projects.find((p) => p.id === c.projectId)?.name}</span><span className="font-mono text-xs text-steel shrink-0">{fmtTime(c.inAt)} to {c.outAt ? fmtTime(c.outAt) : 'now'}</span></li>
            ))}
            {state.clock.filter((c) => c.crewId === me.id).length === 0 && <li className="px-4 py-3 text-sm text-steel">No entries yet.</li>}
          </ul>
        </div>
      )}

      {tab === 'log' && (project ? <DailyLogsTab project={project} author={`${me.name} (foreman)`} /> : <EmptyState icon={ClipboardList} title="Pick a job" text="Select a job on the Today tab first." />)}
      {tab === 'punch' && (project ? <PunchListTab project={project} compact /> : <EmptyState icon={ClipboardCheck} title="Pick a job" text="Select a job on the Today tab first." />)}
      {tab === 'sign' && (
        <Card>
          <CardHeader title="Client signature" subtitle={project ? `Daily sign-off or change acknowledgment for ${project.name}.` : 'Pick a job first.'} />
          <CardBody>
            {signed ? <div className="rounded-lg border border-success/30 bg-[#E6F3EC] p-3 text-sm text-success">Signed by {signed.name} at {signed.at}. Saved to the project daily log.</div> : <Button onClick={() => setSigning(true)} disabled={!project} icon={<PenLine size={16} />}>Get client signature</Button>}
          </CardBody>
        </Card>
      )}
      <Modal open={signing} onClose={() => setSigning(false)} title="Client sign-off">
        <SignaturePad signerLabel="Client signature" onCancel={() => setSigning(false)} onSave={(dataUrl, name) => {
          if (project) upsert('dailyLogs', { id: uid('dl'), projectId: project.id, date: today, createdAt: new Date().toISOString(), author: `${me.name} (foreman)`, weather: '', crewOnSite: [me.name], workDone: `Client sign-off collected on site from ${name}.`, deliveries: '', issues: '', photos: [{ id: uid('att'), name: 'signature.png', dataUrl, type: 'image/png', createdAt: new Date().toISOString(), size: dataUrl.length }] }, 'Client sign-off')
          setSigned({ name, at: fmtTime(new Date()) })
          setSigning(false)
        }} />
      </Modal>
    </div>
  )
}
