import { useDocumentMeta } from '@/components/useDocumentMeta'
import { Modules } from '../sections/Modules'
import { Website } from '../sections/Website'
import { SectionHeading } from '../motion'
import { DeviceShowcase, PageHero } from '../tech'
import { CtaBand, ScreenTour } from '../blocks'

export function PortalPage() {
  useDocumentMeta(
    'The Portal | Gundy Consultations',
    'One login runs the whole company: bids, leads, pipeline, outreach, projects, estimates, proposals, crews, compliance, invoicing and job costing, on desktop and phone.',
    '/portal',
  )
  return (
    <>
      <PageHero
        index="03"
        eyebrow="The portal"
        title={<>One login runs <span className="text-survey-light">the whole company.</span></>}
        text="Your bids, leads, jobs, crews, paperwork and money in one private system, built around your trades and your team. Desktop in the office, phone on the job site."
        aside={<DeviceShowcase />}
      />
      <section className="py-20 sm:py-28 bg-paper border-b border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="// Screen tour" title="Click through the real thing." text="These are actual screens from a sample company's portal. Yours is set up with your company, your trades and your people." />
          <div className="mt-12"><ScreenTour /></div>
        </div>
      </section>
      <Modules />
      <Website />
      <CtaBand title="Want the private demo?" text="Book a consultation and we will walk you through a portal built around a sample company in your trade, then run a sample sweep on your profile." />
    </>
  )
}
