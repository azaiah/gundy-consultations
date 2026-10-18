import { useDocumentMeta } from '@/components/useDocumentMeta'
import { site } from '@/config/site'
import { PolicyLayout } from './PolicyLayout'

export function Privacy() {
  useDocumentMeta('Privacy Policy | Gundy Consultations', 'How Gundy Consultations collects, uses and protects information from website visitors and portal users.')
  const updated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <PolicyLayout title="Privacy Policy" updated={updated}>
      <p>
        {site.legalName} ("Gundy", "we", "us") operates the website at {site.domain} and the private portal we configure for our clients (together, the "Services"). This policy explains what we collect, why, and the choices you have.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li><strong>Information you give us.</strong> Name, company, trade, service area, phone, email and any message you submit through our consultation form or by contacting us.</li>
        <li><strong>Client business data.</strong> When you become a client, the data you load into your portal: contacts, projects, estimates, documents, licenses, insurance certificates and similar business records. This data belongs to you.</li>
        <li><strong>Public records we gather for you.</strong> Bid solicitations, permit filings and similar public information collected on your behalf during scheduled sweeps.</li>
        <li><strong>Technical data.</strong> IP address, browser type, pages visited and approximate timing, collected by our hosting provider's standard logs. We do not use third-party advertising trackers.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To respond to consultation requests and deliver the Services you buy.</li>
        <li>To run sweeps, score opportunities and draft outreach inside your portal, at your direction.</li>
        <li>To secure, maintain and improve the Services.</li>
        <li>To send service notices. We send marketing email only if you opt in, and every message includes an unsubscribe link.</li>
      </ul>
      <h2>Artificial intelligence features</h2>
      <p>
        Some portal features (auto-fill, message drafting, the help assistant) send the text you choose to generate to a third-party language model provider through our secure server. We send only what is needed for that request, we do not permit the provider to train on your data, and we never send credentials or payment information. Each result is labelled as "Live AI" or "Demo output" so you always know which one ran.
      </p>
      <h2>Sharing</h2>
      <p>
        We do not sell personal information. We share data only with service providers who help us operate (hosting, form handling, email delivery, AI processing), under contracts that restrict their use of it; with your explicit direction (for example, when you approve an outreach email); or when required by law.
      </p>
      <h2>Retention and your rights</h2>
      <p>
        We keep consultation requests for up to 24 months. Client portal data is retained for the life of the account and exported to you on request or at cancellation, then deleted within 90 days. You may request access, correction or deletion of your personal information at any time by emailing <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <h2>Security</h2>
      <p>Data is encrypted in transit and at rest. Portal access is role-based, so clients and subcontractors see only what their role allows. No system is perfectly secure; if we learn of a breach affecting your data, we will notify you without undue delay.</p>
      <h2>Cookies and local storage</h2>
      <p>The public website uses no advertising cookies. The demo portal stores its sample data in your browser's local storage so your changes persist between visits on that device; "Reset Demo" clears it.</p>
      <h2>Children</h2>
      <p>The Services are for businesses and are not directed to anyone under 18.</p>
      <h2>Changes and contact</h2>
      <p>
        We will post any changes here with a new "last updated" date. Questions: <a href={`mailto:${site.email}`}>{site.email}</a>, {site.phone}, or {site.address.street}, {site.address.city}, {site.address.state} {site.address.zip}.
      </p>
    </PolicyLayout>
  )
}
