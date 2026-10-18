import { useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useFocusTrap } from './useFocusTrap'

/** Right-side drawer on desktop, full-height sheet on mobile. */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, onClose)
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[80]" role="presentation">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={`absolute right-0 top-0 h-full w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'} bg-paper shadow-lift flex flex-col border-l border-line`}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-line">
          <div className="min-w-0">
            <h2 className="font-semibold text-ink text-lg break-words">{title}</h2>
            {subtitle && <div className="text-sm text-steel mt-0.5 break-words">{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} className="tap inline-flex items-center justify-center rounded-lg hover:bg-ink/5 shrink-0" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-line flex flex-wrap gap-2">{footer}</div>}
      </div>
    </div>
  ,
    document.body,
  )
}
