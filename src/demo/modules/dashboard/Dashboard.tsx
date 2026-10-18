import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Landmark, KanbanSquare, FolderKanban, Receipt, ShieldCheck, ChevronLeft, ChevronRight, Lightbulb, Radar, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { StampLabel } from '@/components/StampLabel'
import { BarChart } from '@/components/charts/BarChart'
import { useDemo } from '../../store'
import { pipelineStats, complianceAlerts, scoreFor } from '../../selectors'
import { money, money0, compactMoney } from '../../lib/money'
import { daysUntil, stamp, fmtDate, ymd, addDays } from '../../lib/dates'
import { tips } from '../../tips'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { NewBadge } from '../shared/DueBadge'

export default function Dashboard() {
  const { state } = useDemo()
  const weekAgo = Date.now() - 7 * 86_400_000
  const newLeads = state.opportunities.filter((o) => o.kind === 'lead' && new Date(o.foundAt).getTime() >= weekAgo).length
  const bidsDue14 = state.opportunities.filter((o) => o.kind === 'bid' && o.status !== 'no_bid' && o.dueDate && (daysUntil(o.dueDate) ?? 99) >= 0 && (daysUntil(o.dueDate) ?? 99) <= 14).length
  const stats = pipelineStats(state)
  const inProgress = state.projects.filter((p) => p.status === 'in_progress' || p.status === 'punch').length
  const outstanding = state.invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
  const expiring30 = complianceAlerts(state).filter((a) => a.days <= 30).length
  const lastSweep = [...state.sweeps].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))[0]
  const lastFinds = lastSweep ? lastSweep.foundIds.map((id) => state.opportunities.find((o) => o.id === id)).filter(Boolean).slice(0, 4) : []

  const dueSoon = useMemo(() => {
    const items: { label: string; date: string; to: string; kind: string }[] = []
    for (const o of state.opportunities) {
      if (o.kind === 'bid' && o.dueDate && o.status !== 'no_bid') {
        const d = daysUntil(o.dueDate) ?? 99
        if (d >= 0 && d <= 14) items.push({ label: o.title, date: o.dueDate, to: `/demo/bids?open=${o.id}`, kind: 'Bid due' })
      }
    }
    for (const t of state.todos) if (!t.done && t.due && (daysUntil(t.due) ?? 99) <= 7) items.push({ label: t.title, date: t.due, to: '/demo/notes', kind: 'To-do' })
    for (const i of state.invoices) if (i.status !== 'paid' && i.status !== 'draft' && (daysUntil(i.dueDate) ?? 99) <= 7) items.push({ label: `Invoice ${i.number}`, date: i.dueDate, to: '/demo/invoices', kind: 'Invoice' })
    for (const e of state.events) if (e.type === 'inspection' && (daysUntil(ymd(e.start)) ?? 99) >= 0 && (daysUntil(ymd(e.start)) ?? 99) <= 7) items.push({ label: e.title, date: ymd(e.start), to: '/demo/calendar', kind: 'Inspection' })
    return items.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8)
  }, [state])

  // 6-month revenue (paid invoices) vs cost
  const months = useMemo(() => {
    const out: { label: string; key: string }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      out.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` })
    }
    return out
  }, [])
  const revenue = months.map((m) => state.invoices.filter((i) => i.status === 'paid' && i.paidAt && i.paidAt.slice(0, 7) === m.key).reduce((s, i) => s + i.amount, 0))
  const cost = months.map((m) => state.costs.filter((c) => c.date.slice(0, 7) === m.key).reduce((s, c) => s + c.amount, 0))
  // Fill in plausible history so the chart is not empty for older months (labelled sample)
  const sampleRev = [148_200, 162_900, 121_400, 189_700, 171_300, 0]
  const sampleCost = [112_600, 128_300, 96_800, 144_100, 133_900, 0]
  const revSeries = revenue.map((v, i) => (v > 0 ? v : i < 5 ? sampleRev[i] : v))
  const costSeries = cost.map((v, i) => (v > 0 ? v : i < 5 ? sampleCost[i] : v))

  const [tipIndex, setTipIndex] = useState(() => Math.floor((Date.now() / 86_400_000) % tips.length))

  const kpis = [
    { icon: FileText, label: 'New leads this week', value: String(newLeads), to: '/demo/leads' },
    { icon: Landmark, label: 'Bids due in 14 days', value: String(bidsDue14), to: '/demo/bids' },
    { icon: KanbanSquare, label: 'Pipeline value', value: compactMoney(stats.openValue), to: '/demo/pipeline' },
    { icon: FolderKanban, label: 'Jobs in progress', value: String(inProgress), to: '/demo/projects' },
    { icon: Receipt, label: 'Invoices outstanding', value: compactMoney(outstanding), to: '/demo/invoices' },
    { icon: ShieldCheck, label: 'Compliance expiring in 30 days', value: String(expiring30), to: '/demo/compliance', warn: expiring30 > 0 },
  ]

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Dashboard" helpKey="dashboard" subtitle={`${state.brain.name} · ${fmtDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' })}`} />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <Link key={k.label} to={k.to} className={`card p-3 sm:p-4 hover:shadow-lift transition-shadow ${k.warn ? 'border-warning/50' : ''}`}>
            <div className="flex items-center gap-2 text-steel"><k.icon size={16} /><span className="text-xs">{k.label}</span></div>
            <p className={`font-display text-3xl sm:text-4xl mt-2 ${k.warn ? 'text-warning' : 'text-ink'}`}>{k.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader title="Latest sweep" subtitle={lastSweep ? <StampLabel tone="accent"><Radar size={12} /> Sweep #{lastSweep.number} · {stamp(lastSweep.finishedAt)}</StampLabel> : 'No sweeps yet'} action={<Link to="/demo/sweeps" className="text-sm font-semibold text-blueprint inline-flex items-center gap-1 min-h-[32px]">All sweeps <ArrowRight size={14} /></Link>} />
          <CardBody>
            {lastFinds.length === 0 ? <p className="text-sm text-steel">Nothing found on the last run.</p> : (
              <ul className="divide-y divide-line">
                {lastFinds.map((o) => o && (
                  <li key={o.id} className="py-2.5">
                    <Link to={o.kind === 'bid' ? `/demo/bids?open=${o.id}` : `/demo/leads?open=${o.id}`} className="flex items-center justify-between gap-3 hover:underline">
                      <span className="min-w-0"><span className="flex flex-wrap items-center gap-1.5"><NewBadge foundAt={o.foundAt} /><span className="text-sm font-medium break-words">{o.title}</span></span><span className="text-xs text-steel">{o.kind === 'bid' ? 'Bid' : 'Lead'} · {o.source} · {money0(o.estValue)}</span></span>
                      <Badge tone={scoreFor(state, o).disqualified ? 'danger' : scoreFor(state, o).score >= 70 ? 'success' : 'warning'} mono>{scoreFor(state, o).disqualified ? 'No-go' : scoreFor(state, o).score}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Due soon" subtitle="Bids, to-dos, invoices and inspections" />
          <CardBody>
            {dueSoon.length === 0 ? <p className="text-sm text-steel">Nothing due in the next week.</p> : (
              <ul className="divide-y divide-line">
                {dueSoon.map((d, i) => {
                  const days = daysUntil(d.date) ?? 0
                  return (
                    <li key={i} className="py-2 flex items-center justify-between gap-3 text-sm">
                      <Link to={d.to} className="min-w-0 hover:underline"><span className="block truncate">{d.label}</span><span className="text-xs text-steel">{d.kind}</span></Link>
                      <Badge tone={days < 0 ? 'danger' : days <= 2 ? 'danger' : days <= 7 ? 'warning' : 'neutral'} mono>{days < 0 ? `${Math.abs(days)}d late` : days === 0 ? 'Today' : `${days}d`}</Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader title="Revenue vs. cost, last 6 months" subtitle="Paid invoices against logged costs. Earlier months are sample history." />
          <CardBody>
            <BarChart title="Revenue vs cost by month" categories={months.map((m) => m.label)} series={[{ name: 'Revenue', color: '#1F4E79', values: revSeries }, { name: 'Cost', color: '#E8590C', values: costSeries }]} format={money} />
          </CardBody>
        </Card>
        <Card className="bg-ink text-white border-ink">
          <CardHeader title={<span className="text-white inline-flex items-center gap-2"><Lightbulb size={18} className="text-survey-light" /> Tip of the day</span>} subtitle={<span className="text-white/60">{tipIndex + 1} of {tips.length}</span>} />
          <CardBody>
            <p className="text-white/90 leading-relaxed min-h-[72px]">{tips[tipIndex]}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setTipIndex((i) => (i - 1 + tips.length) % tips.length)} className="tap inline-flex items-center justify-center rounded-lg border border-white/20 hover:bg-white/10" aria-label="Previous tip"><ChevronLeft size={18} /></button>
              <button type="button" onClick={() => setTipIndex((i) => (i + 1) % tips.length)} className="tap inline-flex items-center justify-center rounded-lg border border-white/20 hover:bg-white/10" aria-label="Next tip"><ChevronRight size={18} /></button>
            </div>
          </CardBody>
        </Card>
      </div>
      <p className="mt-4 text-xs text-steel">Next three days: {[0, 1, 2].map((i) => fmtDate(addDays(new Date(), i), { weekday: 'short' })).join(', ')}. Open the Weekly Briefing for the full picture.</p>
    </div>
  )
}
