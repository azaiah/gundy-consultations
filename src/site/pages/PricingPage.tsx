import { Link } from 'react-router-dom'
import { useDocumentMeta } from '@/components/useDocumentMeta'
import { Packages } from '../sections/Packages'
import { PageHero } from '../tech'
import { CtaBand, SetupTimeline } from '../blocks'

export function PricingPage() {
  useDocumentMeta(
    'Packages and Pricing | Gundy Consultations',
    'Contracts, Growth and Foundation packages. Every package includes the website, the portal and the Company Brain; the difference is how often we sweep and how much we prepare.',
    '/pricing',
  )
  return (
    <>
      <PageHero
        index="05"
        eyebrow="Packages"
        title={<>Pick the cadence that matches <span className="text-survey-light">how much work you want.</span></>}
        text="Every package includes the website, the portal and the Company Brain. The difference is how often we sweep and how much we prepare for you."
      />
      <Packages heading={false} />
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SetupTimeline />
          <p className="mt-6 text-steel">Questions about setup, data ownership or cancelling? <Link to="/faq" className="font-semibold text-survey hover:underline">Read the FAQ</Link>.</p>
        </div>
      </section>
      <CtaBand />
    </>
  )
}
