import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

export function PolicyLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
      <p className="eyebrow">Legal</p>
      <h1 className="display text-4xl sm:text-5xl mt-3">{title}</h1>
      <p className="stamp mt-3">Last updated {updated}</p>
      <div role="note" className="mt-6 flex gap-3 rounded-lg border border-warning/40 bg-[#FBF2E0] p-4 text-sm text-ink">
        <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" aria-hidden="true" />
        <p>Starter text. To be reviewed by counsel before publication.</p>
      </div>
      <div className="prose-policy mt-8 space-y-6 text-ink leading-relaxed [&_h2]:font-display [&_h2]:uppercase [&_h2]:text-2xl [&_h2]:mt-10 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-blueprint [&_a]:underline">
        {children}
      </div>
    </article>
  )
}
