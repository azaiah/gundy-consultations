import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { Input, Select, Textarea } from '@/components/Field'
import { MicButton } from '@/components/MicButton'
import type { Project, ProjectStatus } from '../../types'
import { useDemo } from '../../store'
import { contactName } from '../../selectors'
import { uid } from '../../lib/ids'
import { ymd, addDays } from '../../lib/dates'
import { askLive, generateProjectDescription } from '../../lib/ai'
import { AiChip } from '../ai/AiChip'

export const statusLabels: Record<ProjectStatus, string> = { lead: 'Lead', estimating: 'Estimating', proposed: 'Proposed', in_progress: 'In progress', punch: 'Punch list', complete: 'Complete', on_hold: 'On hold' }

export function ProjectForm({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (p: Project) => void; initial?: Project }) {
  const { state } = useDemo()
  const customers = state.contacts.filter((c) => c.type === 'customer' || c.type === 'lead')
  const [f, setF] = useState<Partial<Project>>(initial ?? { status: 'estimating', type: 'residential', startDate: ymd(addDays(new Date(), 14)), endDate: ymd(addDays(new Date(), 60)), customerId: customers[0]?.id })
  const [err, setErr] = useState<string | null>(null)
  const [aiLive, setAiLive] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)

  async function autofill() {
    setBusy(true)
    const live = await askLive('You write one-paragraph project descriptions for a construction company.', `Write a 2-sentence description for a ${f.type} project named "${f.name}" at ${f.address}.`)
    setF((x) => ({ ...x, description: live?.text ?? generateProjectDescription(f.name ?? 'Project', f.address ?? 'the site', f.type ?? 'residential') }))
    setAiLive(!!live)
    setBusy(false)
  }
  function save() {
    if (!f.name?.trim() || !f.customerId) {
      setErr('Name and customer are required.')
      return
    }
    const p: Project = {
      id: initial?.id ?? uid('pj'), name: f.name.trim(), customerId: f.customerId, address: f.address?.trim() ?? '', status: f.status ?? 'estimating', contractValue: Number(f.contractValue) || 0, percentComplete: Number(f.percentComplete) || 0,
      startDate: f.startDate ?? ymd(new Date()), endDate: f.endDate ?? ymd(new Date()), description: f.description ?? '', type: f.type ?? 'residential',
      checklist: initial?.checklist ?? [], punchList: initial?.punchList ?? [], selections: initial?.selections ?? [], crewIds: initial?.crewIds ?? [], subIds: initial?.subIds ?? [], foremanId: initial?.foremanId, progressPhotos: initial?.progressPhotos ?? [], createdAt: initial?.createdAt ?? new Date().toISOString(),
    }
    onSave(p)
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit project' : 'New project'} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}>Save</Button></>}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Input label="Project name" className="sm:col-span-2" value={f.name ?? ''} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Select label="Customer" value={f.customerId ?? ''} onChange={(e) => setF({ ...f, customerId: e.target.value })}>
          <option value="">Select</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{contactName(c)}</option>)}
        </Select>
        <Select label="Type" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as Project['type'] })}><option value="residential">Residential</option><option value="commercial">Commercial</option></Select>
        <Input label="Address" className="sm:col-span-2" value={f.address ?? ''} onChange={(e) => setF({ ...f, address: e.target.value })} />
        <Select label="Status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as ProjectStatus })}>{(Object.keys(statusLabels) as ProjectStatus[]).map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}</Select>
        <Input label="Contract value ($)" type="number" min={0} value={f.contractValue ?? 0} onChange={(e) => setF({ ...f, contractValue: Number(e.target.value) })} />
        <Input label="Start" type="date" value={f.startDate ?? ''} onChange={(e) => setF({ ...f, startDate: e.target.value })} />
        <Input label="End" type="date" value={f.endDate ?? ''} onChange={(e) => setF({ ...f, endDate: e.target.value })} />
        <Input label="% complete" type="number" min={0} max={100} value={f.percentComplete ?? 0} onChange={(e) => setF({ ...f, percentComplete: Number(e.target.value) })} />
        <div className="sm:col-span-2">
          <Textarea label="Description" value={f.description ?? ''} onChange={(e) => setF({ ...f, description: e.target.value })} trailing={<MicButton size="sm" onTranscript={(t) => setF((x) => ({ ...x, description: `${x.description ?? ''} ${t}`.trim() }))} />} />
          <div className="mt-1.5 flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={autofill} disabled={busy || !f.name} icon={<Sparkles size={14} />}>{busy ? 'Writing...' : 'Auto-fill'}</Button>
            {aiLive !== null && <AiChip live={aiLive} />}
          </div>
        </div>
      </div>
      {err && <p role="alert" className="text-sm text-danger mt-2">{err}</p>}
    </Modal>
  )
}
