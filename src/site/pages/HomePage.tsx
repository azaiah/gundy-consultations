import { useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { useDocumentMeta } from '@/components/useDocumentMeta'
import { LinkButton } from '@/components/Button'
import { site } from '@/config/site'
import { Hero } from '../sections/Hero'
import { Problem } from '../sections/Problem'
import { SectionHeading } from '../motion'
import { SweepTicker, SweepTerminal } from '../tech'
import { CtaBand, PackagesTeaser, Pillars, ScreenTour } from '../blocks'

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
    return () => { el.remove() }
  }, [])
}

export function HomePage() {
  useDocumentMeta(
    'Gundy Consultations | Leads, Bids and a Business OS for Contractors',
    'A website that wins trust plus a portal that finds public bids and local leads every week, drafts the outreach, and runs the jobs. Built for remodelers, roofers, GCs and specialty subs.',
    '/',
  )
  useJsonLd()
  return (
    <>
      <Hero />
      <SweepTicker />
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="// What it does" title="Built for the job site. Engineered like software." text="A construction company runs on three things: finding work, winning it and running it. The portal handles all three, so your office stops living in eight browser tabs and a notebook." />
          <div className="mt-12"><Pillars /></div>
        </div>
      </section>
      <section className="py-20 sm:py-28 bg-ink text-white bg-blueprint-grid-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading dark eyebrow="// Inside the portal" title="This is what your office runs on." text="Real screens from a sample company portal. Same system on the laptop in the office and the phone in the truck." />
          <div className="mt-12"><ScreenTour dark /></div>
          <div className="mt-10"><LinkButton to="/portal" size="lg" icon={<ArrowRight size={18} />} className="flex-row-reverse">Explore every module</LinkButton></div>
        </div>
      </section>
      <Problem />
      <section className="py-20 sm:py-28 bg-paper border-y border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading eyebrow="// While you sleep" title="Every sweep, stamped and logged." text="On your schedule, the engine checks public portals, GC invitations and local permits, scores every find against your credentials and drafts the outreach. You wake up to a short list and an approve button." />
            <div className="mt-8"><LinkButton to="/how-it-works" size="lg" variant="dark" icon={<ArrowRight size={18} />} className="flex-row-reverse">How it works</LinkButton></div>
          </div>
          <SweepTerminal />
        </div>
      </section>
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="// Packages" title="Pick the cadence that matches how much work you want." text="Every package includes the website, the portal and the Company Brain. The difference is how often we sweep and how much we prepare for you." />
          <div className="mt-12"><PackagesTeaser /></div>
        </div>
      </section>
      <CtaBand />
    </>
  )
}
