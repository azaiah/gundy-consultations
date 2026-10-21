/**
 * Single source of truth for every business detail that is not yet confirmed.
 * Search this file for "TODO: confirm with Gundy" before launch.
 */

export const site = {
  name: 'Gundy Consultations',
  legalName: 'Gundy Consultations LLC', // TODO: confirm with Gundy (legal entity name)
  tagline: 'Your next contract is already posted. We find it.',
  domain: 'https://gundyconsultations.com',
  phone: '(615) 555-0100', // TODO: confirm with Gundy
  phoneHref: 'tel:+16155550100', // TODO: confirm with Gundy
  email: 'admin@gundyconsultations.com',
  address: {
    street: '4870 Sadler Road, Suite 300',
    city: 'Glen Allen',
    state: 'VA',
    stateName: 'Virginia',
    zip: '23060',
    country: 'USA',
  },
  serviceArea: 'United States (contractors in any state; permit-data coverage verified per county)', // TODO: confirm with Gundy
  hours: 'Mon to Fri, 8:00 AM to 6:00 PM ET', // TODO: confirm with Gundy
  founded: '2024', // TODO: confirm with Gundy
  social: {
    linkedin: '', // TODO: confirm with Gundy
    facebook: '', // TODO: confirm with Gundy
    instagram: '', // TODO: confirm with Gundy
  },
  consultationFormName: 'consultation',
  demoPath: '/demo',
} as const

export type PackageTier = {
  id: 'contracts' | 'growth' | 'foundation'
  name: string
  setup: number // USD, TODO: confirm with Gundy
  monthly: number // USD, TODO: confirm with Gundy
  cadence: string
  cadenceShort: string
  sweepsPerWeek: number
  highlight?: string
  audience: string
  features: string[]
  seats: string
}

/** Highest tier first on purpose: it is the price anchor. */
export const packages: PackageTier[] = [
  {
    id: 'contracts',
    name: 'Contracts',
    setup: 5000, // TODO: confirm with Gundy
    monthly: 399, // TODO: confirm with Gundy
    cadence: 'Daily sweeps, Monday through Friday',
    cadenceShort: 'Daily',
    sweepsPerWeek: 5,
    audience: 'Commercial GCs and specialty subs chasing public work',
    seats: 'Unlimited seats',
    features: [
      'Everything in Growth',
      'Daily bid and lead sweeps',
      'First 2 bids prepared with you, start to submission',
      'Capability statement and prequalification packet',
      'Outreach drafts to 50 local GCs and property managers',
      'Client portal on your own domain',
      'Unlimited seats',
      'Quarterly strategy call',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    setup: 1500, // TODO: confirm with Gundy
    monthly: 199, // TODO: confirm with Gundy
    cadence: 'Sweeps Monday, Wednesday and Friday',
    cadenceShort: 'Mon / Wed / Fri',
    sweepsPerWeek: 3,
    highlight: 'Most contractors start here',
    audience: 'Remodelers, roofers and growing subs',
    seats: '5 seats',
    features: [
      '3 sweeps per week with an outreach draft for every lead',
      'Full CRM: leads, customers, subcontractors, logs and to-dos',
      'Projects, checklists, punch lists and daily logs',
      'Estimator, proposals and change orders with e-signature',
      'Client portal',
      'Compliance vault with expiry alerts',
      'Invoicing and job costing',
      '5 seats',
    ],
  },
  {
    id: 'foundation',
    name: 'Foundation',
    setup: 999, // TODO: confirm with Gundy
    monthly: 99, // TODO: confirm with Gundy
    cadence: 'Weekly sweep with a bid digest',
    cadenceShort: 'Weekly',
    sweepsPerWeek: 1,
    audience: 'Solo operators getting organized',
    seats: '1 seat',
    features: [
      'Company Brain: trades, licenses, bonding, insurance, service area',
      'Weekly sweep and bid digest',
      'Conversion-focused website',
      'CRM for leads and customers',
      'Projects and scheduling',
      '1 seat',
    ],
  },
]

export const packageNotes = [
  'Annual prepay: 2 months free.', // TODO: confirm with Gundy
  'Setup fees credit toward an upgrade within the first 12 months.', // TODO: confirm with Gundy
  'All prices in USD. Taxes not included.',
]

export const setupTimeline = [
  { week: 'Weeks 1 to 2', title: 'Build', text: 'We build your website and configure the portal around your trades, licenses and service area.' },
  { week: 'Week 3', title: 'Load your data', text: 'Contacts, open jobs, price book, subs and their paperwork go in. The first sweep runs.' },
  { week: 'Week 4', title: 'Live', text: 'Your team is trained, outreach drafts are waiting for approval, and the website is on your domain.' },
]
