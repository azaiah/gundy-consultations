import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { GundyLogo } from '@/components/GundyLogo'
import { useDocumentMeta } from '@/components/useDocumentMeta'
import { useDemo } from '../store'
import { roleMeta } from '../nav'
import type { Role } from '../types'

const roles: Role[] = ['owner', 'estimator', 'pm', 'office', 'foreman', 'sub', 'client']

export function Gate() {
  useDocumentMeta('Live demo | Gundy Consultations', 'Enter the interactive demo portal as any role and try every feature with sample data.')
  const { set, setRole, state } = useDemo()
  const nav = useNavigate()
  function enter(r: Role) {
    setRole(r)
    set('entered', true)
    nav(roleMeta[r].home)
  }
  return (
    <main className="min-h-screen bg-ink text-white bg-blueprint-grid-dark flex flex-col">
      <div className="p-5 flex items-center justify-between">
        <Link to="/" aria-label="Gundy Consultations home"><GundyLogo variant="light" /></Link>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white min-h-[44px]"><ArrowLeft size={16} /> Back to site</Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          <p className="eyebrow text-survey-light">You are entering a live demo</p>
          <h1 className="display text-4xl sm:text-6xl mt-3">Cumberland Ridge Builders</h1>
          <p className="mt-3 text-white/70 max-w-xl">
            A fictional Nashville remodeler and light-commercial GC. Everything inside is sample data you can change, break and reset. Pick a role to see what that person sees.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {roles.map((r) => (
              <button key={r} type="button" onClick={() => enter(r)} className="group text-left rounded-xl border border-white/15 bg-white/[0.04] p-4 hover:border-survey-light hover:bg-white/[0.07] transition-colors min-h-[44px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{roleMeta[r].label}</span>
                  <ArrowRight size={16} className="text-survey-light opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-white/60 mt-1">{roleMeta[r].description}</p>
              </button>
            ))}
          </div>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-white/40">
            Sample data · stored in this browser only · {state.sweeps.length} sweeps on record
          </p>
        </div>
      </div>
    </main>
  )
}
