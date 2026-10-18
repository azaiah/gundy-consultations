import type { CalendarEvent, CrewMember, CrewAssignment, ClockEntry, Settings } from '../types'
import { addDays, iso, ymd } from '../lib/dates'

const t = new Date()
const dYmd = (days: number) => ymd(addDays(t, days))
const at = (days: number, hour: number, minute = 0) => {
  const x = addDays(t, days)
  x.setHours(hour, minute, 0, 0)
  return iso(x)
}

export function seedEvents(): CalendarEvent[] {
  const ev: CalendarEvent[] = []
  const push = (e: Omit<CalendarEvent, 'id'>) => ev.push({ id: `ev${ev.length + 1}`, ...e })
  // Job days (recurring-looking, generated individually) for the two active jobs
  for (let d = -5; d <= 12; d++) {
    const day = addDays(t, d)
    if (day.getDay() === 0 || day.getDay() === 6) continue
    push({ title: 'Whitaker Kitchen: crew on site', type: 'job', start: at(d, 7), end: at(d, 15, 30), projectId: 'pj1', location: '4820 Shys Hill Rd' })
  }
  for (let d = -3; d <= 3; d++) {
    const day = addDays(t, d)
    if (day.getDay() === 0 || day.getDay() === 6) continue
    push({ title: 'Lamont Reroof: crew on site', type: 'job', start: at(d, 7), end: at(d, 16), projectId: 'pj3', location: '1810 Sweetbriar Ave' })
  }
  push({ title: 'Pre-bid walk: Fire Station 19', type: 'pre_bid', start: at(3, 10), end: at(3, 11), opportunityId: 'b1', location: 'Fire Station 19' })
  push({ title: 'Bid due: Fire Station 19', type: 'bid_due', start: at(11, 14), end: at(11, 14), opportunityId: 'b1', allDay: true })
  push({ title: 'Walk-through: Harpeth medical suite', type: 'pre_bid', start: at(1, 9), end: at(1, 10), opportunityId: 'b2', location: 'Cool Springs' })
  push({ title: 'Bid due: Harpeth medical fit-out', type: 'bid_due', start: at(6, 12), end: at(6, 12), opportunityId: 'b2', allDay: true })
  push({ title: 'Bid due: Brentwood lobby refresh', type: 'bid_due', start: at(4, 17), end: at(4, 17), opportunityId: 'b9', allDay: true })
  push({ title: 'Bid due: MDHA scattered-site roofs', type: 'bid_due', start: at(8, 14), end: at(8, 14), opportunityId: 'b14', allDay: true })
  push({ title: 'Pre-bid: National Guard reroof', type: 'pre_bid', start: at(7, 13), end: at(7, 14), opportunityId: 'b3', location: 'Smyrna, TN' })
  push({ title: 'Site visit: Esposito Dental', type: 'site_visit', start: at(3, 15), end: at(3, 16), contactId: 'ct_l5', opportunityId: 'p3', location: '5110 Maryland Way' })
  push({ title: 'Site visit: Priya Natarajan addition', type: 'site_visit', start: at(2, 16), end: at(2, 16, 30), contactId: 'ct_l1', opportunityId: 'p1', location: '2214 Golf Club Ln' })
  push({ title: 'Inspection: Whitaker final electrical', type: 'inspection', start: at(9, 9), end: at(9, 10), projectId: 'pj1' })
  push({ title: 'Inspection: Lamont roof final', type: 'inspection', start: at(4, 11), end: at(4, 12), projectId: 'pj3' })
  push({ title: 'Inspection: Cho Ortho certificate of occupancy', type: 'inspection', start: at(5, 10), end: at(5, 11), projectId: 'pj2' })
  push({ title: 'Meeting: Harrell proposal review', type: 'meeting', start: at(1, 17), end: at(1, 18), contactId: 'ct_c5', projectId: 'pj4', location: '2209 Blair Blvd' })
  push({ title: 'Meeting: Lakeshore Pointe HOA board', type: 'meeting', start: at(10, 18, 30), end: at(10, 19, 30), contactId: 'ct_l6', opportunityId: 'p5', location: 'Clubhouse' })
  push({ title: 'Countertop template: Whitaker', type: 'site_visit', start: at(6, 13), end: at(6, 14), projectId: 'pj1' })
  push({ title: 'Punch walk: Cho Orthodontics', type: 'site_visit', start: at(2, 8), end: at(2, 9), projectId: 'pj2' })
  push({ title: 'Weekly briefing review', type: 'meeting', start: at(1, 7, 30), end: at(1, 8), notes: 'Review the sweep results and approve outreach drafts.' })
  return ev
}

