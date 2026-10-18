import type { Opportunity, Sweep, Outreach } from '../types'
import { addDays, addHours, iso, ymd } from '../lib/dates'

const t = new Date()
const dYmd = (days: number) => ymd(addDays(t, days))
const at = (days: number, hour: number, minute = 0) => {
  const x = addDays(t, days)
  x.setHours(hour, minute, 0, 0)
  return iso(x)
}

// Sweep timestamps: last 4 runs on a Mon/Wed/Fri cadence ending before today.
function recentSweepTimes(): { start: string; finish: string }[] {
  const out: { start: string; finish: string }[] = []
  let d = 0
  while (out.length < 4) {
    const day = addDays(t, -d)
    const dow = day.getDay()
    if (dow === 1 || dow === 3 || dow === 5) {
      const s = new Date(day)
      s.setHours(6, 0, 0, 0)
      if (s.getTime() < t.getTime()) out.push({ start: iso(s), finish: iso(addHours(s, 0.31)) })
    }
    d += 1
    if (d > 20) break
  }
  return out.reverse()
}
const sweepTimes = recentSweepTimes()
const s4 = sweepTimes[3] ?? { start: at(-1, 6), finish: at(-1, 6, 18) }
const s3 = sweepTimes[2] ?? { start: at(-3, 6), finish: at(-3, 6, 18) }
const s2 = sweepTimes[1] ?? { start: at(-5, 6), finish: at(-5, 6, 18) }
const s1 = sweepTimes[0] ?? { start: at(-8, 6), finish: at(-8, 6, 18) }

const base = (o: Partial<Opportunity> & Pick<Opportunity, 'id' | 'kind' | 'title' | 'owner' | 'source' | 'trade' | 'estValue' | 'county' | 'distanceMiles'>): Opportunity => ({
  requiredTrades: [o.trade],
  bondRequired: false,
  prevailingWage: false,
  setAside: 'None',
  scopeSummary: '',
  whyFits: [],
  whyNot: [],
  addenda: [],
  documents: [],
  status: 'new',
  foundAt: s4.finish,
  sweepId: 'sw4',
  lastTouchedAt: s4.finish,
  notes: '',
  ...o,
})

