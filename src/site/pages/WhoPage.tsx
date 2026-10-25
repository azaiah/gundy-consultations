import { useDocumentMeta } from '@/components/useDocumentMeta'
import { WhoItsFor } from '../sections/WhoItsFor'
import { Sources } from '../sections/Sources'
import { PageHero } from '../tech'
import { CtaBand } from '../blocks'

export function WhoPage() {
  useDocumentMeta(
    "Who We Serve | Gundy Consultations",
    'Residential remodelers and roofers who are done paying for shared leads, and commercial GCs and specialty subs who never want to miss a bid they qualify for.',
    '/who-we-serve',
  )
  return (
    <>
      <PageHero
        index="04"
        eyebrow="Who we serve"
        title={<>Two buyers. One product. <span className="text-survey-light">Different switches on.</span></>}
        text="Remodelers and roofers want homeowners who have already decided to build. GCs and specialty subs want public work that matches their bonding and certifications. The portal does both."
      />
      <Sources />
      <WhoItsFor />
      <CtaBand />
    </>
  )
}
