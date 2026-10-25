import { Outlet } from 'react-router-dom'
import { ScrollProgress } from '@/components/ScrollProgress'
import { SiteHeader, MobileCtaBar } from './SiteHeader'
import { SiteFooter } from './SiteFooter'

export function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col pb-20 lg:pb-0">
      <ScrollProgress />
      <SiteHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <MobileCtaBar />
    </div>
  )
}
