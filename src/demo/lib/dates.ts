export const DAY = 86_400_000

export function now(): Date {
  return new Date()
}
export function iso(d: Date): string {
  return d.toISOString()
}
export function addDays(d: Date | string, days: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}
export function addHours(d: Date | string, h: number): Date {
  return new Date(new Date(d).getTime() + h * 3_600_000)
}
export function ymd(d: Date | string): string {
  const x = new Date(d)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}
export function daysUntil(d: string | Date | undefined): number | null {
  if (!d) return null
  const target = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? parseYmd(d) : new Date(d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / DAY)
}
export function fmtDate(d: string | Date | undefined, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }): string {
  if (!d) return ''
  const x = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? parseYmd(d) : new Date(d)
  return x.toLocaleDateString('en-US', opts)
}
export function fmtShort(d: string | Date | undefined): string {
  return fmtDate(d, { month: 'numeric', day: 'numeric' })
}
export function fmtTime(d: string | Date): string {
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })
}
export function fmtTime24(d: string | Date): string {
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/New_York' })
}
export function fmtDateTime(d: string | Date): string {
  return `${fmtDate(d)} · ${fmtTime(d)} ET`
}
export function stamp(d: string | Date): string {
  const x = new Date(d)
  const date = x.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', timeZone: 'America/New_York' })
  const time = x.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/New_York' })
  return `${date} · ${time} ET`
}
export function weekdayShort(d: string | Date): string {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/New_York' }).toUpperCase()
}
export function relative(d: string | Date): string {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.round(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  return fmtDate(d)
}
export function isSameDay(a: Date | string, b: Date | string): boolean {
  return ymd(a) === ymd(b)
}
export function startOfWeek(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - x.getDay())
  return x
}
export function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
