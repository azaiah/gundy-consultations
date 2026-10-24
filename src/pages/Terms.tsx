import { useDocumentMeta } from '@/components/useDocumentMeta'
import { site } from '@/config/site'
import { PolicyLayout } from './PolicyLayout'

export function Terms() {
  useDocumentMeta('Terms of Service | Gundy Consultations', 'Terms governing use of the Gundy Consultations website, demos and client portal services.')
  const updated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <PolicyLayout title="Terms of Service" updated={updated}>
      <p>These terms govern your use of the {site.name} website, any demo we share with you, and, together with your signed service agreement, the client portal services provided by {site.legalName}.</p>
      <h2>Demos</h2>
      <p>Any demo portal we share with you shows a fictional sample company. All names, bids, permits, contacts and figures in it are invented for illustration. Nothing in the demo is a real solicitation, a real lead, or a representation of results you will achieve.</p>
      <h2>Services and setup</h2>
      <ul>
        <li>Services are described in your service agreement and the package you select. Setup fees are due before build begins and are non-refundable once build starts; they credit toward an upgrade within 12 months.</li>
        <li>Monthly fees are billed in advance. Monthly plans may be cancelled with 30 days written notice. Annual prepaid plans run their full term.</li>
        <li>Sweep cadence (weekly, three times weekly, or daily) is as stated in your package. A sweep checks the sources enabled in your account and reports what it found, including sources that returned nothing or could not be read on that run.</li>
      </ul>
      <h2>No guarantee of outcomes</h2>
      <p>We find, score and draft. We do not guarantee that any bid will be awarded, that any lead will convert, or a minimum number of leads, because public records and portal availability vary by jurisdiction. We will tell you what coverage exists in your area before you buy.</p>
      <h2>Your responsibilities</h2>
      <ul>
        <li>Keep your Company Brain accurate. Scores depend on the licenses, bonding, insurance and certifications you enter.</li>
        <li>Review and approve every outreach draft before it is sent. You are responsible for the content of communications sent from your account.</li>
        <li>Verify bid requirements, deadlines and addenda against the original solicitation. Our summaries assist; they do not replace the source documents.</li>
        <li>Use the Services lawfully, including compliance with procurement rules, anti-spam laws and licensing requirements in your jurisdiction.</li>
      </ul>
      <h2>Third-party plan rooms and paid sources</h2>
      <p>We do not scrape paid plan rooms or services that prohibit automated access. If you hold a subscription, we may work through your own login at your direction and subject to that service's terms.</p>
      <h2>Documents and signatures</h2>
      <p>Generated documents (proposals, change orders, invoices, pay applications, capability statements, checklists) are templates populated with your data. You are responsible for their accuracy and for compliance with any form, lien or payroll requirements in your state. The demo signature pad is illustrative; a legally binding e-signature provider is offered in the live service as described in your agreement.</p>
      <h2>Data ownership</h2>
      <p>You own the data you load into your portal and the records gathered on your behalf. You grant us a limited license to process it to provide the Services. We will export your data to you on request and at termination.</p>
      <h2>Intellectual property</h2>
      <p>The portal software, templates, scoring methods and website designs remain the property of {site.legalName} and its licensors. Your website content, brand and photographs remain yours.</p>
      <h2>Limitation of liability</h2>
      <p>To the fullest extent permitted by law, our total liability arising from the Services in any 12-month period is limited to the fees you paid us in that period. We are not liable for indirect, incidental or consequential damages, including lost bids, lost profits or missed deadlines.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the State of {site.address.stateName}, without regard to conflict-of-law rules. Disputes will be resolved in the state or federal courts located in {site.address.city}, {site.address.state}.</p>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${site.email}`}>{site.email}</a> or {site.phone}.
      </p>
    </PolicyLayout>
  )
}
