/**
 * Gundy Consultations logo, from the artwork the client supplied.
 * - Full wordmark: /images/gundy-logo.png (transparent background)
 * - Monogram only: /images/gundy-mark.png (compass + GC), used compact and as the favicon
 * The navy wordmark needs a light surface, so the "light" variant (for dark sections)
 * sits on a white plate rather than recoloring the client's logo.
 */
type Props = {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  compact?: boolean
}

const heights = { sm: 32, md: 40, lg: 56 }
const ratio = 702 / 255 // full logo aspect

export function GundyLogo({ variant = 'dark', size = 'md', className = '', compact = false }: Props) {
  const h = heights[size]
  const img = compact ? (
    <img src="/images/gundy-mark.png" alt="Gundy Consultations" width={h} height={h} style={{ height: h, width: h }} className="object-contain select-none" draggable={false} />
  ) : (
    <img src="/images/gundy-logo.png" alt="Gundy Consultations" width={Math.round(h * ratio)} height={h} style={{ height: h, width: 'auto' }} className="object-contain select-none" draggable={false} />
  )
  if (variant === 'light') {
    return (
      <span className={`inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 ${className}`} style={{ lineHeight: 0 }}>
        {img}
      </span>
    )
  }
  return <span className={`inline-flex items-center ${className}`} style={{ lineHeight: 0 }}>{img}</span>
}

/** Monogram glyph, kept for places that want just the mark at an arbitrary size. */
export function GundyGlyph({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <img src="/images/gundy-mark.png" alt="" aria-hidden="true" width={size} height={size} style={{ width: size, height: size }} className={`object-contain ${className}`} draggable={false} />
}
