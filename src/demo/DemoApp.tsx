import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { DemoProvider, useDemo } from './store'
import { Gate } from './layout/Gate'
import { Shell } from './layout/Shell'
import { navForRole, roleMeta } from './nav'
import { useDocumentMeta } from '@/components/useDocumentMeta'

const Dashboard = lazy(() => import('./modules/dashboard/Dashboard'))
const Brain = lazy(() => import('./modules/brain/Brain'))
const Bids = lazy(() => import('./modules/bids/Bids'))
const Leads = lazy(() => import('./modules/leads/Leads'))
const Sweeps = lazy(() => import('./modules/sweeps/Sweeps'))
const Pipeline = lazy(() => import('./modules/pipeline/Pipeline'))
const Outreach = lazy(() => import('./modules/outreach/Outreach'))
const Briefing = lazy(() => import('./modules/briefing/Briefing'))
const Contacts = lazy(() => import('./modules/contacts/Contacts'))
const ContactDetail = lazy(() => import('./modules/contacts/ContactDetail'))
const ContactImport = lazy(() => import('./modules/contacts/ContactImport'))
const Projects = lazy(() => import('./modules/projects/Projects'))
const ProjectDetail = lazy(() => import('./modules/projects/ProjectDetail'))
const Calendar = lazy(() => import('./modules/calendar/Calendar'))
const Crew = lazy(() => import('./modules/crew/Crew'))
const Notes = lazy(() => import('./modules/notes/Notes'))
const Field = lazy(() => import('./modules/field/Field'))
const Client = lazy(() => import('./modules/client/Client'))
const Invoices = lazy(() => import('./modules/invoices/Invoices'))
const Costing = lazy(() => import('./modules/costing/Costing'))
const Compliance = lazy(() => import('./modules/compliance/Compliance'))
const Docs = lazy(() => import('./modules/docs/Docs'))
const Ai = lazy(() => import('./modules/ai/Ai'))
const Help = lazy(() => import('./modules/help/Help'))
const Settings = lazy(() => import('./modules/settings/Settings'))
const Sub = lazy(() => import('./modules/sub/Sub'))
const PrintRoutes = lazy(() => import('./print/PrintRoutes'))

function ModuleLoading() {
  return (
    <div className="py-20 text-center" role="status" aria-live="polite">
      <div className="mx-auto mb-3 h-1 w-40 overflow-hidden rounded bg-line"><div className="h-full w-1/2 bg-survey animate-shimmer" /></div>
      <p className="stamp">Loading module</p>
    </div>
  )
}

function Guarded() {
  const { state } = useDemo()
  const location = useLocation()
  useDocumentMeta('Demo portal | Gundy Consultations')
  if (!state.entered) return <Gate />
  // Role gating: if the current role cannot see this route, send to its home.
  const allowed = navForRole(state.role)
  const path = location.pathname
  const ok = allowed.some((n) => (n.to === '/demo' ? path === '/demo' : path.startsWith(n.to))) || path.startsWith('/demo/print')
  if (!ok) return <Navigate to={roleMeta[state.role].home} replace />
  if (path.startsWith('/demo/print')) {
    return (
      <Suspense fallback={<ModuleLoading />}>
        <PrintRoutes />
      </Suspense>
    )
  }
  return (
    <Shell>
      <Suspense fallback={<ModuleLoading />}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="brain" element={<Brain />} />
          <Route path="bids" element={<Bids />} />
          <Route path="leads" element={<Leads />} />
          <Route path="sweeps" element={<Sweeps />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="outreach" element={<Outreach />} />
          <Route path="briefing" element={<Briefing />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="contacts/import" element={<ContactImport />} />
          <Route path="contacts/:id" element={<ContactDetail />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="crew" element={<Crew />} />
          <Route path="notes" element={<Notes />} />
          <Route path="field" element={<Field />} />
          <Route path="punch" element={<Field initialTab="punch" />} />
          <Route path="client" element={<Client />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="costing" element={<Costing />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="docs" element={<Docs />} />
          <Route path="ai" element={<Ai />} />
          <Route path="help" element={<Help />} />
          <Route path="settings" element={<Settings />} />
          <Route path="sub" element={<Sub />} />
          <Route path="*" element={<Navigate to="/demo" replace />} />
        </Routes>
      </Suspense>
    </Shell>
  )
}

export default function DemoApp() {
  return (
    <DemoProvider>
      <Guarded />
    </DemoProvider>
  )
}
