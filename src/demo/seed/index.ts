import type { DemoState } from '../types'
import { seedBrain, seedCompanyDocs } from './brain'
import { seedContacts, seedTodos } from './contacts'
import { seedOpportunities, seedSweeps, seedOutreach } from './opportunities'
import { seedProjects, seedEstimates, seedProposals, seedChangeOrders, seedDailyLogs, seedCosts, seedInvoices, seedNotes } from './projects'
import { seedEvents, seedCrew, seedAssignments, seedClock, seedSettings } from './calendarCrew'

export function createSeedState(): DemoState {
  return {
    version: 1,
    role: 'owner',
    entered: false,
    brain: seedBrain(),
    opportunities: seedOpportunities(),
    sweeps: seedSweeps(),
    outreach: seedOutreach(),
    contacts: seedContacts(),
    todos: seedTodos(),
    projects: seedProjects(),
    estimates: seedEstimates(),
    proposals: seedProposals(),
    changeOrders: seedChangeOrders(),
    dailyLogs: seedDailyLogs(),
    costs: seedCosts(),
    invoices: seedInvoices(),
    events: seedEvents(),
    crew: seedCrew(),
    assignments: seedAssignments(),
    notes: seedNotes(),
    companyDocs: seedCompanyDocs(),
    clock: seedClock(),
    settings: seedSettings(),
    queue: [],
    scratchpad: '',
    clientSelectedProjectId: 'pj1',
    subSelectedContactId: 'ct_s1',
  }
}
