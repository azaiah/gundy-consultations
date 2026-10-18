import { Badge } from '@/components/Badge'
import { daysUntil, fmtDate } from '../../lib/dates'

export function DueBadge({ date, label = 'Due' }: { date?: string; label?: string }) {
  if (!date) return <span className="text-steel text-xs">Open</span>
  const d = daysUntil(date) ?? 0
  const tone = d < 0 ? 'neutral' : d <= 3 ? 'danger' : d <= 7 ? 'warning' : d <= 14 ? 'blueprint' : 'success'
  return (
    <Badge tone={tone} mono>
      {label} {fmtDate(date, { month: 'numeric', day: 'numeric' })} · {d < 0 ? `${Math.abs(d)}d ago` : d === 0 ? 'today' : `${d}d`}
    </Badge>
  )
}

export function NewBadge({ foundAt }: { foundAt: string }) {
  const d = new Date(foundAt)
  const ageDays = (Date.now() - d.getTime()) / 86_400_000
  if (ageDays > 7) return null
  const md = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })
  return (
    <span className="inline-flex items-center rounded-md bg-survey px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white whitespace-nowrap" title={`Found ${md} at ${time} ET`}>
      New · {md}
    </span>
  )
}
