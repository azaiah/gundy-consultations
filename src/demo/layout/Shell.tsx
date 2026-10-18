import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, MoreHorizontal, RotateCcw, ArrowLeft, X, Database } from 'lucide-react'
import { GundyLogo } from '@/components/GundyLogo'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { useFocusTrap } from '@/components/useFocusTrap'
import { useDemo } from '../store'
import { navForRole, roleMeta } from '../nav'
import type { Role } from '../types'
import { OfflineIndicator } from './OfflinePanel'
import { GlobalSearch } from './GlobalSearch'
import { SetupWizard } from './SetupWizard'
import { AskAssistant } from '../modules/ai/AskAssistant'

const roles: Role[] = ['owner', 'estimator', 'pm', 'office', 'foreman', 'sub', 'client']

function RoleSwitcher() {
  const { state, setRole } = useDemo()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} className="tap inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 text-sm font-medium hover:border-steel max-w-[46vw] sm:max-w-none">
        <span className="truncate">{roleMeta[state.role].label}</span>
        <ChevronDown size={14} className="shrink-0" />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 mt-1 w-64 rounded-xl border border-line bg-paper shadow-lift z-50 py-1">
          {roles.map((r) => (
            <li key={r}>
              <button type="button" role="option" aria-selected={state.role === r} onClick={() => { setRole(r); setOpen(false); nav(roleMeta[r].home) }} className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blueprint-50 ${state.role === r ? 'text-survey font-semibold' : 'text-ink'}`}>
                {roleMeta[r].label}
                <span className="block text-xs text-steel font-normal">{roleMeta[r].description}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ResetButton() {
  const { reset } = useDemo()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="tap inline-flex items-center gap-1.5 rounded-lg px-2 text-sm text-steel hover:bg-ink/5" title="Reset Demo">
        <RotateCcw size={16} /> <span className="hidden lg:inline">Reset Demo</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Reset the demo?" size="sm" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button variant="danger" onClick={() => { reset(); setOpen(false); nav('/demo') }}>Reset to sample data</Button></>}>
        <p className="text-sm text-steel">Everything you changed in this browser will be replaced with the original sample data for Cumberland Ridge Builders.</p>
      </Modal>
    </>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  const { state } = useDemo()
  const items = navForRole(state.role)
  const location = useLocation()
  const [more, setMore] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  useFocusTrap(moreRef, more, () => setMore(false))
  useEffect(() => setMore(false), [location])

  const primary = items.slice(0, 4)
  const rest = items.slice(4)
  const isActive = (to: string) => (to === '/demo' ? location.pathname === '/demo' : location.pathname.startsWith(to))

  return (
    <div className="min-h-screen bg-concrete flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-ink text-white dark-scroll sticky top-0 h-screen overflow-y-auto">
        <div className="px-5 py-5 border-b border-white/10">
          <Link to="/demo" aria-label="Demo home"><GundyLogo variant="light" size="sm" /></Link>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">Portal · {state.brain.name}</p>
        </div>
        <nav aria-label="Portal" className="flex-1 p-3">
          {(['main', 'engine', 'ops', 'money', 'more'] as const).map((g) => {
            const group = items.filter((i) => i.group === g)
            if (!group.length) return null
            const labels = { main: '', engine: 'Leads and bids', ops: 'Operations', money: 'Money and compliance', more: 'More' }
            return (
              <div key={g} className="mb-3">
                {labels[g] && <p className="px-3 pt-2 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{labels[g]}</p>}
                {group.map((it) => (
                  <NavLink key={it.to} to={it.to} end={it.to === '/demo'} className={({ isActive: a }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm min-h-[40px] ${a ? 'bg-survey text-white' : 'text-white/80 hover:bg-white/10'}`}>
                    <it.icon size={17} /> {it.label}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10 text-xs text-white/50">
          <p className="flex items-center gap-1.5"><Database size={12} /> Sample data, stored in this browser</p>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-concrete/95 backdrop-blur border-b border-line">
          <div className="flex items-center gap-2 px-3 sm:px-5 h-14">
            <Link to="/demo" className="lg:hidden shrink-0" aria-label="Demo home"><GundyLogo compact size="sm" /></Link>
            <div className="hidden sm:block"><GlobalSearch /></div>
            <div className="sm:hidden"><GlobalSearch /></div>
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <RoleSwitcher />
              <OfflineIndicator />
              <ResetButton />
              <Link to="/" className="tap hidden sm:inline-flex items-center gap-1 rounded-lg px-2 text-sm text-steel hover:bg-ink/5"><ArrowLeft size={16} /> <span className="hidden xl:inline">Back to site</span></Link>
            </div>
          </div>
        </header>

        <main id="main" className="flex-1 px-3 sm:px-5 py-4 sm:py-6 pb-24 lg:pb-8 max-w-[1400px] w-full mx-auto">{children}</main>

        {/* Mobile bottom tab bar */}
        <nav aria-label="Portal (mobile)" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-line pb-[env(safe-area-inset-bottom)]">
          <ul className="grid grid-cols-5">
            {primary.map((it) => (
              <li key={it.to}>
                <NavLink to={it.to} end={it.to === '/demo'} className={({ isActive: a }) => `flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-[10px] font-medium ${a ? 'text-survey' : 'text-steel'}`}>
                  <it.icon size={20} />
                  <span className="truncate max-w-[64px]">{it.label.split(' ')[0]}</span>
                </NavLink>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => setMore(true)} className={`w-full flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-[10px] font-medium ${rest.some((r) => isActive(r.to)) ? 'text-survey' : 'text-steel'}`} aria-label="More">
                <MoreHorizontal size={20} /> More
              </button>
            </li>
          </ul>
        </nav>
        {more && (
          <div className="fixed inset-0 z-[85] lg:hidden" role="presentation">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setMore(false)} aria-hidden="true" />
            <div ref={moreRef} role="dialog" aria-modal="true" aria-label="More" tabIndex={-1} className="absolute bottom-0 inset-x-0 max-h-[80vh] overflow-y-auto bg-paper rounded-t-2xl shadow-lift p-4 pb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">All screens</h2>
                <button type="button" onClick={() => setMore(false)} className="tap inline-flex items-center justify-center rounded-lg" aria-label="Close"><X size={20} /></button>
              </div>
              <ul className="grid grid-cols-3 gap-2">
                {rest.map((it) => (
                  <li key={it.to}>
                    <NavLink to={it.to} className={({ isActive: a }) => `flex flex-col items-center gap-1 rounded-xl border p-3 text-center text-xs min-h-[72px] ${a ? 'border-survey bg-survey-50 text-survey' : 'border-line text-ink'}`}>
                      <it.icon size={20} />
                      <span className="break-words">{it.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      <SetupWizard />
      <AskAssistant />
    </div>
  )
}
