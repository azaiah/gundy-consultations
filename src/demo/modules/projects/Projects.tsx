import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, FolderKanban } from 'lucide-react'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import { contactById, contactName, projectContractWithCOs } from '../../selectors'
import type { ProjectStatus } from '../../types'
import { money0 } from '../../lib/money'
import { fmtDate } from '../../lib/dates'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { SearchBox, FilterSelect } from '../shared/Filters'
import { ProjectForm, statusLabels } from './ProjectForm'

const tone: Record<ProjectStatus, 'neutral' | 'blueprint' | 'survey' | 'success' | 'warning' | 'danger' | 'ink'> = { lead: 'neutral', estimating: 'blueprint', proposed: 'survey', in_progress: 'success', punch: 'warning', complete: 'ink', on_hold: 'danger' }

export default function Projects() {
  const { state, upsert } = useDemo()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | ProjectStatus>('all')
  const [adding, setAdding] = useState(false)
  const list = useMemo(() => state.projects.filter((p) => (status === 'all' || p.status === status) && (!q || `${p.name} ${p.address} ${contactName(contactById(state, p.customerId))}`.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [state, q, status])

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Projects" helpKey="projects" subtitle={`${state.projects.length} projects · ${state.projects.filter((p) => p.status === 'in_progress' || p.status === 'punch').length} active`} actions={<Button onClick={() => setAdding(true)} icon={<Plus size={16} />}>New project</Button>} />
      <div className="flex flex-wrap gap-2 mb-4">
        <SearchBox value={q} onChange={setQ} placeholder="Search projects" className="w-full sm:w-64" />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, ...(Object.keys(statusLabels) as ProjectStatus[]).map((s) => ({ value: s, label: statusLabels[s] }))]} />
      </div>
      {list.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects" text="Create a project to start the checklist, estimate and schedule." action={<Button onClick={() => setAdding(true)} icon={<Plus size={16} />}>New project</Button>} />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => {
            const customer = contactById(state, p.customerId)
            const value = projectContractWithCOs(state, p)
            return (
              <li key={p.id}>
                <Link to={`/demo/projects/${p.id}`} className="card block p-4 h-full hover:shadow-lift transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink break-words">{p.name}</p>
                      <p className="text-sm text-steel break-words">{contactName(customer)}</p>
                      <p className="text-xs text-steel break-words mt-0.5">{p.address}</p>
                    </div>
                    <Badge tone={tone[p.status]}>{statusLabels[p.status]}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-mono">{value ? money0(value) : 'No contract yet'}</span>
                    <span className="text-xs text-steel">{fmtDate(p.startDate, { month: 'short', day: 'numeric' })} to {fmtDate(p.endDate, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden" role="progressbar" aria-valuenow={p.percentComplete} aria-valuemin={0} aria-valuemax={100} aria-label={`${p.percentComplete}% complete`}>
                    <div className="h-full bg-survey" style={{ width: `${p.percentComplete}%` }} />
                  </div>
                  <p className="text-[11px] text-steel mt-1">{p.percentComplete}% complete · {p.punchList.filter((x) => !x.done).length} open punch items</p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {adding && <ProjectForm open={adding} onClose={() => setAdding(false)} onSave={(p) => { upsert('projects', p, `Create project ${p.name}`); nav(`/demo/projects/${p.id}`) }} />}
    </div>
  )
}
