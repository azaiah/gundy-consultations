import type { ReactNode } from 'react'

/** Mono "stamp" label like `SWEEP 10/17 · 06:00 ET`. */
export function StampLabel({ children, tone = 'light', className = '' }: { children: ReactNode; tone?: 'light' | 'dark' | 'accent'; className?: string }) {
  const t =
    tone === 'dark'
      ? 'border-white/20 text-white/80 bg-white/5'
      : tone === 'accent'
        ? 'border-survey/40 text-survey bg-survey-50'
        : 'border-line text-steel bg-paper'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] max-w-full ${t} ${className}`}>
      {children}
    </span>
  )
}
