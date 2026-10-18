import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { LandingPage } from './site/LandingPage'
import { SiteLayout } from './site/SiteLayout'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { NotFound } from './pages/NotFound'

const DemoApp = lazy(() => import('./demo/DemoApp'))

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])
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
          <Route path="/" element={<LandingPage />} />
          <Route element={<SiteLayout />}>
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Route>
          <Route path="/demo/*" element={<DemoApp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}
