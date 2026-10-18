/* ---------- Roles ---------- */
export type Role = 'owner' | 'estimator' | 'pm' | 'office' | 'foreman' | 'sub' | 'client'

/* ---------- Company Brain ---------- */
export type License = { id: string; number: string; classification: string; state: string; expires: string; trade: string }
export type Certification = { id: string; name: string; active: boolean; expires?: string }
export type SetAside = 'SBA 8(a)' | 'HUBZone' | 'WOSB' | 'SDVOSB' | 'State small business' | 'State minority business' | 'DBE'
export type PastProject = { id: string; name: string; value: number; year: number; type: string }

export type CompanyBrain = {
  name: string
  city: string
  state: string
  zip: string
  lat: number
  lng: number
  trades: string[]
  naics: string[]
  licenses: License[]
  bondingSingle: number
  bondingAggregate: number
  insuranceOccurrence: number
  insuranceAggregate: number
  certifications: Certification[]
  setAsides: SetAside[]
  serviceRadiusMiles: number
  counties: string[]
  crewSize: number
  typicalJobMin: number
  typicalJobMax: number
  pastProjects: PastProject[]
  // Workload is derived from projects in progress, but can be overridden here
  workloadOverride?: number
}

/* ---------- Opportunities (bids + leads) ---------- */
export type OpportunityKind = 'bid' | 'lead'
export type BidSource =
  | 'SAM.gov'
  | 'State of Tennessee CPO'
  | 'Metro Nashville Procurement'
  | 'Williamson County'
  | 'Rutherford County'
  | 'Metro Nashville Public Schools'
  | 'MDHA'
  | 'GC Invitation to Bid'
export type LeadSource = 'Metro Codes Permit' | 'Commercial Build-Out' | 'Property Manager' | 'HOA'
export type PipelineStage = 'found' | 'qualified' | 'site_visit' | 'estimating' | 'submitted' | 'won' | 'lost'
export type OppStatus = 'new' | 'reviewing' | 'pipeline' | 'no_bid'

export type ScoreFactor = { name: string; points: number; max: number; note: string }
export type Score = { score: number; factors: ScoreFactor[]; disqualified?: string }

export type Addendum = { id: string; number: number; date: string; summary: string }

export type Opportunity = {
  id: string
  kind: OpportunityKind
  title: string
  owner: string // owner / GC / applicant
  source: BidSource | LeadSource
  sourceUrl?: string
  trade: string
  requiredTrades: string[]
  estValue: number
  dueDate?: string // bid due
  preBidDate?: string
  bondRequired: boolean
  prevailingWage: boolean
  setAside?: SetAside | 'None'
  distanceMiles: number
  county: string
  address?: string
  scopeSummary: string
  whyFits: string[]
  whyNot: string[]
  addenda: Addendum[]
  documents: { id: string; name: string; type: string }[]
  draftResponse?: string
  draftCallScript?: string
  status: OppStatus
  noBidReason?: string
  stage?: PipelineStage
  foundAt: string // ISO
  sweepId?: string
  lastTouchedAt: string
  // permit-specific
  permit?: { number: string; type: string; valuation: number; filedDate: string; applicant: string }
  notes: string
  pipelineAmount?: number
}

/* ---------- Sweeps ---------- */
export type SweepSourceResult = { source: string; result: 'new' | 'nothing' | 'unreadable'; count: number; message: string }
export type Sweep = {
  id: string
  number: number
  startedAt: string
  finishedAt: string
  sources: SweepSourceResult[]
  foundIds: string[]
  cadence: 'weekly' | 'mwf' | 'daily'
  manual?: boolean
}

/* ---------- Outreach ---------- */
export type OutreachStatus = 'draft' | 'approved' | 'sent' | 'replied'
export type Outreach = {
  id: string
  opportunityId: string
  contactId?: string
  channel: 'email' | 'call'
  subject: string
  body: string
  status: OutreachStatus
  createdAt: string
  updatedAt: string
}

/* ---------- Contacts ---------- */
export type ContactType = 'lead' | 'customer' | 'sub'
export type Attachment = { id: string; name: string; dataUrl: string; type: string; createdAt: string; size: number }
export type ContactLog = {
  id: string
  type: 'call' | 'text' | 'email' | 'meeting' | 'site_visit' | 'note'
  at: string
  outcome: string
  notes: string
}
export type Todo = {
  id: string
  title: string
  due?: string
  done: boolean
  contactId?: string
  projectId?: string
  createdAt: string
}
export type ComplianceDoc = {
  id: string
  kind: 'COI' | 'License' | 'Bond' | 'OSHA' | 'EPA RRP' | 'W-9' | 'Other'
  name: string
  number?: string
  issued?: string
  expires?: string
  fileName?: string
  dataUrl?: string
}
export type Contact = {
  id: string
  type: ContactType
  firstName: string
  lastName: string
  company?: string
  phone?: string
  email?: string
  address?: string
  trade?: string // for subs
  tags: string[]
  notesHtml: string
  attachments: Attachment[]
  logs: ContactLog[]
  createdAt: string
  source?: string
  compliance: ComplianceDoc[] // subs
  rating?: number
}

