import { useDocumentMeta } from '@/components/useDocumentMeta'
import { Faq } from '../sections/Faq'
import { PageHero } from '../tech'
import { CtaBand } from '../blocks'

export function FaqPage() {
  useDocumentMeta(
    'FAQ | Gundy Consultations',
    'Setup time, data ownership, cancelling, coverage areas, fit scores, security and what happens on the consultation call.',
    '/faq',
  )
  return (
    <>
      <PageHero index="06" eyebrow="FAQ" title={<>Questions contractors <span className="text-survey-light">ask us.</span></>} text="Straight answers on setup, ownership, cost and coverage. If yours is not here, ask it on the consultation call." />
      <Faq />
      <CtaBand />
    </>
  )
}