export function seedOpportunities(): Opportunity[] {
  return [
    // ---------------- BIDS (14) ----------------
    base({
      id: 'b1', kind: 'bid', title: 'Fire Station 19 Kitchen and Dayroom Renovation', owner: 'Metro Nashville Government', source: 'Metro Nashville Procurement', sourceUrl: 'https://www.nashville.gov/departments/procurement',
      trade: 'General contractor', estValue: 285_000, dueDate: dYmd(11), preBidDate: dYmd(3), bondRequired: true, prevailingWage: true, county: 'Davidson', distanceMiles: 7,
      scopeSummary: 'Demolish and rebuild the kitchen and dayroom in an occupied fire station: new cabinetry, commercial range hood, flooring, lighting, paint, and ADA restroom upgrade. Phased to keep the station operational.',
      whyFits: ['Inside Davidson County and 7 miles from the shop', 'Interior renovation in an occupied building matches past work', 'Value sits inside bonding and typical range'],
      whyNot: ['Davis-Bacon wages apply; confirm certified payroll process', 'Phasing in an occupied station adds coordination'],
      addenda: [{ id: 'ad1', number: 1, date: dYmd(-2), summary: 'Clarified that the range hood fire suppression is by owner.' }],
      documents: [{ id: 'doc1', name: 'Solicitation 26-0411 Plans and Specs', type: 'Plan set (placeholder link)' }, { id: 'doc2', name: 'Bid Form', type: 'PDF (placeholder link)' }],
      draftResponse: 'Cumberland Ridge Builders is pleased to submit our qualifications for the Fire Station 19 Kitchen and Dayroom Renovation. We are a Tennessee BC-A licensed general contractor based 7 miles from the station, bonded to $750,000 single and $2,000,000 aggregate, with recent occupied-building renovation experience including the Berry Hill Dental Office Build-Out and Metro Parks shelter work.',
      status: 'pipeline', stage: 'estimating', foundAt: s2.finish, sweepId: 'sw2', lastTouchedAt: at(-1, 15), pipelineAmount: 285_000,
    }),
    base({
      id: 'b2', kind: 'bid', title: 'Interior Fit-Out, 12,400 SF Medical Office Suite', owner: 'Harpeth Valley Construction (GC)', source: 'GC Invitation to Bid',
      trade: 'Interior finishes', requiredTrades: ['Interior finishes', 'Carpentry'], estValue: 410_000, dueDate: dYmd(6), preBidDate: dYmd(1), bondRequired: false, county: 'Williamson', distanceMiles: 16,
      scopeSummary: 'Framing, drywall, ACT ceilings, millwork, doors and hardware, and finishes for a 12,400 SF medical suite in Cool Springs. GC self-performs MEP coordination.',
      whyFits: ['Repeat GC relationship; they invited you directly', 'Scope is interior finishes, your strongest trade', 'No bond required'],
      whyNot: ['Six days to bid; plans are 140 sheets', 'Harpeth typically expects 2 percent retainage held 60 days'],
      documents: [{ id: 'doc3', name: 'ITB Package from Harpeth Valley', type: 'Email attachment (placeholder)' }],
      status: 'reviewing', foundAt: s3.finish, sweepId: 'sw3', lastTouchedAt: at(-2, 9),
    }),
    base({
      id: 'b3', kind: 'bid', title: 'Reroof of Maintenance Building B, Tennessee National Guard', owner: 'State of Tennessee', source: 'State of Tennessee CPO', sourceUrl: 'https://www.tn.gov/generalservices/procurement.html',
      trade: 'Roofing', estValue: 162_000, dueDate: dYmd(18), preBidDate: dYmd(7), bondRequired: true, prevailingWage: true, setAside: 'State small business', county: 'Rutherford', distanceMiles: 31,
      scopeSummary: 'Tear-off and replacement of 18,000 SF standing-seam metal roof, new gutters and downspouts, and fall-protection anchors.',
      whyFits: ['Set aside for state small business, which you hold', 'Roofing license current', 'Rutherford is a home county'],
      whyNot: ['Metal roof tear-off at height requires a certified crew lead', 'Prevailing wage'],
      status: 'new', foundAt: s4.finish, sweepId: 'sw4', lastTouchedAt: s4.finish,
    }),
    base({
      id: 'b4', kind: 'bid', title: 'Elementary School Restroom Renovations (4 schools)', owner: 'Metro Nashville Public Schools', source: 'Metro Nashville Public Schools',
      trade: 'General contractor', estValue: 690_000, dueDate: dYmd(24), preBidDate: dYmd(9), bondRequired: true, prevailingWage: false, county: 'Davidson', distanceMiles: 12,
      scopeSummary: 'Renovate 16 student restrooms across four elementary schools during summer break: plumbing fixtures, partitions, tile, lighting and ADA compliance.',
      whyFits: ['Summer schedule fits crew availability', 'Within bonding single limit'],
      whyNot: ['Four simultaneous sites stretch supervision', 'Aggregate bonding room is tight with Fire Station 19 open'],
      status: 'new', foundAt: s4.finish, sweepId: 'sw4', lastTouchedAt: s4.finish,
    }),
    base({
      id: 'b5', kind: 'bid', title: 'Napier Place Unit Turnovers, 24 Units', owner: 'MDHA (Metropolitan Development and Housing Agency)', source: 'MDHA',
      trade: 'General contractor', estValue: 318_000, dueDate: dYmd(14), bondRequired: true, prevailingWage: true, setAside: 'None', county: 'Davidson', distanceMiles: 5,
      scopeSummary: 'Make-ready renovation of 24 vacant public housing units: paint, flooring, kitchens, baths, and lead-safe practices required.',
      whyFits: ['EPA RRP certification required and held', '5 miles from the shop', 'Repeatable unit scope suits crew'],
      whyNot: ['HUD Section 3 hiring reporting', 'Davis-Bacon residential rates'],
      status: 'pipeline', stage: 'qualified', foundAt: s3.finish, sweepId: 'sw3', lastTouchedAt: at(-2, 11), pipelineAmount: 318_000,
    }),
    base({
      id: 'b6', kind: 'bid', title: 'Williamson County Ag Expo Park Restroom Building', owner: 'Williamson County Government', source: 'Williamson County',
      trade: 'General contractor', estValue: 540_000, dueDate: dYmd(29), preBidDate: dYmd(12), bondRequired: true, prevailingWage: false, county: 'Williamson', distanceMiles: 22,
      scopeSummary: 'New 1,800 SF CMU restroom and concession building with site utilities and concrete apron.',
      whyFits: ['Williamson is a home county', 'New construction within bonding'],
      whyNot: ['Masonry sub license has lapsed; TV Concrete cannot be assigned until renewed', 'Site utilities are outside typical scope'],
      status: 'new', foundAt: s4.finish, sweepId: 'sw4', lastTouchedAt: s4.finish,
    }),
    base({
      id: 'b7', kind: 'bid', title: 'Rutherford County Courthouse Annex Window Replacement', owner: 'Rutherford County Government', source: 'Rutherford County',
      trade: 'Glazing', requiredTrades: ['Glazing'], estValue: 215_000, dueDate: dYmd(9), bondRequired: true, prevailingWage: false, county: 'Rutherford', distanceMiles: 33,
      scopeSummary: 'Replace 86 aluminum windows in a 1970s annex with thermally broken units; historic review required on the street elevation.',
      whyFits: ['Rutherford is a home county'],
      whyNot: ['Requires a glazing contractor; not a trade in the Company Brain'],
      status: 'new', foundAt: s4.finish, sweepId: 'sw4', lastTouchedAt: s4.finish,
    }),
    base({
      id: 'b8', kind: 'bid', title: 'Fort Campbell Barracks Latrine Renovation, Phase 3', owner: 'US Army Corps of Engineers', source: 'SAM.gov', sourceUrl: 'https://sam.gov/',
      trade: 'General contractor', estValue: 1_900_000, dueDate: dYmd(21), preBidDate: dYmd(8), bondRequired: true, prevailingWage: true, setAside: 'SDVOSB', county: 'Montgomery', distanceMiles: 58,
      scopeSummary: 'Renovate latrines in three barracks buildings including plumbing, tile, partitions and ventilation.',
      whyFits: ['Interior renovation scope'],
      whyNot: ['Set aside for SDVOSB, not held', 'Exceeds single bonding limit of $750,000'],
      status: 'no_bid', noBidReason: 'Set-aside and bonding limit', foundAt: s2.finish, sweepId: 'sw2', lastTouchedAt: at(-4, 10),
    }),
    base({
      id: 'b9', kind: 'bid', title: 'Brentwood Office Park Lobby Refresh (3 buildings)', owner: 'Stonebridge Builders (GC)', source: 'GC Invitation to Bid',
      trade: 'Interior finishes', requiredTrades: ['Interior finishes'], estValue: 128_000, dueDate: dYmd(4), bondRequired: false, county: 'Williamson', distanceMiles: 14,
      scopeSummary: 'Lobby finishes in three occupied office buildings: millwork reception desks, stone flooring, feature wall, lighting. Night work.',
      whyFits: ['Direct GC invitation', 'Finishes scope'],
      whyNot: ['Four days to bid', 'Night work premium'],
      status: 'pipeline', stage: 'submitted', foundAt: s1.finish, sweepId: 'sw1', lastTouchedAt: at(-1, 16), pipelineAmount: 131_500,
    }),
    base({
      id: 'b10', kind: 'bid', title: 'Metro Parks Shelby Bottoms Nature Center Deck Replacement', owner: 'Metro Nashville Government', source: 'Metro Nashville Procurement',
      trade: 'Carpentry', requiredTrades: ['Carpentry'], estValue: 74_000, dueDate: dYmd(-3), bondRequired: false, county: 'Davidson', distanceMiles: 6,
      scopeSummary: 'Replace 2,400 SF elevated composite deck and railings at the nature center.',
      whyFits: ['Past Metro Parks work', 'Small carpentry scope'],
      whyNot: ['Deadline passed'],
      status: 'pipeline', stage: 'won', foundAt: at(-30, 6, 19), sweepId: 'sw0', lastTouchedAt: at(-6, 9), pipelineAmount: 76_800,
    }),
    base({
      id: 'b11', kind: 'bid', title: 'Sumner County Library Branch Interior Renovation', owner: 'Sumner County Government', source: 'State of Tennessee CPO',
      trade: 'General contractor', estValue: 365_000, dueDate: dYmd(35), preBidDate: dYmd(16), bondRequired: true, prevailingWage: false, county: 'Sumner', distanceMiles: 27,
      scopeSummary: 'Interior renovation of a 9,000 SF library branch: circulation desk, carpet, paint, lighting, ADA restrooms, and a new teen room.',
      whyFits: ['Sumner is a home county', 'Interior renovation'],
      whyNot: ['Library stays open; phasing required'],
      status: 'new', foundAt: s4.finish, sweepId: 'sw4', lastTouchedAt: s4.finish,
    }),
    base({
      id: 'b12', kind: 'bid', title: 'Tenant Improvement, Suite 240, 8,200 SF Law Office', owner: 'Cornerstone Commercial (GC)', source: 'GC Invitation to Bid',
      trade: 'Carpentry', requiredTrades: ['Carpentry', 'Interior finishes'], estValue: 96_000, dueDate: dYmd(-12), bondRequired: false, county: 'Davidson', distanceMiles: 4,
      scopeSummary: 'Millwork, doors, hardware, and finish carpentry for a law office suite.',
      whyFits: ['Downtown, 4 miles', 'Finish carpentry'],
      whyNot: [],
      status: 'pipeline', stage: 'lost', foundAt: at(-40, 6, 19), sweepId: 'sw0', lastTouchedAt: at(-14, 13), pipelineAmount: 98_400,
    }),
    base({
      id: 'b13', kind: 'bid', title: 'Metro Nashville Public Schools Portable Classroom Ramps and Decks', owner: 'Metro Nashville Public Schools', source: 'Metro Nashville Public Schools',
      trade: 'Carpentry', requiredTrades: ['Carpentry'], estValue: 58_000, dueDate: dYmd(13), bondRequired: false, county: 'Davidson', distanceMiles: 9,
      scopeSummary: 'Build ADA ramps and decks for six portable classrooms at two schools.',
      whyFits: ['Simple carpentry scope', 'No bond'],
      whyNot: ['Low value for the paperwork involved'],
      status: 'new', foundAt: s3.finish, sweepId: 'sw3', lastTouchedAt: s3.finish,
    }),
    base({
      id: 'b14', kind: 'bid', title: 'MDHA Scattered-Site Roof Replacements (11 homes)', owner: 'MDHA (Metropolitan Development and Housing Agency)', source: 'MDHA',
      trade: 'Roofing', requiredTrades: ['Roofing'], estValue: 143_000, dueDate: dYmd(8), bondRequired: true, prevailingWage: true, county: 'Davidson', distanceMiles: 8,
      scopeSummary: 'Asphalt shingle roof replacement on 11 single-family scattered-site homes, including decking repair allowance.',
      whyFits: ['Roofing license current', 'Lead-safe certification held'],
      whyNot: ['Rudd Roofing COI expires in 6 days', 'Davis-Bacon residential rates'],
      status: 'pipeline', stage: 'site_visit', foundAt: s2.finish, sweepId: 'sw2', lastTouchedAt: at(-9, 10), pipelineAmount: 143_000,
    }),

    // ---------------- PERMIT LEADS (10) + other private leads ----------------
    base({
      id: 'p1', kind: 'lead', title: 'Residential Addition Permit, 2214 Golf Club Ln', owner: 'Priya Natarajan', source: 'Metro Codes Permit', sourceUrl: 'https://www.nashville.gov/departments/codes',
      trade: 'General contractor', estValue: 148_000, county: 'Davidson', distanceMiles: 6, address: '2214 Golf Club Ln, Nashville, TN 37215',
      permit: { number: 'CARN-2026-01188', type: 'Residential Addition and Remodel', valuation: 148_000, filedDate: dYmd(-1), applicant: 'Priya Natarajan (owner)' },
      scopeSummary: 'Owner-filed permit for a 420 SF rear addition with kitchen remodel. No contractor listed on the permit yet.',
      whyFits: ['Owner-filed with no contractor of record', 'Green Hills, 6 miles', 'Kitchen and addition matches past projects'],
      whyNot: ['Owner may be pricing with several contractors'],
      draftResponse: 'Hi Priya, I noticed the permit for your addition at Golf Club Lane. We completed a very similar kitchen and primary-suite project in Green Hills last year, and I would be glad to walk the plans with you and give you a real number within a week.',
      draftCallScript: 'Hi Priya, this is from Cumberland Ridge Builders here in Nashville. I saw your addition permit was filed this week. Do you already have a builder lined up, or are you still pricing it?',
      status: 'reviewing', foundAt: s4.finish, sweepId: 'sw4', lastTouchedAt: s4.finish,
    }),
    base({
      id: 'p2', kind: 'lead', title: 'Roof Replacement Permit, 118 Woodmont Blvd', owner: 'Bell Family Trust', source: 'Metro Codes Permit',
      trade: 'Roofing', estValue: 32_000, county: 'Davidson', distanceMiles: 8, address: '118 Woodmont Blvd, Nashville, TN 37205',
      permit: { number: 'CARR-2026-00921', type: 'Roof Replacement', valuation: 32_000, filedDate: dYmd(-2), applicant: 'Bell Family Trust' },
      scopeSummary: 'Roof replacement on a 1950s brick ranch, likely hail-related.', whyFits: ['Roofing license current', 'Close to shop'], whyNot: ['Small job'],
      status: 'new', foundAt: s4.finish, sweepId: 'sw4', lastTouchedAt: s4.finish,
    }),
    base({
      id: 'p3', kind: 'lead', title: 'Commercial Build-Out, Esposito Dental, Maryland Way', owner: 'Esposito Dental', source: 'Commercial Build-Out',
      trade: 'General contractor', estValue: 390_000, county: 'Williamson', distanceMiles: 15, address: '5110 Maryland Way, Brentwood, TN 37027',
      scopeSummary: 'New dental practice leased 3,100 SF shell space; build-out permit application pending. Six operatories.',
      whyFits: ['Berry Hill Dental Office Build-Out is a direct reference', 'Brentwood, 15 miles'], whyNot: ['Landlord may require an approved GC list'],
      draftResponse: 'Dr. Esposito, congratulations on the Maryland Way space. We built out the Berry Hill dental office last year, six operatories with medical gas and lead-lined walls, and finished two weeks ahead of the opening date. I would welcome the chance to look at your plans.',
      status: 'pipeline', stage: 'site_visit', foundAt: s4.finish, sweepId: 'sw4', lastTouchedAt: at(0, 8), pipelineAmount: 390_000,
    }),
    base({
      id: 'p4', kind: 'lead', title: 'Residential Remodel Permit, 1411 Ashwood Ave', owner: 'Anita Shah', source: 'Metro Codes Permit',
      trade: 'General contractor', estValue: 96_000, county: 'Davidson', distanceMiles: 4, address: '1411 Ashwood Ave, Nashville, TN 37212',
      permit: { number: 'CARN-2026-01174', type: 'Residential Remodel', valuation: 96_000, filedDate: dYmd(-3), applicant: 'Anita Shah (owner)' },
      scopeSummary: 'Interior remodel; owner-filed.', whyFits: ['Owner-filed', 'Belmont, 4 miles'], whyNot: [],
      status: 'new', foundAt: s3.finish, sweepId: 'sw3', lastTouchedAt: s3.finish,
    }),
    base({
      id: 'p5', kind: 'lead', title: 'Lakeshore Pointe HOA Clubhouse Renovation', owner: 'Lakeshore Pointe HOA', source: 'HOA',
      trade: 'General contractor', estValue: 120_000, county: 'Sumner', distanceMiles: 24, address: 'Hendersonville, TN 37075',
      scopeSummary: 'HOA board minutes reference a clubhouse kitchen and restroom renovation budget approved for next quarter.',
      whyFits: ['Board-approved budget', 'Sumner home county'], whyNot: ['HOA boards move slowly'],
      draftResponse: 'Mr. Greer, I read that the Lakeshore Pointe board approved a clubhouse renovation budget. We handle exactly this kind of kitchen and restroom work and can present at your next board meeting with a fixed-price proposal.',
      status: 'pipeline', stage: 'found', foundAt: s2.finish, sweepId: 'sw2', lastTouchedAt: at(-8, 10), pipelineAmount: 120_000,
    }),
    base({
      id: 'p6', kind: 'lead', title: 'Twelve South Property Management, Unit Turnovers', owner: 'Twelve South Property Management', source: 'Property Manager',
      trade: 'Interior finishes', estValue: 85_000, county: 'Davidson', distanceMiles: 3, address: '2500 12th Ave S, Nashville, TN 37204',
      scopeSummary: 'Manages 140 units across 12South and Edgehill; turnovers and renovation on lease-up.', whyFits: ['Repeat work', '3 miles'], whyNot: ['Price-sensitive'],
      status: 'pipeline', stage: 'qualified', foundAt: at(-12, 6, 19), sweepId: 'sw0', lastTouchedAt: at(-6, 10), pipelineAmount: 85_000,
    }),
    base({
      id: 'p7', kind: 'lead', title: 'Commercial Build-Out, Pruitt Veterinary Clinic', owner: 'Pruitt Veterinary Clinic', source: 'Commercial Build-Out',
      trade: 'General contractor', estValue: 260_000, county: 'Davidson', distanceMiles: 7, address: '220 Nolensville Pike, Nashville, TN 37211',
      scopeSummary: 'Veterinary clinic relocating to a larger space; build-out permit filed with an architect of record.', whyFits: ['Medical-adjacent build-out'], whyNot: ['Architect may have a preferred GC'],
      status: 'pipeline', stage: 'estimating', foundAt: at(-15, 6, 19), sweepId: 'sw0', lastTouchedAt: at(-9, 14), pipelineAmount: 260_000,
    }),
    base({
      id: 'p8', kind: 'lead', title: 'Roof and Gutter Permit, 812 Fatherland St', owner: 'Jasmine Ortiz', source: 'Metro Codes Permit',
      trade: 'Roofing', estValue: 24_000, county: 'Davidson', distanceMiles: 5, address: '812 Fatherland St, Nashville, TN 37206',
      permit: { number: 'CARR-2026-00897', type: 'Roof Replacement', valuation: 24_000, filedDate: dYmd(-8), applicant: 'Jasmine Ortiz (owner)' },
      scopeSummary: 'Roof and gutters on an East Nashville cottage.', whyFits: ['Roofing', 'Close'], whyNot: ['Small'],
      status: 'pipeline', stage: 'won', foundAt: s1.finish, sweepId: 'sw1', lastTouchedAt: at(-2, 12), pipelineAmount: 26_400,
    }),
    base({
      id: 'p9', kind: 'lead', title: 'Kinsley Commercial Realty, Retail Center Repositioning', owner: 'Kinsley Commercial Realty', source: 'Property Manager',
      trade: 'General contractor', estValue: 450_000, county: 'Davidson', distanceMiles: 11,
      scopeSummary: 'Property manager for four neighborhood retail centers; planning facade and vacancy build-outs.', whyFits: ['Repeat commercial work'], whyNot: ['Long sales cycle'],
      status: 'pipeline', stage: 'found', foundAt: at(-20, 6, 19), sweepId: 'sw0', lastTouchedAt: at(-20, 6, 19), pipelineAmount: 450_000,
    }),
    base({
      id: 'p10', kind: 'lead', title: 'Residential Kitchen Permit, 3302 Lealand Ln', owner: 'Grace Lindqvist', source: 'Metro Codes Permit',
      trade: 'General contractor', estValue: 72_000, county: 'Davidson', distanceMiles: 5, address: '3302 Lealand Ln, Nashville, TN 37204',
      permit: { number: 'CARN-2026-01130', type: 'Residential Remodel (Kitchen)', valuation: 72_000, filedDate: dYmd(-6), applicant: 'Grace Lindqvist (owner)' },
      scopeSummary: 'Kitchen remodel; owner-filed.', whyFits: ['Owner-filed', 'Kitchen'], whyNot: [],
      status: 'new', foundAt: s2.finish, sweepId: 'sw2', lastTouchedAt: s2.finish,
    }),
    base({
      id: 'p11', kind: 'lead', title: 'Sunrise Senior Living Murfreesboro, Common Area Refresh', owner: 'Sunrise Senior Living Murfreesboro', source: 'Commercial Build-Out',
      trade: 'Interior finishes', estValue: 180_000, county: 'Rutherford', distanceMiles: 34, address: 'Murfreesboro, TN 37129',
      scopeSummary: 'Dining room and lobby refresh announced in a facility newsletter.', whyFits: ['Interior finishes'], whyNot: ['Corporate procurement'],
      status: 'no_bid', noBidReason: 'Corporate vendor program requires national account', foundAt: s1.finish, sweepId: 'sw1', lastTouchedAt: at(-5, 9),
    }),
    base({
      id: 'p12', kind: 'lead', title: 'Residential Bathroom Permit, 4005 Hillsboro Pike', owner: 'Desmond Wright', source: 'Metro Codes Permit',
      trade: 'General contractor', estValue: 38_000, county: 'Davidson', distanceMiles: 7, address: '4005 Hillsboro Pike, Nashville, TN 37215',
      permit: { number: 'CARN-2026-01102', type: 'Residential Remodel (Bath)', valuation: 38_000, filedDate: dYmd(-12), applicant: 'Desmond Wright (owner)' },
      scopeSummary: 'Primary bathroom remodel.', whyFits: ['Close'], whyNot: ['Below typical range'],
      status: 'new', foundAt: s1.finish, sweepId: 'sw1', lastTouchedAt: s1.finish,
    }),
  ]
}

