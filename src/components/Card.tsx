import type { HTMLAttributes, ReactNode } from 'react'

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-start justify-between gap-3 px-4 pt-4 pb-2 ${className}`}>
      <div className="min-w-0">
        <h3 className="font-semibold text-ink break-words">{title}</h3>
        {subtitle && <p className="text-sm text-steel mt-0.5 break-words">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardBody({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`px-4 pb-4 ${className}`}>{children}</div>
}
