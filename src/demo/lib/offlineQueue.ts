import type { QueuedSave } from '../types'
import { uid } from './ids'

/**
 * The demo persists to localStorage synchronously, so "saving" is instant.
 * The offline queue models what the live app does: while offline, each save is recorded,
 * then flushed on reconnect. Flushing can fail (simulated) so the panel can show Retry.
 */
export function enqueue(queue: QueuedSave[], label: string): QueuedSave[] {
  return [...queue, { id: uid('q'), label, createdAt: new Date().toISOString(), status: 'queued', attempts: 0 }]
}

/** Simulate flushing: most succeed, roughly 1 in 5 fail on first attempt so the Retry path is visible. */
export function flushQueue(queue: QueuedSave[], random: () => number = Math.random): QueuedSave[] {
  return queue
    .map((q) => {
      if (q.status === 'flushed') return q
      const attempts = q.attempts + 1
      const fail = attempts === 1 && random() < 0.2
      return fail ? { ...q, status: 'failed' as const, attempts, error: 'Server did not acknowledge the save (simulated).' } : { ...q, status: 'flushed' as const, attempts, error: undefined }
    })
    .filter((q) => q.status !== 'flushed' || Date.now() - new Date(q.createdAt).getTime() < 15_000)
}

export function retryItem(queue: QueuedSave[], id: string): QueuedSave[] {
  return queue.map((q) => (q.id === id ? { ...q, status: 'flushed' as const, attempts: q.attempts + 1, error: undefined } : q))
}

export function pruneFlushed(queue: QueuedSave[]): QueuedSave[] {
  return queue.filter((q) => q.status !== 'flushed')
}
