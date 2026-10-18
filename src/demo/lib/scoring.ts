import type { CompanyBrain, Opportunity, Score, ScoreFactor } from '../types'

/** Minimal shape needed to score, so tests can pass plain objects. */
export type ScorableOpportunity = Pick<
  Opportunity,
  'kind' | 'requiredTrades' | 'estValue' | 'distanceMiles' | 'bondRequired' | 'setAside' | 'dueDate' | 'county'
>
export type ScorableBrain = Pick<
  CompanyBrain,
  'trades' | 'licenses' | 'bondingSingle' | 'bondingAggregate' | 'setAsides' | 'serviceRadiusMiles' | 'counties' | 'typicalJobMin' | 'typicalJobMax' | 'crewSize' | 'workloadOverride'
>

export type ScoreContext = {
  /** Number of jobs currently in progress (workload). */
  activeJobs?: number
  /** Dollar value of open pipeline + in-progress (for aggregate bonding). */
  committedValue?: number
  /** Reference date, defaults to now. */
  today?: Date
}

const norm = (s: string) => s.trim().toLowerCase()

/**
 * Pure go/no-go fit score, 0-100.
 * Disqualifies when a required trade has no matching license/trade, or job size exceeds bonding single limit (bids only when bond required).
 */
export function scoreOpportunity(opp: ScorableOpportunity, brain: ScorableBrain, ctx: ScoreContext = {}): Score {
  const factors: ScoreFactor[] = []
  const today = ctx.today ?? new Date()
  const brainTrades = new Set([...brain.trades.map(norm), ...brain.licenses.map((l) => norm(l.trade))])
  const unexpiredLicenses = brain.licenses.filter((l) => new Date(l.expires).getTime() >= today.getTime())
  const licensedTrades = new Set(unexpiredLicenses.map((l) => norm(l.trade)))

  // 1. Trade match (0-30)
  const required = opp.requiredTrades.length ? opp.requiredTrades : ['General contractor']
  const matched = required.filter((t) => brainTrades.has(norm(t)))
  const licensed = required.filter((t) => licensedTrades.has(norm(t)))
  let disqualified: string | undefined
  if (matched.length === 0) {
    disqualified = `Requires ${required.join(', ')}; none of these trades are in the Company Brain.`
  } else if (opp.kind === 'bid' && licensed.length === 0 && brain.licenses.length > 0) {
    disqualified = `Requires a current license for ${required.join(' or ')}; no unexpired license on file.`
  }
  const tradePts = Math.round((matched.length / required.length) * 30)
  factors.push({
    name: 'Trade match',
    points: tradePts,
    max: 30,
    note: matched.length === required.length ? `All required trades covered (${matched.join(', ')})` : matched.length ? `Covers ${matched.join(', ')}; missing ${required.filter((t) => !matched.includes(t)).join(', ')}` : 'No trade match',
  })

  // 2. Distance (0-15)
  const radius = Math.max(1, brain.serviceRadiusMiles)
  const inCounty = brain.counties.map(norm).includes(norm(opp.county))
  let distPts = 0
  if (inCounty || opp.distanceMiles <= radius * 0.5) distPts = 15
  else if (opp.distanceMiles <= radius) distPts = 10
  else if (opp.distanceMiles <= radius * 1.5) distPts = 4
  factors.push({
    name: 'Distance',
    points: distPts,
    max: 15,
    note: inCounty ? `${opp.county} is a home county (${opp.distanceMiles} mi)` : `${opp.distanceMiles} mi from base, radius ${radius} mi`,
  })

  // 3. Job size vs bonding and typical range (0-20)
  let sizePts = 0
  let sizeNote = ''
  if (opp.bondRequired && opp.estValue > brain.bondingSingle) {
    disqualified = disqualified ?? `Estimated value exceeds single-project bonding limit.`
    sizeNote = `Exceeds single bond limit`
  } else {
    const committed = ctx.committedValue ?? 0
    const aggregateRoom = brain.bondingAggregate - committed
    if (opp.bondRequired && opp.estValue > aggregateRoom) {
      sizePts = 4
      sizeNote = `Fits single limit but would exceed aggregate bonding room`
    } else if (opp.estValue >= brain.typicalJobMin && opp.estValue <= brain.typicalJobMax) {
      sizePts = 20
      sizeNote = `Inside typical job range`
    } else if (opp.estValue < brain.typicalJobMin) {
      sizePts = opp.estValue < brain.typicalJobMin * 0.4 ? 6 : 12
      sizeNote = `Smaller than typical jobs`
    } else {
      sizePts = opp.estValue > brain.typicalJobMax * 2 ? 6 : 12
      sizeNote = `Larger than typical jobs`
    }
  }
  factors.push({ name: 'Job size vs. bonding', points: sizePts, max: 20, note: sizeNote })

  // 4. Set-aside eligibility (0-15)
  let saPts = 15
  let saNote = 'No set-aside restriction'
  if (opp.setAside && opp.setAside !== 'None') {
    if (brain.setAsides.includes(opp.setAside)) {
      saPts = 15
      saNote = `Eligible: holds ${opp.setAside}`
    } else {
      saPts = 0
      saNote = `Restricted to ${opp.setAside}; not held`
      disqualified = disqualified ?? `Set-aside restricted to ${opp.setAside}, which is not in the Company Brain.`
    }
  }
  factors.push({ name: 'Set-aside eligibility', points: saPts, max: 15, note: saNote })

  // 5. Current workload (0-10)
  const active = brain.workloadOverride ?? ctx.activeJobs ?? 0
  const capacity = Math.max(1, Math.round(brain.crewSize / 3))
  const load = active / capacity
  const workPts = load < 0.6 ? 10 : load < 1 ? 7 : load < 1.3 ? 4 : 1
  factors.push({ name: 'Current workload', points: workPts, max: 10, note: `${active} active job${active === 1 ? '' : 's'} against capacity of about ${capacity}` })

  // 6. Deadline (0-10)
  let dlPts = 10
  let dlNote = 'No fixed deadline'
  if (opp.dueDate) {
    const days = Math.round((new Date(opp.dueDate).getTime() - today.getTime()) / 86_400_000)
    if (days < 0) {
      dlPts = 0
      dlNote = 'Deadline has passed'
    } else if (days < 3) {
      dlPts = 2
      dlNote = `Only ${days} day${days === 1 ? '' : 's'} left`
    } else if (days < 7) {
      dlPts = 5
      dlNote = `${days} days left; tight but workable`
    } else if (days < 21) {
      dlPts = 10
      dlNote = `${days} days left`
    } else {
      dlPts = 8
      dlNote = `${days} days left; plenty of time`
    }
  }
  factors.push({ name: 'Deadline', points: dlPts, max: 10, note: dlNote })

  const score = disqualified ? 0 : Math.max(0, Math.min(100, factors.reduce((s, f) => s + f.points, 0)))
  return disqualified ? { score, factors, disqualified } : { score, factors }
}

export function scoreTone(s: Score): 'success' | 'warning' | 'danger' {
  if (s.disqualified || s.score < 45) return 'danger'
  if (s.score < 70) return 'warning'
  return 'success'
}
export function scoreLabel(s: Score): string {
  if (s.disqualified) return 'No-go'
  if (s.score >= 70) return 'Go'
  if (s.score >= 45) return 'Review'
  return 'Long shot'
}
