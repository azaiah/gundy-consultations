import type { ReactNode } from 'react'
import { HelpButton } from './HelpButton'

export function PageHeader({ title, subtitle, helpKey, actions }: { title: string; subtitle?: ReactNode; helpKey: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="font-display uppercase text-3xl sm:text-4xl text-ink leading-none">{title}</h1>
          <HelpButton helpKey={helpKey} />
        </div>
        {subtitle && <p className="text-sm text-steel mt-1.5 break-words">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 w-full sm:w-auto">{actions}</div>}
    </div>
  )
}

export function SampleRibbon() {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel mb-3">
      Sample data <span aria-hidden="true">·</span> resets on Reset Demo
    </p>
  )
}
