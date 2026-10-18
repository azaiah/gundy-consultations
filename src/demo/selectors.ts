import type { DemoState, Opportunity, Contact, Project, Score, ComplianceDoc } from './types'
import { scoreOpportunity } from './lib/scoring'
import { daysUntil } from './lib/dates'

export function activeJobs(state: DemoState): number {
  return state.projects.filter((p) => p.status === 'in_progress' || p.status === 'punch').length
}
export function committedValue(state: DemoState): number {
  return state.projects.filter((p) => p.status === 'in_progress' || p.status === 'punch').reduce((s, p) => s + p.contractValue, 0)
}
export function scoreFor(state: DemoState, opp: Opportunity): Score {
  return scoreOpportunity(opp, state.brain, { activeJobs: activeJobs(state), committedValue: committedValue(state) })
}
export function contactName(c?: Contact): string {
  if (!c) return 'Unknown'
  const n = `${c.firstName} ${c.lastName}`.trim()
  return c.company && c.type !== 'customer' ? `${n} (${c.company})` : n || c.company || 'Unnamed'
}
export function contactById(state: DemoState, id?: string): Contact | undefined {
  return id ? state.contacts.find((c) => c.id === id) : undefined
}
export function projectById(state: DemoState, id?: string): Project | undefined {
  return id ? state.projects.find((p) => p.id === id) : undefined
}
export function projectCost(state: DemoState, projectId: string): number {
  return state.costs.filter((c) => c.projectId === projectId).reduce((s, c) => s + c.amount, 0)
}
export function projectContractWithCOs(state: DemoState, p: Project): number {
  const cos = state.changeOrders.filter((c) => c.projectId === p.id && c.status === 'approved').reduce((s, c) => s + c.costImpact, 0)
  return p.contractValue + cos
}

export type DocAlert = { holder: string; holderId?: string; doc: ComplianceDoc; days: number; level: 'expired' | '7' | '30' | '60' }
export function complianceAlerts(state: DemoState): DocAlert[] {
  const out: DocAlert[] = []
  const check = (holder: string, holderId: string | undefined, docs: ComplianceDoc[]) => {
    for (const d of docs) {
      if (!d.expires) continue
      const days = daysUntil(d.expires) ?? 999
      if (days < 0) out.push({ holder, holderId, doc: d, days, level: 'expired' })
      else if (days <= 7) out.push({ holder, holderId, doc: d, days, level: '7' })
      else if (days <= 30) out.push({ holder, holderId, doc: d, days, level: '30' })
      else if (days <= 60) out.push({ holder, holderId, doc: d, days, level: '60' })
    }
  }
  check(state.brain.name, undefined, state.companyDocs)
  for (const c of state.contacts.filter((c) => c.type === 'sub')) check(c.company ?? contactName(c), c.id, c.compliance)
  return out.sort((a, b) => a.days - b.days)
}

/** A sub is blocked from assignment when a COI or License is expired or missing. */
export function subBlockReason(sub: Contact): string | null {
  const coi = sub.compliance.find((d) => d.kind === 'COI')
  const lic = sub.compliance.find((d) => d.kind === 'License')
  if (!coi) return 'No certificate of insurance on file.'
  if (coi.expires && (daysUntil(coi.expires) ?? 0) < 0) return `Certificate of insurance expired on ${coi.expires}.`
  if (lic && lic.expires && (daysUntil(lic.expires) ?? 0) < 0) return `License ${lic.number ?? ''} expired on ${lic.expires}.`
  return null
}

export function pipelineStats(state: DemoState) {
  const inPipe = state.opportunities.filter((o) => o.status === 'pipeline')
  const won = inPipe.filter((o) => o.stage === 'won')
  const lost = inPipe.filter((o) => o.stage === 'lost')
  const decided = won.length + lost.length
  const bidValue = inPipe.filter((o) => ['submitted', 'won', 'lost'].includes(o.stage ?? '')).reduce((s, o) => s + (o.pipelineAmount ?? o.estValue), 0)
  const wonValue = won.reduce((s, o) => s + (o.pipelineAmount ?? o.estValue), 0)
  const openValue = inPipe.filter((o) => !['won', 'lost'].includes(o.stage ?? '')).reduce((s, o) => s + (o.pipelineAmount ?? o.estValue), 0)
  return { winRate: decided ? Math.round((won.length / decided) * 100) : 0, bidValue, wonValue, openValue, won: won.length, lost: lost.length }
}

export function nextSweep(state: DemoState): Date {
  const pkg = state.settings.packageId
  const d = new Date()
  d.setHours(6, 0, 0, 0)
  const isRunDay = (x: Date) => {
    const dow = x.getDay()
    if (pkg === 'contracts') return dow >= 1 && dow <= 5
    if (pkg === 'growth') return dow === 1 || dow === 3 || dow === 5
    return dow === 1
  }
  if (d.getTime() <= Date.now() || !isRunDay(d)) {
    do {
      d.setDate(d.getDate() + 1)
    } while (!isRunDay(d))
  }
  return d
}
export const cadenceLabel: Record<DemoState['settings']['packageId'], string> = {
  foundation: 'Weekly (Monday)',
  growth: 'Mon / Wed / Fri',
  contracts: 'Daily (Mon to Fri)',
}
