import { useEffect, useRef } from 'react'

const ITEM_H = 40

function WheelColumn({ items, value, onChange, label }: { items: string[]; value: string; onChange: (v: string) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    const idx = items.indexOf(value)
    const el = ref.current
    if (el && idx >= 0) el.scrollTo({ top: idx * ITEM_H, behavior: 'auto' })
  }, [items, value])

  function onScroll() {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      const el = ref.current
      if (!el) return
      const idx = Math.round(el.scrollTop / ITEM_H)
      const v = items[Math.max(0, Math.min(items.length - 1, idx))]
      if (v && v !== value) onChange(v)
    }, 80)
  }

  return (
    <div className="relative flex-1" role="listbox" aria-label={label}>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 rounded-md bg-blueprint-50 border-y border-blueprint/20" />
      <div ref={ref} onScroll={onScroll} className="wheel-col h-[200px] overflow-y-scroll relative" style={{ paddingTop: ITEM_H * 2, paddingBottom: ITEM_H * 2 }}>
        {items.map((it) => (
          <button
            key={it}
            type="button"
            role="option"
            aria-selected={it === value}
            onClick={() => onChange(it)}
            className={`wheel-item relative z-10 flex w-full items-center justify-center h-10 font-mono text-base ${it === value ? 'text-ink font-medium' : 'text-steel/70'}`}
          >
            {it}
          </button>
        ))}
      </div>
    </div>
  )
}

/** value = "HH:MM" 24h. iOS-style scroll-snap columns: hour / minute / AM-PM. */
export function WheelTimePicker({ value, onChange, minuteStep = 5 }: { value: string; onChange: (v: string) => void; minuteStep?: number }) {
  const [hh, mm] = value.split(':').map((n) => parseInt(n, 10))
  const h24 = Number.isFinite(hh) ? hh : 9
  const m = Number.isFinite(mm) ? mm : 0
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1))
  const minutes = Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) => String(i * minuteStep).padStart(2, '0'))
  const minuteValue = String(Math.round(m / minuteStep) * minuteStep % 60).padStart(2, '0')

  function emit(h: number, min: number, p: string) {
    let h24n = h % 12
    if (p === 'PM') h24n += 12
    onChange(`${String(h24n).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
  }

  return (
    <div className="flex gap-2 rounded-xl border border-line bg-paper p-2 select-none">
      <WheelColumn label="Hour" items={hours} value={String(h12)} onChange={(v) => emit(parseInt(v, 10), parseInt(minuteValue, 10), period)} />
      <WheelColumn label="Minute" items={minutes} value={minuteValue} onChange={(v) => emit(h12, parseInt(v, 10), period)} />
      <WheelColumn label="AM or PM" items={['AM', 'PM']} value={period} onChange={(v) => emit(h12, parseInt(minuteValue, 10), v)} />
    </div>
  )
}
