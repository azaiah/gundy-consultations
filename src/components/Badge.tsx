import type { ReactNode } from 'react'

export type Tone = 'neutral' | 'blueprint' | 'survey' | 'success' | 'warning' | 'danger' | 'ink'

const tones: Record<Tone, string> = {
  neutral: 'bg-concrete text-steel border-line',
  blueprint: 'bg-blueprint-50 text-blueprint border-blueprint/20',
  survey: 'bg-survey-50 text-survey border-survey/30',
  success: 'bg-[#E6F3EC] text-success border-success/30',
  warning: 'bg-[#FBF2E0] text-warning border-warning/30',
  danger: 'bg-[#FBE9E7] text-danger border-danger/30',
  ink: 'bg-ink text-white border-ink',
}

export function Badge({ tone = 'neutral', children, className = '', mono = false }: { tone?: Tone; children: ReactNode; className?: string; mono?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${mono ? 'font-mono tracking-wide' : ''} ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
