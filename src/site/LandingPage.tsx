import { useEffect } from 'react'
import { useDocumentMeta } from '@/components/useDocumentMeta'
import { ScrollProgress } from '@/components/ScrollProgress'
import { site } from '@/config/site'
import { SiteHeader, MobileCtaBar } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { TickDivider } from './motion'
import { Hero } from './sections/Hero'
import { Sources } from './sections/Sources'
import { Problem } from './sections/Problem'
import { HowItWorks } from './sections/HowItWorks'
import { BidsVsLeads } from './sections/BidsVsLeads'
import { Modules } from './sections/Modules'
import { WhoItsFor } from './sections/WhoItsFor'
import { Website } from './sections/Website'
import { Packages } from './sections/Packages'
import { Promises } from './sections/Promises'
import { Faq } from './sections/Faq'
import { ConsultForm } from './sections/ConsultForm'

function useJsonLd() {
  useEffect(() => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: site.name,
      legalName: site.legalName,
      url: site.domain,
      telephone: site.phone,
      email: site.email,
      description: 'Leads, bids and a business operating system for contractors and construction companies: a conversion-focused website plus a private portal that finds public bids and local leads, drafts outreach and runs the jobs.',
      address: { '@type': 'PostalAddress', streetAddress: site.address.street, addressLocality: site.address.city, addressRegion: site.address.state, postalCode: site.address.zip, addressCountry: 'US' },
      areaServed: 'US',
      openingHours: site.hours,
      foundingDate: site.founded,
    }
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.text = JSON.stringify(data)
    document.head.appendChild(el)
    return () => {
      el.remove()
    }
  }, [])
}

export function LandingPage() {
  useDocumentMeta(
    'Gundy Consultations | Leads, Bids and a Business OS for Contractors',
    'A website that wins trust plus a portal that finds public bids and local leads every week, drafts the outreach, and runs the jobs. Built for remodelers, roofers, GCs and specialty subs.',
  )
  useJsonLd()
  return (
    <div className="min-h-screen flex flex-col pb-20 lg:pb-0">
      <ScrollProgress />
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <Sources />
        <Problem />
        <HowItWorks />
        <BidsVsLeads />
        <TickDivider />
        <Modules />
        <WhoItsFor />
        <Website />
        <Packages />
        <Promises />
        <Faq />
        <ConsultForm />
      </main>
      <SiteFooter />
      <MobileCtaBar />
    </div>
  )
}
