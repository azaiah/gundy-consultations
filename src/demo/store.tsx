import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import type { DemoState, QueuedSave, Role } from './types'
import { createSeedState } from './seed'
import { loadRaw, saveRaw, clearRaw } from './lib/storage'
import { enqueue, flushQueue, retryItem, pruneFlushed } from './lib/offlineQueue'

export type CollectionKey =
  | 'opportunities' | 'sweeps' | 'outreach' | 'contacts' | 'todos' | 'projects' | 'estimates' | 'proposals' | 'changeOrders'
  | 'dailyLogs' | 'costs' | 'invoices' | 'events' | 'crew' | 'assignments' | 'notes' | 'companyDocs' | 'clock'
type ItemOf<K extends CollectionKey> = DemoState[K][number]
type ScalarKey = Exclude<keyof DemoState, CollectionKey | 'version'>

export type Action =
  | { type: 'load'; state: DemoState }
  | { type: 'reset' }
  | { type: 'set'; key: ScalarKey; value: DemoState[ScalarKey] }
  | { type: 'upsert'; collection: CollectionKey; item: { id: string } }
  | { type: 'patch'; collection: CollectionKey; id: string; patch: Record<string, unknown> }
  | { type: 'remove'; collection: CollectionKey; id: string }
  | { type: 'queue'; queue: QueuedSave[] }
  | { type: 'replace'; collection: CollectionKey; items: { id: string }[] }

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'load':
      return action.state
    case 'reset':
      return { ...createSeedState(), entered: true, role: state.role, settings: { ...createSeedState().settings, tourDone: true } }
    case 'set':
      return { ...state, [action.key]: action.value }
    case 'upsert': {
      const list = state[action.collection] as { id: string }[]
      const idx = list.findIndex((x) => x.id === action.item.id)
      const next = idx >= 0 ? list.map((x) => (x.id === action.item.id ? action.item : x)) : [...list, action.item]
      return { ...state, [action.collection]: next }
    }
    case 'patch': {
      const list = state[action.collection] as { id: string }[]
      return { ...state, [action.collection]: list.map((x) => (x.id === action.id ? { ...x, ...action.patch } : x)) }
    }
    case 'remove': {
      const list = state[action.collection] as { id: string }[]
      return { ...state, [action.collection]: list.filter((x) => x.id !== action.id) }
    }
    case 'queue':
      return { ...state, queue: action.queue }
    case 'replace':
      return { ...state, [action.collection]: action.items }
    default:
      return state
  }
}

function loadInitial(): DemoState {
  const raw = loadRaw()
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<DemoState>
      if (parsed && parsed.version === 1 && Array.isArray(parsed.opportunities)) {
        // merge over seed so new keys added in later builds are present
        return { ...createSeedState(), ...parsed } as DemoState
      }
    } catch {
      /* fall through to seed */
    }
  }
  return createSeedState()
}

type Ctx = {
  state: DemoState
  dispatch: (a: Action, label?: string) => void
  online: boolean
  effectiveOnline: boolean
  storageOk: boolean
  upsert: <K extends CollectionKey>(collection: K, item: ItemOf<K>, label?: string) => void
  patch: <K extends CollectionKey>(collection: K, id: string, patch: Partial<ItemOf<K>>, label?: string) => void
  remove: (collection: CollectionKey, id: string, label?: string) => void
  replace: <K extends CollectionKey>(collection: K, items: DemoState[K], label?: string) => void
  set: <K extends ScalarKey>(key: K, value: DemoState[K], label?: string) => void
  reset: () => void
  setRole: (r: Role) => void
  retryQueued: (id: string) => void
  flushNow: () => void
  clearFlushed: () => void
}

const DemoContext = createContext<Ctx | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, loadInitial)
  const [online, setOnline] = useState<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [storageOk, setStorageOk] = useState(true)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const effectiveOnline = online && !state.settings.simulateOffline

  // Persist on every change (sync, cheap)
  useEffect(() => {
    try {
      const ok = saveRaw(JSON.stringify(state))
      setStorageOk(ok)
    } catch {
      setStorageOk(false)
    }
  }, [state])

  // Flush queue on reconnect
  const prevOnline = useRef(effectiveOnline)
  useEffect(() => {
    if (!prevOnline.current && effectiveOnline && stateRef.current.queue.some((q) => q.status === 'queued')) {
      const timer = window.setTimeout(() => {
        rawDispatch({ type: 'queue', queue: flushQueue(stateRef.current.queue) })
      }, 900)
      prevOnline.current = effectiveOnline
      return () => window.clearTimeout(timer)
    }
    prevOnline.current = effectiveOnline
  }, [effectiveOnline])

  const dispatch = useCallback(
    (a: Action, label?: string) => {
      rawDispatch(a)
      const mutating = a.type === 'upsert' || a.type === 'patch' || a.type === 'remove' || a.type === 'replace' || (a.type === 'set' && a.key !== 'role' && a.key !== 'entered')
      const cur = stateRef.current
      const isOffline = !(online && !cur.settings.simulateOffline)
      if (mutating && isOffline) {
        const text = label ?? (a.type === 'set' ? `Update ${String(a.key)}` : `${a.type === 'remove' ? 'Delete' : 'Save'} ${String((a as { collection: string }).collection).replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        rawDispatch({ type: 'queue', queue: enqueue(cur.queue, text) })
      }
    },
    [online],
  )

  const api = useMemo<Ctx>(
    () => ({
      state,
      dispatch,
      online,
      effectiveOnline,
      storageOk,
      upsert: (collection, item, label) => dispatch({ type: 'upsert', collection, item }, label),
      patch: (collection, id, patch, label) => dispatch({ type: 'patch', collection, id, patch: patch as Record<string, unknown> }, label),
      remove: (collection, id, label) => dispatch({ type: 'remove', collection, id }, label),
      replace: (collection, items, label) => dispatch({ type: 'replace', collection, items: items as { id: string }[] }, label),
      set: (key, value, label) => dispatch({ type: 'set', key, value }, label),
      reset: () => {
        clearRaw()
        rawDispatch({ type: 'reset' })
      },
      setRole: (r) => rawDispatch({ type: 'set', key: 'role', value: r }),
      retryQueued: (id) => rawDispatch({ type: 'queue', queue: retryItem(stateRef.current.queue, id) }),
      flushNow: () => rawDispatch({ type: 'queue', queue: flushQueue(stateRef.current.queue) }),
      clearFlushed: () => rawDispatch({ type: 'queue', queue: pruneFlushed(stateRef.current.queue) }),
    }),
    [state, dispatch, online, effectiveOnline, storageOk],
  )

  return <DemoContext.Provider value={api}>{children}</DemoContext.Provider>
}

export function useDemo(): Ctx {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used inside DemoProvider')
  return ctx
}
