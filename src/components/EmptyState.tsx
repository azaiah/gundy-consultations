import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export function EmptyState({ icon: Icon, title, text, action, compact = false }: { icon: LucideIcon; title: string; text: string; action?: ReactNode; compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? 'py-6 px-4' : 'py-12 px-6'} rounded-xl border border-dashed border-line bg-paper`}>
      <div className="w-12 h-12 rounded-xl bg-blueprint-50 text-blueprint flex items-center justify-center mb-3">
        <Icon size={22} />
      </div>
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="text-sm text-steel mt-1 max-w-sm break-words">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
