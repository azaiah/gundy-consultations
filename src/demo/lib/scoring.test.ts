import { describe, it, expect } from 'vitest'
import { scoreOpportunity, type ScorableBrain, type ScorableOpportunity } from './scoring'

const today = new Date('2026-06-01T12:00:00Z')

const brain: ScorableBrain = {
  trades: ['General contractor', 'Carpentry'],
  licenses: [
    { id: 'l1', number: 'TN-1', classification: 'BC-A', state: 'TN', expires: '2027-01-01', trade: 'General contractor' },
    { id: 'l2', number: 'TN-2', classification: 'BC-B', state: 'TN', expires: '2025-01-01', trade: 'Carpentry' }, // expired
  ],
  bondingSingle: 750_000,
  bondingAggregate: 2_000_000,
  setAsides: ['HUBZone'],
  serviceRadiusMiles: 60,
  counties: ['Davidson'],
  typicalJobMin: 50_000,
  typicalJobMax: 600_000,
  crewSize: 9,
}

const base: ScorableOpportunity = {
  kind: 'bid',
  requiredTrades: ['General contractor'],
  estValue: 300_000,
  distanceMiles: 10,
  bondRequired: true,
  setAside: 'None',
  dueDate: '2026-06-15',
  county: 'Davidson',
}

describe('scoreOpportunity', () => {
  it('scores a strong match highly', () => {
    const s = scoreOpportunity(base, brain, { today, activeJobs: 1 })
    expect(s.disqualified).toBeUndefined()
    expect(s.score).toBeGreaterThanOrEqual(85)
    expect(s.factors).toHaveLength(6)
    expect(s.factors.reduce((a, f) => a + f.max, 0)).toBe(100)
  })
  it('disqualifies when no trade matches', () => {
    const s = scoreOpportunity({ ...base, requiredTrades: ['Electrical'] }, brain, { today })
    expect(s.disqualified).toMatch(/Electrical/)
    expect(s.score).toBe(0)
  })
  it('disqualifies a bid whose only matching license is expired', () => {
    const s = scoreOpportunity({ ...base, requiredTrades: ['Carpentry'] }, brain, { today })
    expect(s.disqualified).toMatch(/license/i)
  })
  it('does not require a license for a private lead', () => {
    const s = scoreOpportunity({ ...base, kind: 'lead', requiredTrades: ['Carpentry'], bondRequired: false }, brain, { today })
    expect(s.disqualified).toBeUndefined()
  })
  it('disqualifies when value exceeds single bonding limit', () => {
    const s = scoreOpportunity({ ...base, estValue: 900_000 }, brain, { today })
    expect(s.disqualified).toMatch(/bonding/i)
  })
  it('allows large unbonded private work', () => {
    const s = scoreOpportunity({ ...base, kind: 'lead', estValue: 900_000, bondRequired: false }, brain, { today })
    expect(s.disqualified).toBeUndefined()
  })
  it('disqualifies on a set-aside not held and passes one held', () => {
    expect(scoreOpportunity({ ...base, setAside: 'SDVOSB' }, brain, { today }).disqualified).toMatch(/SDVOSB/)
    expect(scoreOpportunity({ ...base, setAside: 'HUBZone' }, brain, { today }).disqualified).toBeUndefined()
  })
  it('re-scores when bonding changes', () => {
    const before = scoreOpportunity({ ...base, estValue: 700_000 }, brain, { today })
    const after = scoreOpportunity({ ...base, estValue: 700_000 }, { ...brain, bondingSingle: 500_000 }, { today })
    expect(before.disqualified).toBeUndefined()
    expect(after.disqualified).toBeDefined()
  })
  it('penalizes passed deadlines and far distance', () => {
    const s = scoreOpportunity({ ...base, dueDate: '2026-05-01', distanceMiles: 200, county: 'Shelby' }, brain, { today })
    const deadline = s.factors.find((f) => f.name === 'Deadline')!
    const dist = s.factors.find((f) => f.name === 'Distance')!
    expect(deadline.points).toBe(0)
    expect(dist.points).toBe(0)
  })
  it('penalizes heavy workload', () => {
    const light = scoreOpportunity(base, brain, { today, activeJobs: 0 })
    const heavy = scoreOpportunity(base, brain, { today, activeJobs: 6 })
    expect(heavy.score).toBeLessThan(light.score)
  })
})