/* ---------- Projects ---------- */
export type ProjectStatus = 'lead' | 'estimating' | 'proposed' | 'in_progress' | 'punch' | 'complete' | 'on_hold'
export type ChecklistItem = { id: string; text: string; done: boolean }
export type PunchItem = { id: string; text: string; location: string; done: boolean; photos: Attachment[]; createdAt: string; assignedTo?: string }
export type EstimateLine = {
  id: string
  section: string
  category: 'Labor' | 'Material' | 'Equipment' | 'Subcontract' | 'Other'
  description: string
  qty: number
  unit: string
  unitCost: number
  markupPct: number
}
export type Estimate = {
  id: string
  projectId: string
  lines: EstimateLine[]
  taxRatePct: number
  contingencyPct: number
  taxApplies: 'materials' | 'all' | 'none'
  updatedAt: string
}
export type Draw = { id: string; label: string; pct: number }
export type Signature = { dataUrl: string; name: string; signedAt: string }
export type Proposal = {
  id: string
  projectId: string
  number: string
  date: string
  scope: string
  inclusions: string[]
  exclusions: string[]
  timeline: string
  draws: Draw[]
  terms: string
  status: 'draft' | 'sent' | 'accepted'
  signature?: Signature
}
export type ChangeOrder = {
  id: string
  projectId: string
  number: number
  description: string
  costImpact: number
  daysImpact: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  signature?: Signature
}
export type DailyLog = {
  id: string
  projectId: string
  date: string
  createdAt: string
  author: string
  weather: string
  crewOnSite: string[]
  workDone: string
  deliveries: string
  issues: string
  photos: Attachment[]
  supersedes?: string // id of an earlier entry this one revises (append-only)
}
export type Selection = { id: string; category: string; item: string; status: 'pending' | 'selected' | 'ordered'; choice?: string }
export type CostEntry = { id: string; projectId: string; category: string; description: string; amount: number; date: string; vendor?: string }
export type Project = {
  id: string
  name: string
  customerId: string
  address: string
  status: ProjectStatus
  contractValue: number
  percentComplete: number
  startDate: string
  endDate: string
  description: string
  checklist: ChecklistItem[]
  punchList: PunchItem[]
  selections: Selection[]
  crewIds: string[]
  subIds: string[]
  foremanId?: string
  progressPhotos: Attachment[]
  createdAt: string
  type: 'residential' | 'commercial'
}

/* ---------- Invoices ---------- */
export type InvoiceKind = 'deposit' | 'progress' | 'final' | 'pay_app'
export type SovLine = { id: string; description: string; scheduled: number; previous: number; thisPeriod: number; storedMaterials: number }
export type Invoice = {
  id: string
  projectId: string
  number: string
  kind: InvoiceKind
  date: string
  dueDate: string
  amount: number
  retainagePct: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  paidAt?: string
  lineItems: { id: string; description: string; amount: number }[]
  sov?: SovLine[] // pay app
  periodTo?: string
}

/* ---------- Calendar ---------- */
export type EventType = 'job' | 'site_visit' | 'inspection' | 'pre_bid' | 'bid_due' | 'meeting'
export type CalendarEvent = {
  id: string
  title: string
  type: EventType
  start: string // ISO
  end: string
  allDay?: boolean
  projectId?: string
  contactId?: string
  opportunityId?: string
  location?: string
  notes?: string
}

/* ---------- Crew ---------- */
export type CrewCert = { id: string; name: string; expires: string }
export type CrewMember = {
  id: string
  name: string
  role: string
  trade: string
  phone: string
  hourlyCost: number
  certifications: CrewCert[]
  availability: Record<string, 'available' | 'off' | 'pto'> // yyyy-mm-dd -> status
}
export type CrewAssignment = { id: string; crewId: string; projectId: string; date: string }

/* ---------- Notes ---------- */
export type Note = { id: string; title: string; bodyHtml: string; pinned: boolean; projectId?: string; contactId?: string; createdAt: string; updatedAt: string }

/* ---------- Company compliance ---------- */
export type CompanyDoc = ComplianceDoc & { holder: 'company' }

/* ---------- Time clock ---------- */
export type ClockEntry = { id: string; crewId: string; projectId: string; inAt: string; outAt?: string; location?: string }

/* ---------- Settings ---------- */
export type PriceBookItem = { id: string; description: string; category: EstimateLine['category']; unit: string; unitCost: number; section: string }
export type Seat = { id: string; name: string; email: string; role: Role; active: boolean }
export type Settings = {
  defaultTaxRatePct: number
  priceBook: PriceBookItem[]
  seats: Seat[]
  notifications: { newFinds: boolean; bidDue: boolean; complianceExpiry: boolean; invoiceOverdue: boolean; weeklyBriefing: boolean }
  sweepSources: Record<string, boolean>
  packageId: 'foundation' | 'growth' | 'contracts'
  simulateOffline: boolean
  tourDone: boolean
  calendarSync: boolean
  profile: { ownerName: string; email: string; phone: string }
  security: { twoFactor: boolean; sessionTimeoutMin: number; shareAnonymizedUsage: boolean }
}

/* ---------- Offline queue ---------- */
export type QueuedSave = { id: string; label: string; createdAt: string; status: 'queued' | 'failed' | 'flushed'; attempts: number; error?: string }

/* ---------- Root state ---------- */
export type DemoState = {
  version: 1
  role: Role
  entered: boolean
  brain: CompanyBrain
  opportunities: Opportunity[]
  sweeps: Sweep[]
  outreach: Outreach[]
  contacts: Contact[]
  todos: Todo[]
  projects: Project[]
  estimates: Estimate[]
  proposals: Proposal[]
  changeOrders: ChangeOrder[]
  dailyLogs: DailyLog[]
  costs: CostEntry[]
  invoices: Invoice[]
  events: CalendarEvent[]
  crew: CrewMember[]
  assignments: CrewAssignment[]
  notes: Note[]
  companyDocs: CompanyDoc[]
  clock: ClockEntry[]
  settings: Settings
  queue: QueuedSave[]
  scratchpad: string
  clientSelectedProjectId?: string
  subSelectedContactId?: string
}
