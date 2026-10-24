import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import { GundyLogo } from '@/components/GundyLogo'
import { LinkButton } from '@/components/Button'
import { useFocusTrap } from '@/components/useFocusTrap'

const nav = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#features', label: 'Features' },
  { href: '/#who', label: "Who it's for" },
  { href: '/#packages', label: 'Packages' },
  { href: '/#faq', label: 'FAQ' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  useFocusTrap(sheetRef, open, () => setOpen(false))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => setOpen(false), [location])

  return (
    <header className={`sticky top-0 z-[60] transition-all ${scrolled ? 'bg-concrete/95 backdrop-blur border-b border-line shadow-sm' : 'bg-transparent'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-16 sm:h-[72px]">
        <Link to="/" aria-label="Gundy Consultations home" className="inline-flex items-center">
          <GundyLogo size="md" />
        </Link>
        <nav aria-label="Primary" className="hidden lg:flex items-center gap-7">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="text-sm font-medium text-ink/80 hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-4">
          <a href="/#consult" className="text-sm font-semibold text-blueprint hover:underline inline-flex items-center gap-1">
            Request a Private Demo <ArrowRight size={14} />
          </a>
          <LinkButton to="/#consult" size="md">Book a Free Consultation</LinkButton>
        </div>
        <button type="button" className="lg:hidden tap inline-flex items-center justify-center rounded-lg hover:bg-ink/5" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {open && createPortal(
        <div className="fixed inset-0 z-[95] lg:hidden" role="presentation">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <div ref={sheetRef} role="dialog" aria-modal="true" aria-label="Menu" tabIndex={-1} className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-paper shadow-lift flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-line">
              <GundyLogo size="sm" />
              <button type="button" className="tap inline-flex items-center justify-center rounded-lg hover:bg-ink/5" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex flex-col p-4 gap-1">
              {nav.map((n) => (
                <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="tap flex items-center rounded-lg px-3 text-base font-medium text-ink hover:bg-concrete">
                  {n.label}
                </a>
              ))}
              <a href="/#consult" onClick={() => setOpen(false)} className="tap flex items-center rounded-lg px-3 text-base font-semibold text-blueprint hover:bg-concrete">
                Request a Private Demo
              </a>
            </nav>
            <div className="mt-auto p-4 border-t border-line">
              <LinkButton to="/#consult" className="w-full" size="lg" onClick={() => setOpen(false)}>
                Book a Free Consultation
              </LinkButton>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  )
}

export function MobileCtaBar() {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-[55] border-t border-line bg-paper/95 backdrop-blur p-3 pb-[max(12px,env(safe-area-inset-bottom))] no-print">
      <div className="flex gap-2">
        <LinkButton to="/#packages" variant="outline" className="flex-1">See Packages</LinkButton>
        <LinkButton to="/#consult" className="flex-[1.4]">Book a Free Consultation</LinkButton>
      </div>
    </div>
  )
}
