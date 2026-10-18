import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { StampLabel } from '@/components/StampLabel'
import { useDemo } from '../../store'
import { scoreFor, complianceAlerts, pipelineStats } from '../../selectors'
import { money0 } from '../../lib/money'
import { daysUntil, fmtDate, stamp, addDays, ymd } from '../../lib/dates'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'

export default function Briefing() {
  const { state } = useDemo()
  const lastSweep = [...state.sweeps].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))[0]
  const weekAgo = Date.now() - 7 * 86_400_000

  const whatsNew = useMemo(() => state.opportunities.filter((o) => new Date(o.foundAt).getTime() >= weekAgo && o.status !== 'no_bid').map((o) => ({ o, s: scoreFor(state, o) })).sort((a, b) => b.s.score - a.s.score), [state, weekAgo])
  const urgent = useMemo(() => {
    const items: { text: string; days: number; to: string }[] = []
    for (const o of state.opportunities) {
      if (o.kind === 'bid' && o.dueDate && o.status !== 'no_bid') {
        const d = daysUntil(o.dueDate) ?? 99
        if (d >= 0 && d <= 7) items.push({ text: `Bid due: ${o.title}`, days: d, to: `/demo/bids?open=${o.id}` })
      }
      if (o.preBidDate) {
        const d = daysUntil(o.preBidDate) ?? 99
        if (d >= 0 && d <= 7) items.push({ text: `Pre-bid: ${o.title}`, days: d, to: `/demo/bids?open=${o.id}` })
      }
    }
    for (const a of complianceAlerts(state)) if (a.days <= 7) items.push({ text: `${a.holder}: ${a.doc.name} ${a.days < 0 ? 'expired' : 'expires'}`, days: a.days, to: '/demo/compliance' })
    for (const i of state.invoices) if (i.status === 'overdue') items.push({ text: `Overdue invoice ${i.number} (${money0(i.amount)})`, days: daysUntil(i.dueDate) ?? 0, to: '/demo/invoices' })
    for (const t of state.todos) if (!t.done && t.due && (daysUntil(t.due) ?? 1) < 0) items.push({ text: `Overdue to-do: ${t.title}`, days: daysUntil(t.due) ?? 0, to: '/demo/notes' })
    return items.sort((a, b) => a.days - b.days)
  }, [state])
  const nextMoves = useMemo(() => {
    const moves: { text: string; to: string }[] = []
    const drafts = state.outreach.filter((o) => o.status === 'draft').length
    if (drafts) moves.push({ text: `Review and approve ${drafts} outreach draft${drafts === 1 ? '' : 's'}.`, to: '/demo/outreach' })
    const stale = state.opportunities.filter((o) => o.status === 'pipeline' && !['won', 'lost'].includes(o.stage ?? '') && Date.now() - new Date(o.lastTouchedAt).getTime() > 7 * 86_400_000)
    if (stale.length) moves.push({ text: `Touch ${stale.length} pipeline card${stale.length === 1 ? '' : 's'} untouched for 7+ days: ${stale.map((s) => s.title).slice(0, 2).join('; ')}${stale.length > 2 ? '...' : ''}.`, to: '/demo/pipeline' })
    const go = whatsNew.filter((x) => !x.s.disqualified && x.s.score >= 70 && x.o.status === 'new')
    if (go.length) moves.push({ text: `Qualify ${go.length} new Go-rated find${go.length === 1 ? '' : 's'} and add to the pipeline.`, to: '/demo/bids' })
    const blocked = state.contacts.filter((c) => c.type === 'sub' && c.compliance.some((d) => d.expires && (daysUntil(d.expires) ?? 0) < 0))
    if (blocked.length) moves.push({ text: `Request renewed paperwork from ${blocked.map((b) => b.company ?? b.lastName).join(', ')}; they are blocked from assignment.`, to: '/demo/compliance' })
    const pending = state.changeOrders.filter((c) => c.status === 'pending').length
    if (pending) moves.push({ text: `Get ${pending} pending change order${pending === 1 ? '' : 's'} signed in the client portal.`, to: '/demo/projects' })
    return moves
  }, [state, whatsNew])

  const calendar = useMemo(() => {
    const days: { date: string; items: { label: string; kind: string }[] }[] = []
    for (let i = 0; i < 14; i++) {
      const d = ymd(addDays(new Date(), i))
      const items: { label: string; kind: string }[] = []
      for (const o of state.opportunities) {
        if (o.status === 'no_bid') continue
        if (o.dueDate === d) items.push({ label: `Bid due: ${o.title}`, kind: 'due' })
        if (o.preBidDate === d) items.push({ label: `Pre-bid: ${o.title}`, kind: 'prebid' })
      }
      for (const e of state.events) if (ymd(e.start) === d && (e.type === 'inspection' || e.type === 'site_visit' || e.type === 'meeting')) items.push({ label: e.title, kind: e.type })
      days.push({ date: d, items })
    }
    return days
  }, [state])
  const stats = pipelineStats(state)

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Weekly Briefing" helpKey="briefing" subtitle="Plain English. Computed live from the boards." actions={<Button variant="outline" onClick={() => window.print()} icon={<Printer size={16} />}>Print</Button>} />
      <div className="print-page space-y-5">
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display uppercase text-2xl">{state.brain.name}</h2>
            <StampLabel>Briefing {stamp(new Date())}</StampLabel>
            {lastSweep && <StampLabel tone="accent">Last sweep #{lastSweep.number} · {stamp(lastSweep.finishedAt)}</StampLabel>}
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            This week the engine found <strong>{whatsNew.length}</strong> new opportunit{whatsNew.length === 1 ? 'y' : 'ies'}, of which <strong>{whatsNew.filter((x) => !x.s.disqualified && x.s.score >= 70).length}</strong> rate Go.
            There are <strong>{urgent.length}</strong> urgent items inside seven days. The pipeline holds <strong>{money0(stats.openValue)}</strong> of open work with a <strong>{stats.winRate}%</strong> win rate on decided bids.
          </p>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="What's new" subtitle="Found in the last 7 days, best fit first" />
            <CardBody>
              {whatsNew.length === 0 ? <p className="text-sm text-steel">Nothing new this week. Run a sweep.</p> : (
                <ul className="divide-y divide-line">
                  {whatsNew.slice(0, 10).map(({ o, s }) => (
                    <li key={o.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                      <Link to={o.kind === 'bid' ? `/demo/bids?open=${o.id}` : `/demo/leads?open=${o.id}`} className="min-w-0 hover:underline"><span className="block truncate">{o.title}</span><span className="text-xs text-steel">{o.kind === 'bid' ? 'Bid' : 'Lead'} · {money0(o.estValue)}</span></Link>
                      <Badge tone={s.disqualified ? 'danger' : s.score >= 70 ? 'success' : s.score >= 45 ? 'warning' : 'danger'} mono>{s.disqualified ? 'No-go' : s.score}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="What's urgent" subtitle="Inside the next seven days" />
            <CardBody>
              {urgent.length === 0 ? <p className="text-sm text-steel">Nothing urgent. Enjoy it.</p> : (
                <ul className="divide-y divide-line">
                  {urgent.map((u, i) => (
                    <li key={i} className="py-2 flex items-center justify-between gap-3 text-sm">
                      <Link to={u.to} className="min-w-0 hover:underline break-words">{u.text}</Link>
                      <Badge tone={u.days < 0 ? 'danger' : u.days <= 3 ? 'danger' : 'warning'} mono>{u.days < 0 ? `${Math.abs(u.days)}d ago` : u.days === 0 ? 'today' : `${u.days}d`}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Next moves" />
          <CardBody>
            {nextMoves.length === 0 ? <p className="text-sm text-steel">All caught up.</p> : (
              <ol className="list-decimal pl-5 space-y-1.5 text-sm">
                {nextMoves.map((m, i) => <li key={i}><Link to={m.to} className="hover:underline">{m.text}</Link></li>)}
              </ol>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Bid calendar, next 14 days" subtitle="Bid deadlines, pre-bids, inspections, site visits and meetings" />
          <CardBody>
            <ol className="grid gap-2 sm:grid-cols-2">
              {calendar.map((d) => (
                <li key={d.date} className={`rounded-lg border p-2.5 ${d.items.length ? 'border-line' : 'border-dashed border-line/70'}`}>
                  <p className="font-mono text-xs text-steel">{fmtDate(d.date, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  {d.items.length === 0 ? <p className="text-xs text-steel/70 mt-1">Nothing scheduled</p> : (
                    <ul className="mt-1 space-y-1">
                      {d.items.map((it, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${it.kind === 'due' ? 'bg-danger' : it.kind === 'prebid' ? 'bg-blueprint' : 'bg-survey'}`} aria-hidden="true" />
                          <span className="break-words">{it.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
