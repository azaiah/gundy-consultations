import { useState } from 'react'
import { Table2, BarChart3 } from 'lucide-react'

export type BarSeries = { name: string; color: string; values: number[] }

/** Plain SVG grouped bar chart with direct value labels and a table-view toggle. */
export function BarChart({
  categories,
  series,
  format = (v: number) => String(v),
  title,
  height = 240,
}: {
  categories: string[]
  series: BarSeries[]
  format?: (v: number) => string
  title: string
  height?: number
}) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const max = Math.max(1, ...series.flatMap((s) => s.values))
  const W = 640
  const padL = 8
  const padR = 8
  const padT = 24
  const padB = 28
  const innerW = W - padL - padR
  const innerH = height - padT - padB
  const groupW = innerW / categories.length
  const barW = Math.min(28, (groupW * 0.7) / series.length)
  const gap = 3
  const compact = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : String(Math.round(v)))

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap gap-3 text-xs">
          {series.map((s) => (
            <span key={s.name} className="inline-flex items-center gap-1.5 text-steel">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} aria-hidden="true" />
              {s.name}
            </span>
          ))}
        </div>
        <div className="inline-flex rounded-lg border border-line overflow-hidden">
          <button type="button" onClick={() => setView('chart')} aria-pressed={view === 'chart'} aria-label="Chart view" className={`tap px-2 inline-flex items-center justify-center ${view === 'chart' ? 'bg-ink text-white' : 'text-steel hover:bg-concrete'}`}>
            <BarChart3 size={16} />
          </button>
          <button type="button" onClick={() => setView('table')} aria-pressed={view === 'table'} aria-label="Table view" className={`tap px-2 inline-flex items-center justify-center ${view === 'table' ? 'bg-ink text-white' : 'text-steel hover:bg-concrete'}`}>
            <Table2 size={16} />
          </button>
        </div>
      </div>
      {view === 'chart' ? (
        <svg viewBox={`0 0 ${W} ${height}`} className="w-full h-auto" role="img" aria-label={title}>
          <title>{title}</title>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line key={f} x1={padL} x2={W - padR} y1={padT + innerH - innerH * f} y2={padT + innerH - innerH * f} stroke="#DAD6CC" strokeDasharray="2 4" />
          ))}
          <line x1={padL} x2={W - padR} y1={padT + innerH} y2={padT + innerH} stroke="#5B6470" />
          {categories.map((c, ci) => {
            const gx = padL + ci * groupW + (groupW - (barW * series.length + gap * (series.length - 1))) / 2
            return (
              <g key={c}>
                {series.map((s, si) => {
                  const v = s.values[ci] ?? 0
                  const h = (v / max) * innerH
                  const x = gx + si * (barW + gap)
                  const y = padT + innerH - h
                  return (
                    <g key={s.name}>
                      <rect x={x} y={y} width={barW} height={h} rx={2} fill={s.color} />
                      <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="9" fontFamily="IBM Plex Mono, monospace" fill="#5B6470">
                        {compact(v)}
                      </text>
                    </g>
                  )
                })}
                <text x={padL + ci * groupW + groupW / 2} y={height - 8} textAnchor="middle" fontSize="11" fontFamily="Manrope, sans-serif" fill="#5B6470">
                  {c}
                </text>
              </g>
            )
          })}
        </svg>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-sm">
            <caption className="sr-only">{title}</caption>
            <thead className="bg-concrete/70 text-left">
              <tr>
                <th scope="col" className="px-3 py-2 text-xs uppercase text-steel">Period</th>
                {series.map((s) => (
                  <th key={s.name} scope="col" className="px-3 py-2 text-xs uppercase text-steel text-right">{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((c, ci) => (
                <tr key={c} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 font-medium text-left">{c}</th>
                  {series.map((s) => (
                    <td key={s.name} className="px-3 py-2 text-right font-mono">{format(s.values[ci] ?? 0)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
