import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Landmark } from 'lucide-react'
import { Table, sortRows, type Column, type SortState } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { LinkButton } from '@/components/Button'
import { useDemo } from '../../store'
import { scoreFor } from '../../selectors'
import type { Opportunity } from '../../types'
import { money0 } from '../../lib/money'
import { fmtDate } from '../../lib/dates'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { ScoreBadge } from '../shared/ScoreBadge'
import { DueBadge, NewBadge } from '../shared/DueBadge'
import { OpportunityDrawer } from '../shared/OpportunityDrawer'
import { SearchBox, FilterSelect } from '../shared/Filters'

type StatusFilter = 'all' | 'new' | 'reviewing' | 'pipeline' | 'no_bid'

export default function Bids() {
  const { state } = useDemo()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [source, setSource] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [setAside, setSetAside] = useState('all')
  const [sort, setSort] = useState<SortState>({ key: 'score', dir: 'desc' })
  const [openId, setOpenId] = useState<string | null>(params.get('open'))

  useEffect(() => {
    const o = params.get('open')
    if (o) {
      setOpenId(o)
      params.delete('open')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const bids = useMemo(() => state.opportunities.filter((o) => o.kind === 'bid'), [state.opportunities])
  const scored = useMemo(() => bids.map((b) => ({ opp: b, score: scoreFor(state, b) })), [bids, state])
  const sources = Array.from(new Set(bids.map((b) => b.source)))

  const rows = scored.filter(({ opp }) => {
    if (source !== 'all' && opp.source !== source) return false
    if (status !== 'all' && opp.status !== status) return false
    if (setAside !== 'all' && (opp.setAside ?? 'None') !== setAside) return false
    if (q && !`${opp.title} ${opp.owner} ${opp.trade} ${opp.county}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  type Row = (typeof rows)[number]
  const columns: Column<Row>[] = [
    {
      key: 'title', header: 'Title', sortValue: (r) => r.opp.title,
      render: (r) => (
        <div className="min-w-[200px]">
          <div className="flex flex-wrap items-center gap-1.5"><span className="font-medium text-ink">{r.opp.title}</span><NewBadge foundAt={r.opp.foundAt} /></div>
          <div className="text-xs text-steel mt-0.5">{r.opp.owner}</div>
        </div>
      ),
    },
    { key: 'source', header: 'Source', hideBelow: 'lg', sortValue: (r) => r.opp.source, render: (r) => <span className="text-xs">{r.opp.source}</span> },
    { key: 'trade', header: 'Trade', hideBelow: 'lg', sortValue: (r) => r.opp.trade, render: (r) => <span className="text-xs">{r.opp.requiredTrades.join(', ')}</span> },
    { key: 'value', header: 'Est. value', sortValue: (r) => r.opp.estValue, className: 'text-right', render: (r) => <span className="font-mono">{money0(r.opp.estValue)}</span> },
    { key: 'due', header: 'Bid due', sortValue: (r) => r.opp.dueDate ?? '9999', render: (r) => <DueBadge date={r.opp.dueDate} /> },
    { key: 'prebid', header: 'Pre-bid', hideBelow: 'md', sortValue: (r) => r.opp.preBidDate ?? '9999', render: (r) => <span className="text-xs">{r.opp.preBidDate ? fmtDate(r.opp.preBidDate, { month: 'numeric', day: 'numeric' }) : 'None'}</span> },
    {
      key: 'flags', header: 'Flags', hideBelow: 'md',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.opp.bondRequired && <Badge tone="warning" mono>Bond</Badge>}
          {r.opp.prevailingWage && <Badge tone="warning" mono>DB</Badge>}
          {r.opp.setAside && r.opp.setAside !== 'None' && <Badge tone="blueprint" mono>{r.opp.setAside}</Badge>}
        </div>
      ),
    },
    { key: 'score', header: 'Fit', sortValue: (r) => (r.score.disqualified ? -1 : r.score.score), render: (r) => <ScoreBadge score={r.score} /> },
    {
      key: 'status', header: 'Status', hideBelow: 'sm', sortValue: (r) => r.opp.status,
      render: (r) => <Badge tone={r.opp.status === 'pipeline' ? 'success' : r.opp.status === 'no_bid' ? 'danger' : r.opp.status === 'reviewing' ? 'blueprint' : 'neutral'}>{r.opp.status === 'pipeline' ? `Pipeline · ${r.opp.stage?.replace('_', ' ')}` : r.opp.status === 'no_bid' ? 'No-bid' : r.opp.status}</Badge>,
    },
  ]

  const open: Opportunity | null = openId ? state.opportunities.find((o) => o.id === openId) ?? null : null

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Bids" helpKey="bids" subtitle={`${bids.length} public bids and GC invitations · ${scored.filter((s) => !s.score.disqualified && s.score.score >= 70).length} rated Go`} />
      <div className="flex flex-wrap gap-2 mb-4">
        <SearchBox value={q} onChange={setQ} placeholder="Search bids" className="w-full sm:w-64" />
        <FilterSelect label="Source" value={source} onChange={setSource} options={[{ value: 'all', label: 'All sources' }, ...sources.map((s) => ({ value: s, label: s }))]} />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, { value: 'new', label: 'New' }, { value: 'reviewing', label: 'Reviewing' }, { value: 'pipeline', label: 'In pipeline' }, { value: 'no_bid', label: 'No-bid' }]} />
        <FilterSelect label="Set-aside" value={setAside} onChange={setSetAside} options={[{ value: 'all', label: 'Any set-aside' }, { value: 'None', label: 'No set-aside' }, { value: 'State small business', label: 'State small business' }, { value: 'SDVOSB', label: 'SDVOSB' }, { value: 'HUBZone', label: 'HUBZone' }]} />
      </div>
      {bids.length === 0 ? (
        <EmptyState icon={Landmark} title="No bids yet" text="Run a sweep to pull public solicitations and GC invitations that match your Company Brain." action={<LinkButton to="/demo/sweeps">Go to Sweeps</LinkButton>} />
      ) : (
        <Table columns={columns} rows={sortRows(rows, columns, sort)} rowKey={(r) => r.opp.id} onRowClick={(r) => setOpenId(r.opp.id)} sort={sort} onSort={setSort} caption="Bids" empty={<span className="text-steel">No bids match these filters.</span>} />
      )}
      <OpportunityDrawer opp={open} onClose={() => setOpenId(null)} />
    </div>
  )
}
