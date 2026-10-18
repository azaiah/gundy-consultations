import type { Score } from '../../types'
import { scoreTone, scoreLabel } from '../../lib/scoring'

const tones = { success: 'text-success bg-[#E6F3EC] border-success/30', warning: 'text-warning bg-[#FBF2E0] border-warning/30', danger: 'text-danger bg-[#FBE9E7] border-danger/30' }

export function ScoreBadge({ score, large = false }: { score: Score; large?: boolean }) {
  const t = scoreTone(score)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 ${large ? 'py-1' : 'py-0.5'} ${tones[t]}`} title={score.disqualified ?? scoreLabel(score)}>
      <span className={`font-display ${large ? 'text-2xl' : 'text-lg'} leading-none`}>{score.disqualified ? 'X' : score.score}</span>
      <span className="font-mono text-[10px] uppercase tracking-wider">{scoreLabel(score)}</span>
    </span>
  )
}

export function ScoreBreakdown({ score }: { score: Score }) {
  return (
    <div>
      {score.disqualified && (
        <div className="rounded-lg border border-danger/30 bg-[#FBE9E7] p-3 text-sm text-danger mb-3">
          <strong>Disqualified:</strong> {score.disqualified}
        </div>
      )}
      <ul className="space-y-2">
        {score.factors.map((f) => (
          <li key={f.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink">{f.name}</span>
              <span className="font-mono text-xs text-steel">{f.points} / {f.max}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-line overflow-hidden">
              <div className={`h-full ${f.points / f.max >= 0.66 ? 'bg-success' : f.points / f.max >= 0.33 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${(f.points / f.max) * 100}%` }} />
            </div>
            <p className="text-xs text-steel mt-1">{f.note}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
