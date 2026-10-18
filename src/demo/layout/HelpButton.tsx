import { useState } from 'react'
import { Info } from 'lucide-react'
import { Sheet } from '@/components/Sheet'
import { helpContent } from '../helpContent'

export function HelpButton({ helpKey }: { helpKey: string }) {
  const [open, setOpen] = useState(false)
  const h = helpContent[helpKey] ?? helpContent.dashboard
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="tap inline-flex items-center justify-center rounded-lg text-blueprint hover:bg-blueprint-50" aria-label={`What you can do here: ${h.title}`} title="What you can do here">
        <Info size={20} />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={`What you can do here: ${h.title}`}>
        <p className="text-steel text-sm">{h.intro}</p>
        <ul className="mt-4 space-y-2">
          {h.bullets.map((b) => (
            <li key={b} className="flex gap-2 text-sm text-ink">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-survey shrink-0" aria-hidden="true" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  )
}
