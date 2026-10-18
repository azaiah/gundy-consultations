import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const inputClass =
  'w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-steel/70 focus:border-blueprint focus:outline-none focus:ring-2 focus:ring-blueprint/20 min-h-[44px] break-words'

export function Label({ htmlFor, children, hint }: { htmlFor: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-ink mb-1">
      {children}
      {hint && <span className="ml-1 text-steel font-normal">{hint}</span>}
    </label>
  )
}

export function Input({ label, error, hint, className = '', id: idProp, trailing, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode; error?: string; hint?: ReactNode; trailing?: ReactNode }) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <div className={className}>
      {label && <Label htmlFor={id} hint={hint}>{label}</Label>}
      <div className="relative">
        <input id={id} className={`${inputClass} ${error ? 'border-danger' : ''} ${trailing ? 'pr-12' : ''}`} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
        {trailing && <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && <p id={`${id}-err`} className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, hint, className = '', id: idProp, trailing, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: ReactNode; error?: string; hint?: ReactNode; trailing?: ReactNode }) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <div className={className}>
      {label && <Label htmlFor={id} hint={hint}>{label}</Label>}
      <div className="relative">
        <textarea id={id} className={`${inputClass} min-h-[96px] ${error ? 'border-danger' : ''} ${trailing ? 'pr-12' : ''}`} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
        {trailing && <div className="absolute right-1 top-1">{trailing}</div>}
      </div>
      {error && <p id={`${id}-err`} className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}

export function Select({ label, error, hint, className = '', id: idProp, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { label?: ReactNode; error?: string; hint?: ReactNode }) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <div className={className}>
      {label && <Label htmlFor={id} hint={hint}>{label}</Label>}
      <select id={id} className={`${inputClass} ${error ? 'border-danger' : ''}`} aria-invalid={!!error} {...rest}>
        {children}
      </select>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}

export function Toggle({ checked, onChange, label, description, id: idProp }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; description?: ReactNode; id?: string }) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-ink break-words">{label}</label>
        {description && <p className="text-xs text-steel mt-0.5 break-words">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-survey' : 'bg-line'}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export { inputClass }