export function seedCrew(): CrewMember[] {
  const avail = (offDays: number[], pto: number[] = []): CrewMember['availability'] => {
    const a: CrewMember['availability'] = {}
    for (const d of offDays) a[dYmd(d)] = 'off'
    for (const d of pto) a[dYmd(d)] = 'pto'
    return a
  }
  return [
    { id: 'cr1', name: 'Marcus Vance', role: 'Foreman', trade: 'Carpentry', phone: '+16155550301', hourlyCost: 42, certifications: [{ id: 'cc1', name: 'OSHA 30', expires: dYmd(540) }, { id: 'cc2', name: 'EPA RRP Renovator', expires: dYmd(300) }], availability: avail([]) },
    { id: 'cr2', name: 'Sofia Alvarez', role: 'Foreman', trade: 'General', phone: '+16155550302', hourlyCost: 44, certifications: [{ id: 'cc3', name: 'OSHA 30', expires: dYmd(200) }, { id: 'cc4', name: 'First Aid / CPR', expires: dYmd(45) }], availability: avail([], [5, 6]) },
    { id: 'cr3', name: 'Tyler Brooks', role: 'Lead carpenter', trade: 'Carpentry', phone: '+16155550303', hourlyCost: 34, certifications: [{ id: 'cc5', name: 'OSHA 10', expires: dYmd(800) }], availability: avail([]) },
    { id: 'cr4', name: 'Jamal Whitley', role: 'Carpenter', trade: 'Finish carpentry', phone: '+16155550304', hourlyCost: 30, certifications: [{ id: 'cc6', name: 'OSHA 10', expires: dYmd(-20) }], availability: avail([2]) },
    { id: 'cr5', name: 'Reggie Coleman', role: 'Laborer', trade: 'General', phone: '+16155550305', hourlyCost: 22, certifications: [], availability: avail([]) },
    { id: 'cr6', name: 'Anders Lindgren', role: 'Carpenter', trade: 'Framing', phone: '+16155550306', hourlyCost: 31, certifications: [{ id: 'cc7', name: 'OSHA 10', expires: dYmd(400) }, { id: 'cc8', name: 'Forklift', expires: dYmd(12) }], availability: avail([], [8, 9, 10]) },
    { id: 'cr7', name: 'Dale Pruitt', role: 'Roofing lead', trade: 'Roofing', phone: '+16155550307', hourlyCost: 36, certifications: [{ id: 'cc9', name: 'OSHA 30', expires: dYmd(600) }, { id: 'cc10', name: 'Fall protection competent person', expires: dYmd(260) }], availability: avail([]) },
    { id: 'cr8', name: 'Nico Petrakis', role: 'Roofer', trade: 'Roofing', phone: '+16155550308', hourlyCost: 27, certifications: [{ id: 'cc11', name: 'OSHA 10', expires: dYmd(300) }], availability: avail([3]) },
  ]
}

export function seedAssignments(): CrewAssignment[] {
  const a: CrewAssignment[] = []
  let n = 0
  for (let d = -1; d <= 5; d++) {
    const day = addDays(t, d)
    if (day.getDay() === 0 || day.getDay() === 6) continue
    for (const crewId of ['cr1', 'cr3', 'cr5']) a.push({ id: `as${++n}`, crewId, projectId: 'pj1', date: dYmd(d) })
    if (d <= 3) for (const crewId of ['cr7', 'cr8']) a.push({ id: `as${++n}`, crewId, projectId: 'pj3', date: dYmd(d) })
    if (d <= 2) for (const crewId of ['cr2', 'cr4']) a.push({ id: `as${++n}`, crewId, projectId: 'pj2', date: dYmd(d) })
  }
  return a
}

export function seedClock(): ClockEntry[] {
  return [
    { id: 'ck1', crewId: 'cr1', projectId: 'pj1', inAt: at(-1, 6, 58), outAt: at(-1, 15, 34), location: 'location not shared' },
    { id: 'ck2', crewId: 'cr7', projectId: 'pj3', inAt: at(-1, 12, 5), outAt: at(-1, 16, 10), location: 'location not shared' },
  ]
}

