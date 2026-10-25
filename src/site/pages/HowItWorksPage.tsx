import { useDocumentMeta } from '@/components/useDocumentMeta'
import { HowItWorks } from '../sections/HowItWorks'
import { BidsVsLeads } from '../sections/BidsVsLeads'
import { Promises } from '../sections/Promises'
import { PageHero, SweepTerminal } from '../tech'
import { CtaBand, SetupTimeline } from '../blocks'

export function HowItWorksPage() {
  useDocumentMeta(
    'How It Works | Gundy Consultations',
    'Six steps every week: the Company Brain knows your credentials, the engine sweeps public bids and permits, scores every find, drafts the outreach and waits for your approval.',
    '/how-it-works',
  )
  return (
    <>
      <PageHero
        index="02"
        eyebrow="How it works"
        title={<>Six steps. Every week. <span className="text-survey-light">Zero chasing.</span></>}
        text="Think of it as a measuring tape laid across your week. Each tick is a step the system takes for you, and nothing goes out until you approve it."
        aside={<SweepTerminal />}
      />
      <HowItWorks />
      <BidsVsLeads />
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6"><SetupTimeline /></div>
      </section>
      <Promises />
      <CtaBand />
    </>
  )
}
