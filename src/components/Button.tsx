import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'
const variants: Record<Variant, string> = {
  primary: 'bg-survey text-white hover:bg-[#d14f0a] active:bg-[#bd4708]',
  secondary: 'bg-blueprint-50 text-blueprint hover:bg-[#d9e4ef]',
  ghost: 'bg-transparent text-ink hover:bg-ink/5',
  dark: 'bg-ink text-white hover:bg-[#23272e]',
  danger: 'bg-danger text-white hover:bg-[#9a1d14]',
  outline: 'border border-line bg-paper text-ink hover:border-steel',
}
const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 min-h-[36px]',
  md: 'text-sm px-4 min-h-[44px]',
  lg: 'text-base px-6 min-h-[52px]',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; icon?: ReactNode }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', icon, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  )
})

type LinkButtonProps = { to: string; variant?: Variant; size?: Size; className?: string; icon?: ReactNode; children: ReactNode } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>

export function LinkButton({ to, variant = 'primary', size = 'md', className = '', icon, children, ...rest }: LinkButtonProps) {
  if (to.startsWith('#') || to.startsWith('http') || to.startsWith('mailto:') || to.startsWith('tel:')) {
    return (
      <a href={to} className={buttonClass(variant, size, className)} {...rest}>
        {icon}
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  )
}
