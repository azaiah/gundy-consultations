const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const fmt0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function money(n: number): string {
  return fmt.format(Number.isFinite(n) ? n : 0)
}
export function money0(n: number): string {
  return fmt0.format(Number.isFinite(n) ? n : 0)
}
export function compactMoney(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}k`
  return money0(n)
}
export function pct(n: number, digits = 0): string {
  return `${(Number.isFinite(n) ? n : 0).toFixed(digits)}%`
}
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export type EstimateTotals = {
  bySection: Record<string, number>
  subtotal: number
  markupTotal: number
  taxableBase: number
  tax: number
  contingency: number
  grandTotal: number
}

export function lineTotal(qty: number, unitCost: number, markupPct: number): number {
  return round2(qty * unitCost * (1 + markupPct / 100))
}

export function computeEstimateTotals(
  lines: { section: string; category: string; qty: number; unitCost: number; markupPct: number }[],
  taxRatePct: number,
  contingencyPct: number,
  taxApplies: 'materials' | 'all' | 'none',
): EstimateTotals {
  const bySection: Record<string, number> = {}
  let subtotal = 0
  let markupTotal = 0
  let taxableBase = 0
  for (const l of lines) {
    const base = round2(l.qty * l.unitCost)
    const total = lineTotal(l.qty, l.unitCost, l.markupPct)
    subtotal += total
    markupTotal += total - base
    bySection[l.section] = round2((bySection[l.section] ?? 0) + total)
    if (taxApplies === 'all' || (taxApplies === 'materials' && l.category === 'Material')) taxableBase += total
  }
  subtotal = round2(subtotal)
  const tax = round2(taxableBase * (taxRatePct / 100))
  const contingency = round2(subtotal * (contingencyPct / 100))
  return { bySection, subtotal, markupTotal: round2(markupTotal), taxableBase: round2(taxableBase), tax, contingency, grandTotal: round2(subtotal + tax + contingency) }
}
