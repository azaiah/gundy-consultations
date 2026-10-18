import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { Table, sortRows, type Column, type SortState } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { LinkButton } from '@/components/Button'
import { useDemo } from '../../store'
import { scoreFor } from '../../selectors'
import { money0 } from '../../lib/money'
import { fmtDate } from '../../lib/dates'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { ScoreBadge } from '../shared/ScoreBadge'
import { NewBadge } from '../shared/DueBadge'
import { OpportunityDrawer } from '../shared/OpportunityDrawer'
import { SearchBox, FilterSelect } from '../shared/Filters'

export default function Leads() {
  const { state } = useDemo()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [source, setSource] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState<SortState>({ key: 'found', dir: 'desc' })
  const [openId, setOpenId] = useState<string | null>(params.get('open'))
  useEffect(() => {
    const o = params.get('open')
    if (o) {
      setOpenId(o)
      params.delete('open')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const leads = useMemo(() => state.opportunities.filter((o) => o.kind === 'lead'), [state.opportunities])
  const scored = useMemo(() => leads.map((l) => ({ opp: l, score: scoreFor(state, l) })), [leads, state])
  const rows = scored.filter(({ opp }) => {
    if (source !== 'all' && opp.source !== source) return false
    if (status !== 'all' && opp.status !== status) return false
    if (q && !`${opp.title} ${opp.owner} ${opp.address ?? ''} ${opp.permit?.number ?? ''}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })
  type Row = (typeof rows)[number]
  const columns: Column<Row>[] = [
    {
      key: 'title', header: 'Lead', sortValue: (r) => r.opp.title,
      render: (r) => (
        <div className="min-w-[200px]">
          <div className="flex flex-wrap items-center gap-1.5"><span className="font-medium text-ink">{r.opp.title}</span><NewBadge foundAt={r.opp.foundAt} /></div>
          <div className="text-xs text-steel mt-0.5">{r.opp.owner}{r.opp.address ? ` · ${r.opp.address}` : ''}</div>
        </div>
      ),
    },
    { key: 'source', header: 'Source', hideBelow: 'md', sortValue: (r) => r.opp.source, render: (r) => <Badge tone="neutral">{r.opp.source}</Badge> },
    { key: 'permit', header: 'Permit', hideBelow: 'lg', render: (r) => r.opp.permit ? <span className="font-mono text-xs">{r.opp.permit.number}<br /><span className="text-steel">{r.opp.permit.type}</span></span> : <span className="text-xs text-steel">n/a</span> },
    { key: 'value', header: 'Valuation', sortValue: (r) => r.opp.estValue, className: 'text-right', render: (r) => <span className="font-mono">{money0(r.opp.estValue)}</span> },
    { key: 'found', header: 'Found', hideBelow: 'sm', sortValue: (r) => r.opp.foundAt, render: (r) => <span className="text-xs">{fmtDate(r.opp.permit?.filedDate ?? r.opp.foundAt, { month: 'numeric', day: 'numeric' })}</span> },
    { key: 'score', header: 'Fit', sortValue: (r) => (r.score.disqualified ? -1 : r.score.score), render: (r) => <ScoreBadge score={r.score} /> },
    { key: 'status', header: 'Status', hideBelow: 'sm', sortValue: (r) => r.opp.status, render: (r) => <Badge tone={r.opp.status === 'pipeline' ? 'success' : r.opp.status === 'no_bid' ? 'danger' : r.opp.status === 'reviewing' ? 'blueprint' : 'neutral'}>{r.opp.status === 'pipeline' ? `Pipeline · ${r.opp.stage?.replace('_', ' ')}` : r.opp.status === 'no_bid' ? 'Passed' : r.opp.status}</Badge> },
  ]
  const open = openId ? state.opportunities.find((o) => o.id === openId) ?? null : null
  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Leads" helpKey="leads" subtitle={`${leads.length} private leads from permits, build-outs, property managers and HOAs`} />
      <div className="flex flex-wrap gap-2 mb-4">
        <SearchBox value={q} onChange={setQ} placeholder="Search leads" className="w-full sm:w-64" />
        <FilterSelect label="Source" value={source} onChange={setSource} options={[{ value: 'all', label: 'All sources' }, { value: 'Metro Codes Permit', label: 'Building permits' }, { value: 'Commercial Build-Out', label: 'Commercial build-outs' }, { value: 'Property Manager', label: 'Property managers' }, { value: 'HOA', label: 'HOAs' }]} />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, { value: 'new', label: 'New' }, { value: 'reviewing', label: 'Reviewing' }, { value: 'pipeline', label: 'In pipeline' }, { value: 'no_bid', label: 'Passed' }]} />
      </div>
      {leads.length === 0 ? (
        <EmptyState icon={FileText} title="No leads yet" text="Run a sweep to pull permits, build-outs, property managers and HOAs in your service area." action={<LinkButton to="/demo/sweeps">Go to Sweeps</LinkButton>} />
      ) : (
        <Table columns={columns} rows={sortRows(rows, columns, sort)} rowKey={(r) => r.opp.id} onRowClick={(r) => setOpenId(r.opp.id)} sort={sort} onSort={setSort} caption="Leads" empty={<span className="text-steel">No leads match these filters.</span>} />
      )}
      <OpportunityDrawer opp={open} onClose={() => setOpenId(null)} />
    </div>
  )
}
