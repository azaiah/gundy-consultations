import { useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useFocusTrap } from './useFocusTrap'

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, onClose)
  if (!open) return null
  const w = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl'
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" role="presentation">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={`relative w-full ${w} max-h-[92vh] flex flex-col bg-paper rounded-t-2xl sm:rounded-2xl shadow-lift border border-line`}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line">
          <h2 className="font-semibold text-ink text-lg break-words">{title}</h2>
          <button type="button" onClick={onClose} className="tap inline-flex items-center justify-center rounded-lg hover:bg-ink/5" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex-1 min-h-0">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-line flex flex-wrap gap-2 justify-end">{footer}</div>}
      </div>
    </div>
  ,
    document.body,
  )
}
