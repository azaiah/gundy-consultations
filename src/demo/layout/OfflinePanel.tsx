import { useState } from 'react'
import { CloudOff, Cloud, RefreshCw, AlertTriangle, Check } from 'lucide-react'
import { Sheet } from '@/components/Sheet'
import { Button } from '@/components/Button'
import { useDemo } from '../store'
import { relative } from '../lib/dates'

export function OfflineIndicator() {
  const { state, effectiveOnline, retryQueued, flushNow, clearFlushed, online } = useDemo()
  const [open, setOpen] = useState(false)
  const queued = state.queue.filter((q) => q.status === 'queued').length
  const failed = state.queue.filter((q) => q.status === 'failed').length
  const tone = !effectiveOnline ? 'bg-warning text-white' : failed ? 'bg-danger text-white' : 'bg-transparent text-steel hover:bg-ink/5'
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`tap inline-flex items-center gap-1.5 rounded-lg px-2 text-xs font-medium ${tone}`} aria-label={`Save queue: ${queued} queued, ${failed} failed`}>
        {effectiveOnline ? <Cloud size={18} /> : <CloudOff size={18} />}
        {(queued > 0 || failed > 0) && <span className="font-mono">{queued + failed}</span>}
        {!effectiveOnline && <span className="hidden sm:inline">Offline</span>}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Offline save queue">
        <div className={`rounded-lg p-3 text-sm ${effectiveOnline ? 'bg-[#E6F3EC] text-success' : 'bg-[#FBF2E0] text-warning'}`}>
          {effectiveOnline ? 'Online. Saves go straight through.' : state.settings.simulateOffline && online ? 'Simulated offline (Settings). Saves are queued and will flush when you turn it off.' : 'No connection. Saves are queued and will flush when you reconnect.'}
        </div>
        <ul className="mt-3 divide-y divide-line">
          {state.queue.length === 0 && <li className="py-6 text-center text-sm text-steel">Nothing queued.</li>}
          {state.queue.map((q) => (
            <li key={q.id} className="py-2.5 flex items-start gap-3">
              <span className={`mt-0.5 shrink-0 ${q.status === 'failed' ? 'text-danger' : q.status === 'flushed' ? 'text-success' : 'text-warning'}`}>
                {q.status === 'failed' ? <AlertTriangle size={16} /> : q.status === 'flushed' ? <Check size={16} /> : <RefreshCw size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink break-words">{q.label}</p>
                <p className="text-xs text-steel">
                  {q.status === 'queued' ? 'Queued' : q.status === 'failed' ? `Failed after ${q.attempts} attempt${q.attempts === 1 ? '' : 's'}` : 'Saved'} · {relative(q.createdAt)}
                </p>
                {q.error && <p className="text-xs text-danger mt-0.5">{q.error}</p>}
              </div>
              {q.status === 'failed' && (
                <Button size="sm" variant="outline" onClick={() => retryQueued(q.id)}>Retry</Button>
              )}
            </li>
          ))}
        </ul>
        {state.queue.length > 0 && (
          <div className="mt-3 flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={clearFlushed}>Clear saved</Button>
            {effectiveOnline && queued > 0 && <Button size="sm" onClick={flushNow}>Flush now</Button>}
          </div>
        )}
      </Sheet>
    </>
  )
}