export function seedSettings(): Settings {
  return {
    defaultTaxRatePct: 9.25,
    packageId: 'growth',
    simulateOffline: false,
    tourDone: false,
    calendarSync: true,
    profile: { ownerName: 'Ray Cumberland', email: 'ray@cumberlandridge.example', phone: '+16155550100' },
    security: { twoFactor: true, sessionTimeoutMin: 60, shareAnonymizedUsage: false },
    notifications: { newFinds: true, bidDue: true, complianceExpiry: true, invoiceOverdue: true, weeklyBriefing: true },
    sweepSources: {
      'SAM.gov': true, 'State of Tennessee CPO': true, 'Metro Nashville Procurement': true, 'Williamson County': true, 'Rutherford County': true,
      'Metro Nashville Public Schools': true, MDHA: true, 'GC Invitation to Bid': true, 'Metro Codes Permit': true, 'Commercial Build-Out': true, 'Property Manager': true, HOA: true,
    },
    seats: [
      { id: 'st1', name: 'Ray Cumberland', email: 'ray@cumberlandridge.example', role: 'owner', active: true },
      { id: 'st2', name: 'Denise Park', email: 'denise@cumberlandridge.example', role: 'estimator', active: true },
      { id: 'st3', name: 'Marcus Vance', email: 'marcus@cumberlandridge.example', role: 'foreman', active: true },
      { id: 'st4', name: 'Sofia Alvarez', email: 'sofia@cumberlandridge.example', role: 'foreman', active: true },
      { id: 'st5', name: 'Kim Reyes', email: 'office@cumberlandridge.example', role: 'office', active: true },
    ],
    priceBook: [
      { id: 'pb1', section: 'Demolition', category: 'Labor', description: 'Interior demolition labor', unit: 'hr', unitCost: 42 },
      { id: 'pb2', section: 'Demolition', category: 'Equipment', description: '20-yard dumpster pull', unit: 'ea', unitCost: 525 },
      { id: 'pb3', section: 'Framing', category: 'Labor', description: 'Framing labor', unit: 'hr', unitCost: 48 },
      { id: 'pb4', section: 'Framing', category: 'Material', description: '2x4 stud, 8 ft', unit: 'ea', unitCost: 4.85 },
      { id: 'pb5', section: 'Framing', category: 'Material', description: 'LVL header 1.75x11.875, per LF', unit: 'lf', unitCost: 14.2 },
      { id: 'pb6', section: 'Drywall and paint', category: 'Subcontract', description: 'Drywall hang, finish, prime and paint, per SF', unit: 'sf', unitCost: 3.9 },
      { id: 'pb7', section: 'Electrical', category: 'Subcontract', description: 'Recessed LED can, installed', unit: 'ea', unitCost: 165 },
      { id: 'pb8', section: 'Electrical', category: 'Subcontract', description: 'Dedicated 20A circuit', unit: 'ea', unitCost: 385 },
      { id: 'pb9', section: 'Plumbing', category: 'Subcontract', description: 'Relocate sink supply and drain', unit: 'ea', unitCost: 1_250 },
      { id: 'pb10', section: 'Tile', category: 'Subcontract', description: 'Tile install, wall, per SF', unit: 'sf', unitCost: 18 },
      { id: 'pb11', section: 'Tile', category: 'Subcontract', description: 'Tile install, floor, per SF', unit: 'sf', unitCost: 14 },
      { id: 'pb12', section: 'Countertops', category: 'Material', description: 'Quartz countertop, installed, per SF', unit: 'sf', unitCost: 92 },
      { id: 'pb13', section: 'Finishes', category: 'Material', description: 'Engineered hardwood, installed, per SF', unit: 'sf', unitCost: 11.5 },
      { id: 'pb14', section: 'Finishes', category: 'Labor', description: 'Finish carpentry labor', unit: 'hr', unitCost: 48 },
      { id: 'pb15', section: 'Roofing', category: 'Material', description: 'Architectural shingles, per square', unit: 'sq', unitCost: 135 },
      { id: 'pb16', section: 'Roofing', category: 'Labor', description: 'Tear-off and install, per square', unit: 'sq', unitCost: 210 },
      { id: 'pb17', section: 'General conditions', category: 'Other', description: 'Supervision, per week', unit: 'wk', unitCost: 1_400 },
      { id: 'pb18', section: 'General conditions', category: 'Other', description: 'Building permit (residential remodel)', unit: 'ea', unitCost: 650 },
    ],
  }
}
