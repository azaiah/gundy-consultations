import { useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useFocusTrap } from './useFocusTrap'

/** Bottom sheet (mobile-first). */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, onClose)
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[85]" role="presentation">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-paper rounded-t-2xl shadow-lift flex flex-col sm:left-1/2 sm:right-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2"
      >
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <div className="mx-auto absolute left-1/2 -translate-x-1/2 top-2 h-1 w-10 rounded-full bg-line" aria-hidden="true" />
          <h2 className="font-semibold text-ink mt-3 break-words">{title}</h2>
          <button type="button" onClick={onClose} className="tap inline-flex items-center justify-center rounded-lg hover:bg-ink/5 mt-2" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6">{children}</div>
      </div>
    </div>
  ,
    document.body,
  )
}