export function seedSweeps(): Sweep[] {
  const sources = (results: [string, 'new' | 'nothing' | 'unreadable', number][]) =>
    results.map(([source, result, count]) => ({ source, result, count, message: result === 'new' ? `${count} new` : result === 'nothing' ? 'Nothing open' : 'Not readable this run' }))
  return [
    { id: 'sw1', number: 41, startedAt: s1.start, finishedAt: s1.finish, cadence: 'mwf', foundIds: ['b9', 'p8', 'p11', 'p12'], sources: sources([['SAM.gov', 'nothing', 0], ['State of Tennessee CPO', 'nothing', 0], ['Metro Nashville Procurement', 'nothing', 0], ['Williamson County', 'nothing', 0], ['Rutherford County', 'unreadable', 0], ['Metro Nashville Public Schools', 'nothing', 0], ['MDHA', 'nothing', 0], ['GC Invitation to Bid', 'new', 1], ['Metro Codes Permit', 'new', 2], ['Commercial Build-Out', 'new', 1], ['Property Manager', 'nothing', 0], ['HOA', 'nothing', 0]]) },
    { id: 'sw2', number: 42, startedAt: s2.start, finishedAt: s2.finish, cadence: 'mwf', foundIds: ['b1', 'b8', 'b14', 'p5', 'p10'], sources: sources([['SAM.gov', 'new', 1], ['State of Tennessee CPO', 'nothing', 0], ['Metro Nashville Procurement', 'new', 1], ['Williamson County', 'nothing', 0], ['Rutherford County', 'nothing', 0], ['Metro Nashville Public Schools', 'nothing', 0], ['MDHA', 'new', 1], ['GC Invitation to Bid', 'nothing', 0], ['Metro Codes Permit', 'new', 1], ['Commercial Build-Out', 'nothing', 0], ['Property Manager', 'nothing', 0], ['HOA', 'new', 1]]) },
    { id: 'sw3', number: 43, startedAt: s3.start, finishedAt: s3.finish, cadence: 'mwf', foundIds: ['b2', 'b5', 'b13', 'p4'], sources: sources([['SAM.gov', 'nothing', 0], ['State of Tennessee CPO', 'unreadable', 0], ['Metro Nashville Procurement', 'nothing', 0], ['Williamson County', 'nothing', 0], ['Rutherford County', 'nothing', 0], ['Metro Nashville Public Schools', 'new', 1], ['MDHA', 'new', 1], ['GC Invitation to Bid', 'new', 1], ['Metro Codes Permit', 'new', 1], ['Commercial Build-Out', 'nothing', 0], ['Property Manager', 'nothing', 0], ['HOA', 'nothing', 0]]) },
    { id: 'sw4', number: 44, startedAt: s4.start, finishedAt: s4.finish, cadence: 'mwf', foundIds: ['b3', 'b4', 'b6', 'b7', 'b11', 'p1', 'p2', 'p3'], sources: sources([['SAM.gov', 'nothing', 0], ['State of Tennessee CPO', 'new', 2], ['Metro Nashville Procurement', 'nothing', 0], ['Williamson County', 'new', 1], ['Rutherford County', 'new', 1], ['Metro Nashville Public Schools', 'new', 1], ['MDHA', 'nothing', 0], ['GC Invitation to Bid', 'nothing', 0], ['Metro Codes Permit', 'new', 2], ['Commercial Build-Out', 'new', 1], ['Property Manager', 'nothing', 0], ['HOA', 'nothing', 0]]) },
  ]
}

