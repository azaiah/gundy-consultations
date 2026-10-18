import { describe, it, expect } from 'vitest'
import { money, money0, compactMoney, lineTotal, computeEstimateTotals, round2 } from './money'

describe('money', () => {
  it('formats USD with cents', () => {
    expect(money(1234.5)).toBe('$1,234.50')
    expect(money(0)).toBe('$0.00')
    expect(money(NaN)).toBe('$0.00')
  })
  it('formats without cents', () => {
    expect(money0(1234.5)).toBe('$1,235')
  })
  it('compact formatting', () => {
    expect(compactMoney(950)).toBe('$950')
    expect(compactMoney(12500)).toBe('$12.5k')
    expect(compactMoney(250000)).toBe('$250k')
    expect(compactMoney(2_400_000)).toBe('$2.4M')
  })
  it('rounds to cents', () => {
    expect(round2(1.005)).toBe(1.01)
    expect(round2(2.675)).toBe(2.68)
  })
  it('line totals apply markup', () => {
    expect(lineTotal(10, 25, 20)).toBe(300)
    expect(lineTotal(3, 33.333, 0)).toBe(100)
  })
  it('estimate totals with tax on materials only', () => {
    const t = computeEstimateTotals(
      [
        { section: 'Demo', category: 'Labor', qty: 10, unitCost: 50, markupPct: 10 },
        { section: 'Finishes', category: 'Material', qty: 100, unitCost: 4, markupPct: 25 },
      ],
      9.25,
      5,
      'materials',
    )
    expect(t.subtotal).toBe(1050)
    expect(t.bySection.Demo).toBe(550)
    expect(t.bySection.Finishes).toBe(500)
    expect(t.taxableBase).toBe(500)
    expect(t.tax).toBe(46.25)
    expect(t.contingency).toBe(52.5)
    expect(t.grandTotal).toBe(1148.75)
    expect(t.markupTotal).toBe(150)
  })
  it('estimate totals with no tax', () => {
    const t = computeEstimateTotals([{ section: 'A', category: 'Material', qty: 1, unitCost: 100, markupPct: 0 }], 9.25, 0, 'none')
    expect(t.tax).toBe(0)
    expect(t.grandTotal).toBe(100)
  })
})
