import { useDocumentMeta } from '@/components/useDocumentMeta'
import { ConsultForm } from '../sections/ConsultForm'

export function ContactPage() {
  useDocumentMeta(
    'Book a Free Consultation | Gundy Consultations',
    'Thirty minutes. We check permit coverage in your counties and run a sample sweep against your trades and credentials before you decide anything.',
    '/contact',
  )
  return <ConsultForm asPage />
}
