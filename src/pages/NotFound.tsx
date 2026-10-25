import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { GundyLogo } from '@/components/GundyLogo'
import { LinkButton } from '@/components/Button'
import { useDocumentMeta } from '@/components/useDocumentMeta'

export function NotFound() {
  useDocumentMeta('Page not found | Gundy Consultations')
  return (
    <main className="min-h-screen bg-ink text-white bg-blueprint-grid-dark flex flex-col">
      <div className="p-5">
        <Link to="/" aria-label="Gundy Consultations home"><GundyLogo variant="light" /></Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 text-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-survey-light">Error 404 · Not on the plans</p>
          <h1 className="display text-7xl sm:text-9xl mt-4">Off the grid</h1>
          <p className="mt-4 text-white/70 max-w-md mx-auto">This page is not in the drawing set. The address may have changed, or the link was mistyped.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <LinkButton to="/" icon={<ArrowLeft size={18} />}>Back to the site</LinkButton>
            <LinkButton to="/contact" variant="outline" className="!bg-transparent !text-white !border-white/30">Book a Free Consultation</LinkButton>
          </div>
        </div>
      </div>
    </main>
  )
}
