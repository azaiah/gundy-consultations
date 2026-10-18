import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Search, Landmark, FileText, Users, FolderKanban, StickyNote, X } from 'lucide-react'
import { useFocusTrap } from '@/components/useFocusTrap'
import { useDemo } from '../store'
import { contactName } from '../selectors'

type Hit = { id: string; label: string; sub: string; to: string; icon: typeof Search }

export function GlobalSearch() {
  const { state } = useDemo()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const nav = useNavigate()
  useFocusTrap(ref, open, () => setOpen(false))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const hits = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return []
    const out: Hit[] = []
    for (const o of state.opportunities) {
      if (`${o.title} ${o.owner} ${o.source} ${o.address ?? ''}`.toLowerCase().includes(s)) out.push({ id: o.id, label: o.title, sub: `${o.kind === 'bid' ? 'Bid' : 'Lead'} · ${o.owner}`, to: o.kind === 'bid' ? `/demo/bids?open=${o.id}` : `/demo/leads?open=${o.id}`, icon: o.kind === 'bid' ? Landmark : FileText })
    }
    for (const c of state.contacts) {
      if (`${contactName(c)} ${c.company ?? ''} ${c.phone ?? ''} ${c.email ?? ''}`.toLowerCase().includes(s)) out.push({ id: c.id, label: contactName(c), sub: c.type === 'sub' ? 'Subcontractor' : c.type === 'customer' ? 'Customer' : 'Lead', to: `/demo/contacts/${c.id}`, icon: Users })
    }
    for (const p of state.projects) {
      if (`${p.name} ${p.address}`.toLowerCase().includes(s)) out.push({ id: p.id, label: p.name, sub: `Project · ${p.address}`, to: `/demo/projects/${p.id}`, icon: FolderKanban })
    }
    for (const n of state.notes) {
      if (`${n.title} ${n.bodyHtml}`.toLowerCase().includes(s)) out.push({ id: n.id, label: n.title, sub: 'Note', to: `/demo/notes`, icon: StickyNote })
    }
    return out.slice(0, 12)
  }, [q, state])

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="tap inline-flex items-center gap-2 rounded-lg border border-line bg-paper px-3 text-sm text-steel hover:border-steel min-w-0" aria-label="Search (Ctrl or Cmd K)">
        <Search size={16} />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden md:inline font-mono text-[10px] border border-line rounded px-1">K</kbd>
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[90]" role="presentation">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <div ref={ref} role="dialog" aria-modal="true" aria-label="Search" tabIndex={-1} className="absolute left-1/2 top-4 sm:top-20 -translate-x-1/2 w-[calc(100%-24px)] max-w-xl bg-paper rounded-2xl shadow-lift border border-line overflow-hidden">
            <div className="flex items-center gap-2 px-4 border-b border-line">
              <Search size={18} className="text-steel" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search bids, leads, contacts, projects, notes" aria-label="Search" className="flex-1 min-h-[52px] bg-transparent outline-none text-sm" autoFocus />
              <button type="button" onClick={() => setOpen(false)} className="tap inline-flex items-center justify-center rounded-lg" aria-label="Close search"><X size={18} /></button>
            </div>
            <ul className="max-h-[60vh] overflow-y-auto">
              {q.trim().length >= 2 && hits.length === 0 && <li className="px-4 py-6 text-sm text-steel">No matches.</li>}
              {hits.map((h) => (
                <li key={`${h.to}-${h.id}`}>
                  <button type="button" onClick={() => { setOpen(false); setQ(''); nav(h.to) }} className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-blueprint-50/60 min-h-[44px]">
                    <h.icon size={16} className="text-blueprint shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm text-ink break-words">{h.label}</span>
                      <span className="block text-xs text-steel">{h.sub}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
