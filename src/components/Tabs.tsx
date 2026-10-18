import type { ReactNode } from 'react'

export type TabItem<T extends string> = { id: T; label: ReactNode; count?: number }

export function Tabs<T extends string>({ items, value, onChange, className = '' }: { items: TabItem<T>[]; value: T; onChange: (id: T) => void; className?: string }) {
  return (
    <div role="tablist" className={`flex gap-1 overflow-x-auto border-b border-line -mx-1 px-1 ${className}`}>
      {items.map((t) => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`tap whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active ? 'border-survey text-ink' : 'border-transparent text-steel hover:text-ink'
            }`}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 text-[11px] font-mono ${active ? 'bg-survey text-white' : 'bg-concrete text-steel'}`}>
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
