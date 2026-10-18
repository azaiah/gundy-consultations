import {
  LayoutDashboard, Brain, Landmark, FileText, Radar, KanbanSquare, Send, Newspaper, Users, FolderKanban, CalendarDays, HardHat, StickyNote,
  Smartphone, UserCircle, Receipt, PieChart, ShieldCheck, Printer, Sparkles, LifeBuoy, Settings, type LucideIcon, ClipboardCheck,
} from 'lucide-react'
import type { Role } from './types'

export type NavItem = { to: string; label: string; icon: LucideIcon; helpKey: string; roles: Role[]; group: 'main' | 'engine' | 'ops' | 'money' | 'more' }

const all: Role[] = ['owner', 'estimator', 'pm', 'office']

export const navItems: NavItem[] = [
  { to: '/demo', label: 'Dashboard', icon: LayoutDashboard, helpKey: 'dashboard', roles: all, group: 'main' },
  { to: '/demo/brain', label: 'Company Brain', icon: Brain, helpKey: 'brain', roles: ['owner', 'estimator'], group: 'engine' },
  { to: '/demo/bids', label: 'Bids', icon: Landmark, helpKey: 'bids', roles: ['owner', 'estimator', 'pm'], group: 'engine' },
  { to: '/demo/leads', label: 'Leads', icon: FileText, helpKey: 'leads', roles: ['owner', 'estimator', 'office'], group: 'engine' },
  { to: '/demo/sweeps', label: 'Sweeps', icon: Radar, helpKey: 'sweeps', roles: ['owner', 'estimator', 'office'], group: 'engine' },
  { to: '/demo/pipeline', label: 'Pipeline', icon: KanbanSquare, helpKey: 'pipeline', roles: ['owner', 'estimator', 'pm', 'office'], group: 'engine' },
  { to: '/demo/outreach', label: 'Outreach', icon: Send, helpKey: 'outreach', roles: ['owner', 'estimator', 'office'], group: 'engine' },
  { to: '/demo/briefing', label: 'Weekly Briefing', icon: Newspaper, helpKey: 'briefing', roles: ['owner', 'estimator', 'pm', 'office'], group: 'engine' },
  { to: '/demo/contacts', label: 'Contacts', icon: Users, helpKey: 'contacts', roles: all, group: 'ops' },
  { to: '/demo/projects', label: 'Projects', icon: FolderKanban, helpKey: 'projects', roles: all, group: 'ops' },
  { to: '/demo/calendar', label: 'Calendar', icon: CalendarDays, helpKey: 'calendar', roles: [...all, 'foreman'], group: 'ops' },
  { to: '/demo/crew', label: 'Crew', icon: HardHat, helpKey: 'crew', roles: ['owner', 'pm', 'office'], group: 'ops' },
  { to: '/demo/notes', label: 'Notes and To-dos', icon: StickyNote, helpKey: 'notes', roles: all, group: 'ops' },
  { to: '/demo/field', label: 'Field app', icon: Smartphone, helpKey: 'field', roles: ['owner', 'pm', 'foreman'], group: 'ops' },
  { to: '/demo/punch', label: 'Punch list', icon: ClipboardCheck, helpKey: 'field', roles: ['foreman'], group: 'ops' },
  { to: '/demo/client', label: 'Client portal', icon: UserCircle, helpKey: 'client', roles: ['owner', 'pm', 'office', 'client'], group: 'ops' },
  { to: '/demo/invoices', label: 'Invoices', icon: Receipt, helpKey: 'invoices', roles: ['owner', 'pm', 'office'], group: 'money' },
  { to: '/demo/costing', label: 'Job costing', icon: PieChart, helpKey: 'costing', roles: ['owner', 'pm', 'estimator'], group: 'money' },
  { to: '/demo/compliance', label: 'Compliance', icon: ShieldCheck, helpKey: 'compliance', roles: ['owner', 'pm', 'office'], group: 'money' },
  { to: '/demo/docs', label: 'Paperwork', icon: Printer, helpKey: 'docs', roles: ['owner', 'estimator', 'office'], group: 'money' },
  { to: '/demo/ai', label: 'AI assist', icon: Sparkles, helpKey: 'ai', roles: all, group: 'more' },
  { to: '/demo/sub', label: 'My jobs', icon: HardHat, helpKey: 'sub', roles: ['sub'], group: 'main' },
  { to: '/demo/help', label: 'Help Center', icon: LifeBuoy, helpKey: 'help', roles: [...all, 'foreman', 'sub', 'client'], group: 'more' },
  { to: '/demo/settings', label: 'Settings', icon: Settings, helpKey: 'settings', roles: [...all, 'foreman', 'sub', 'client'], group: 'more' },
]

export const roleMeta: Record<Role, { label: string; description: string; home: string }> = {
  owner: { label: 'Owner', description: 'Sees everything: leads, bids, money, crew, settings.', home: '/demo' },
  estimator: { label: 'Estimator', description: 'Bids, leads, Company Brain, estimates and proposals.', home: '/demo/bids' },
  pm: { label: 'Project Manager', description: 'Projects, schedule, crew, invoices and costing.', home: '/demo/projects' },
  office: { label: 'Office', description: 'Contacts, outreach, invoices, compliance and paperwork.', home: '/demo/contacts' },
  foreman: { label: 'Foreman (field view)', description: "Today's jobs, clock in and out, daily logs, punch list.", home: '/demo/field' },
  sub: { label: 'Subcontractor', description: 'Assigned jobs, paperwork uploads and bid invitations.', home: '/demo/sub' },
  client: { label: 'Client (homeowner view)', description: 'Their project only: schedule, photos, approvals, invoices.', home: '/demo/client' },
}

export function navForRole(role: Role): NavItem[] {
  return navItems.filter((n) => n.roles.includes(role))
}
