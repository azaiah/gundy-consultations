import { Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { SiteLayout } from './site/SiteLayout'
import { HomePage } from './site/pages/HomePage'
import { HowItWorksPage } from './site/pages/HowItWorksPage'
import { PortalPage } from './site/pages/PortalPage'
import { WhoPage } from './site/pages/WhoPage'
import { PricingPage } from './site/pages/PricingPage'
import { FaqPage } from './site/pages/FaqPage'
import { ContactPage } from './site/pages/ContactPage'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { NotFound } from './pages/NotFound'

/** Old single-page anchors (shared links, texts, business cards) now live on their own pages. */
const LEGACY: Record<string, string> = {
  '#how-it-works': '/how-it-works',
  '#features': '/portal',
  '#who': '/who-we-serve',
  '#packages': '/pricing',
  '#faq': '/faq',
  '#consult': '/contact',
}

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (pathname === '/' && hash && LEGACY[hash]) {
      navigate(LEGACY[hash], { replace: true })
      return
    }
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash, navigate])
  return null
}

function Loading() {
  return (
    <div className="min-h-screen bg-concrete flex items-center justify-center" role="status" aria-live="polite">
      <div className="text-center">
        <div className="mx-auto mb-3 h-1 w-40 overflow-hidden rounded bg-line">
          <div className="h-full w-1/2 bg-survey animate-shimmer" />
        </div>
        <p className="stamp">Loading</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/portal" element={<PortalPage />} />
            <Route path="/who-we-serve" element={<WhoPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}