export function seedOutreach(): Outreach[] {
  return [
    { id: 'or1', opportunityId: 'p1', contactId: 'ct_l1', channel: 'email', subject: 'Your addition at Golf Club Lane', body: 'Hi Priya,\n\nI noticed the permit for your addition at 2214 Golf Club Lane was filed this week. We completed a very similar kitchen and primary-suite project in Green Hills last year and would be glad to walk the plans with you and give you a real number within a week.\n\nWould a 20-minute site visit this week work?\n\nBest,\nCumberland Ridge Builders', status: 'draft', createdAt: s4.finish, updatedAt: s4.finish },
    { id: 'or2', opportunityId: 'p1', contactId: 'ct_l1', channel: 'call', subject: 'Call script: Priya Natarajan', body: 'Opening: Hi Priya, this is from Cumberland Ridge Builders in Nashville. I saw your addition permit was filed this week. Do you already have a builder lined up, or are you still pricing it?\n\nIf pricing: We did a near-identical kitchen and addition in Green Hills last year. Could I walk the plans with you this week and put a real number together?\n\nIf lined up: Understood. If anything changes, we are 6 miles away and can start within 30 days.\n\nClose: What day works for a 20-minute visit?', status: 'draft', createdAt: s4.finish, updatedAt: s4.finish },
    { id: 'or3', opportunityId: 'p3', contactId: 'ct_l5', channel: 'email', subject: 'Maryland Way build-out', body: 'Dr. Esposito,\n\nCongratulations on the Maryland Way space. We built out the Berry Hill dental office last year, six operatories with medical gas and lead-lined walls, and finished two weeks ahead of the opening date.\n\nI would welcome the chance to look at your plans and give you a schedule and a number.\n\nBest,\nCumberland Ridge Builders', status: 'approved', createdAt: s4.finish, updatedAt: at(0, 8) },
    { id: 'or4', opportunityId: 'p5', contactId: 'ct_l6', channel: 'email', subject: 'Clubhouse renovation at Lakeshore Pointe', body: 'Mr. Greer,\n\nI read that the Lakeshore Pointe board approved a clubhouse renovation budget for next quarter. We handle exactly this kind of kitchen and restroom work and can present a fixed-price proposal at your next board meeting.\n\nBest,\nCumberland Ridge Builders', status: 'sent', createdAt: s2.finish, updatedAt: at(-7, 9) },
    { id: 'or5', opportunityId: 'p6', contactId: 'ct_l3', channel: 'email', subject: 'Unit turnover partner for Twelve South PM', body: 'Lena,\n\nThank you for the reply. Attached are our certificate of insurance and a turnover price sheet for paint, flooring and standard kitchen and bath refreshes.\n\nBest,\nCumberland Ridge Builders', status: 'replied', createdAt: at(-10, 9), updatedAt: at(-6, 10) },
    { id: 'or6', opportunityId: 'b2', channel: 'email', subject: 'Harpeth Valley ITB: medical office fit-out', body: 'Marisol,\n\nThank you for the invitation to bid the medical office suite. We will have our interior finishes number to you before the due date and plan to attend the walk-through.\n\nBest,\nCumberland Ridge Builders', status: 'approved', createdAt: s3.finish, updatedAt: at(-2, 9) },
    { id: 'or7', opportunityId: 'p2', contactId: 'ct_l2', channel: 'call', subject: 'Call script: Bell Family Trust roof', body: 'Opening: Hi, I am calling from Cumberland Ridge Builders about the roof replacement permit filed for 118 Woodmont. Is this storm damage, and have you had an adjuster out yet?\n\nValue: We handle the insurance supplement paperwork and can start within two weeks of approval.\n\nClose: Could we schedule a 15-minute roof inspection this week?', status: 'draft', createdAt: s4.finish, updatedAt: s4.finish },
  ]
}
