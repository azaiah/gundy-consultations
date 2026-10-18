import { UserCircle } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import { contactById, contactName } from '../../selectors'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { ClientView } from './ClientView'

export default function Client() {
  const { state, set } = useDemo()
  const project = state.projects.find((p) => p.id === state.clientSelectedProjectId) ?? state.projects.find((p) => p.status === 'in_progress') ?? state.projects[0]
  const isClient = state.role === 'client'
  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Client portal" helpKey="client" subtitle={isClient ? `Signed in as ${contactName(contactById(state, project?.customerId))} (demo)` : 'What your homeowner or tenant sees. Pick a project to preview.'}
        actions={!isClient && (
          <select aria-label="Preview as client of project" value={project?.id ?? ''} onChange={(e) => set('clientSelectedProjectId', e.target.value)} className="rounded-lg border border-line bg-paper px-3 py-2 text-sm min-h-[44px]">
            {state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )} />
      {!project ? <EmptyState icon={UserCircle} title="No project to show" text="Create a project and the client portal appears here." /> : <ClientView project={project} />}
    </div>
  )
}
