import { useMemo, useRef, useState } from 'react'
import { Flag, MoreVertical, KanbanSquare } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { LinkButton } from '@/components/Button'
import { Sheet } from '@/components/Sheet'
import { useDemo } from '../../store'
import { pipelineStats, scoreFor } from '../../selectors'
import type { Opportunity, PipelineStage } from '../../types'
import { money0, compactMoney } from '../../lib/money'
import { daysUntil } from '../../lib/dates'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { OpportunityDrawer } from '../shared/OpportunityDrawer'
import { DueBadge } from '../shared/DueBadge'

const stages: { id: PipelineStage; label: string }[] = [
  { id: 'found', label: 'Found' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'site_visit', label: 'Site Visit / Pre-Bid' },
  { id: 'estimating', label: 'Estimating' },
  { id: 'submitted', label: 'Bid Submitted' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
]

export default function Pipeline() {
  const { state, patch } = useDemo()
  const [openId, setOpenId] = useState<string | null>(null)
  const [moveId, setMoveId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<PipelineStage | null>(null)
  const dragGhost = useRef<{ x: number; y: number } | null>(null)
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null)

  const cards = useMemo(() => state.opportunities.filter((o) => o.status === 'pipeline'), [state.opportunities])
  const stats = pipelineStats(state)

  function move(id: string, stage: PipelineStage) {
    patch('opportunities', id, { stage, lastTouchedAt: new Date().toISOString() }, `Move to ${stage}`)
  }

  // Pointer-event drag and drop
  function onPointerDown(e: React.PointerEvent, id: string) {
    if (e.pointerType === 'touch') return // touch uses Move to menu
    if ((e.target as HTMLElement).closest('button')) return
    setDragId(id)
    dragGhost.current = { x: e.clientX, y: e.clientY }
    setGhostPos({ x: e.clientX, y: e.clientY })
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragId) return
    setGhostPos({ x: e.clientX, y: e.clientY })
    const el = document.elementFromPoint(e.clientX, e.clientY)
    const col = el?.closest<HTMLElement>('[data-stage]')
    setOverStage((col?.dataset.stage as PipelineStage) ?? null)
  }
  function onPointerUp() {
    if (dragId && overStage) move(dragId, overStage)
    else if (dragId && !overStage && ghostPos && dragGhost.current && Math.hypot(ghostPos.x - dragGhost.current.x, ghostPos.y - dragGhost.current.y) < 4) setOpenId(dragId)
    setDragId(null)
    setOverStage(null)
    setGhostPos(null)
  }

  const dragging = dragId ? cards.find((c) => c.id === dragId) : null
  const open = openId ? state.opportunities.find((o) => o.id === openId) ?? null : null
  const moving = moveId ? cards.find((c) => c.id === moveId) ?? null : null

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Pipeline" helpKey="pipeline" subtitle="Drag cards between stages, or use Move to on a phone." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Card className="p-3"><p className="stamp">Win rate</p><p className="font-display text-3xl">{stats.winRate}%</p><p className="text-xs text-steel">{stats.won} won · {stats.lost} lost</p></Card>
        <Card className="p-3"><p className="stamp">Dollars bid</p><p className="font-display text-3xl">{compactMoney(stats.bidValue)}</p><p className="text-xs text-steel">submitted, won or lost</p></Card>
        <Card className="p-3"><p className="stamp">Dollars won</p><p className="font-display text-3xl text-success">{compactMoney(stats.wonValue)}</p><p className="text-xs text-steel">this pipeline</p></Card>
        <Card className="p-3"><p className="stamp">Open value</p><p className="font-display text-3xl">{compactMoney(stats.openValue)}</p><p className="text-xs text-steel">{cards.filter((c) => !['won', 'lost'].includes(c.stage ?? '')).length} active cards</p></Card>
      </div>

      {cards.length === 0 ? (
        <EmptyState icon={KanbanSquare} title="Pipeline is empty" text="Add bids and leads to the pipeline from their detail drawers." action={<LinkButton to="/demo/bids">Open Bids</LinkButton>} />
      ) : (
        <div className="overflow-x-auto -mx-3 sm:-mx-5 px-3 sm:px-5 pb-3" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          <div className="flex gap-3 min-w-max">
            {stages.map((s) => {
              const col = cards.filter((c) => (c.stage ?? 'found') === s.id)
              const total = col.reduce((a, c) => a + (c.pipelineAmount ?? c.estValue), 0)
              return (
                <section key={s.id} data-stage={s.id} aria-label={s.label} className={`w-[260px] sm:w-[280px] shrink-0 rounded-xl border ${overStage === s.id ? 'border-survey bg-survey-50/50' : 'border-line bg-concrete/50'} flex flex-col`}>
                  <header className="px-3 py-2.5 border-b border-line flex items-center justify-between">
                    <h2 className="text-sm font-semibold">{s.label}</h2>
                    <span className="font-mono text-xs text-steel">{col.length} · {compactMoney(total)}</span>
                  </header>
                  <div className="p-2 space-y-2 min-h-[120px] flex-1">
                    {col.map((c) => <PipelineCard key={c.id} c={c} score={scoreFor(state, c).score} onPointerDown={(e) => onPointerDown(e, c.id)} onOpen={() => setOpenId(c.id)} onMove={() => setMoveId(c.id)} dragging={dragId === c.id} />)}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      )}

      {dragging && ghostPos && (
        <div className="pointer-events-none fixed z-[100] w-[260px] rounded-lg border border-survey bg-paper p-3 shadow-lift opacity-90" style={{ left: ghostPos.x - 130, top: ghostPos.y - 20 }} aria-hidden="true">
          <p className="text-sm font-medium truncate">{dragging.title}</p>
        </div>
      )}

      <Sheet open={!!moving} onClose={() => setMoveId(null)} title={`Move to...`}>
        {moving && <p className="text-sm text-steel mb-3 break-words">{moving.title}</p>}
        <ul className="space-y-1">
          {stages.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => { if (moveId) move(moveId, s.id); setMoveId(null) }} className={`w-full text-left rounded-lg px-3 py-3 text-sm font-medium min-h-[44px] ${moving?.stage === s.id ? 'bg-survey-50 text-survey' : 'hover:bg-concrete'}`}>
                {s.label}{moving?.stage === s.id ? ' (current)' : ''}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
      <OpportunityDrawer opp={open} onClose={() => setOpenId(null)} />
    </div>
  )
}

function PipelineCard({ c, score, onPointerDown, onOpen, onMove, dragging }: { c: Opportunity; score: number; onPointerDown: (e: React.PointerEvent) => void; onOpen: () => void; onMove: () => void; dragging: boolean }) {
  const days = daysUntil(c.dueDate)
  const border = days !== null && days >= 0 && days <= 3 ? 'border-danger' : days !== null && days >= 0 && days <= 7 ? 'border-warning' : 'border-line'
  const untouched = (Date.now() - new Date(c.lastTouchedAt).getTime()) / 86_400_000 >= 7
  return (
    <article
      onPointerDown={onPointerDown}
      className={`rounded-lg border-l-4 border border-line ${border} bg-paper p-3 shadow-card select-none ${dragging ? 'opacity-40' : 'cursor-grab'} touch-pan-y`}
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onOpen} className="text-left text-sm font-medium text-ink break-words hover:underline min-h-[24px]">{c.title}</button>
        <button type="button" onClick={onMove} className="tap -mr-2 -mt-2 inline-flex items-center justify-center rounded-lg text-steel hover:bg-concrete" aria-label={`Move ${c.title} to another stage`}>
          <MoreVertical size={18} />
        </button>
      </div>
      <p className="text-xs text-steel mt-1 break-words">{c.owner}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral" mono>{c.kind === 'bid' ? 'Bid' : 'Lead'}</Badge>
        <span className="font-mono text-xs">{money0(c.pipelineAmount ?? c.estValue)}</span>
        <span className="font-mono text-[10px] text-steel">fit {score}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {c.kind === 'bid' && <DueBadge date={c.dueDate} />}
        {untouched && !['won', 'lost'].includes(c.stage ?? '') && <Badge tone="warning" mono><Flag size={10} /> 7+ days</Badge>}
      </div>
    </article>
  )
}
