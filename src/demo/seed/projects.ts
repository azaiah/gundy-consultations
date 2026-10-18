import type { Project, Estimate, Proposal, ChangeOrder, DailyLog, CostEntry, Invoice, Note } from '../types'
import { addDays, iso, ymd } from '../lib/dates'

const t = new Date()
const dYmd = (days: number) => ymd(addDays(t, days))
const at = (days: number, hour: number) => {
  const x = addDays(t, days)
  x.setHours(hour, 0, 0, 0)
  return iso(x)
}

export function seedProjects(): Project[] {
  return [
    {
      id: 'pj1', name: 'Whitaker Kitchen and Primary Suite', customerId: 'ct_c1', address: '4820 Shys Hill Rd, Nashville, TN 37215', status: 'in_progress', contractValue: 186_400, percentComplete: 62,
      startDate: dYmd(-38), endDate: dYmd(24), type: 'residential', createdAt: at(-60, 9), foremanId: 'cr1', crewIds: ['cr1', 'cr3', 'cr5'], subIds: ['ct_s1', 'ct_s2', 'ct_s5', 'ct_s8'],
      description: 'Full kitchen remodel with a relocated range wall, new island, and a primary suite renovation including a walk-in shower and custom closet.',
      checklist: [
        { id: 'ck1', text: 'Permit posted on site', done: true }, { id: 'ck2', text: 'Demo complete and haul-off', done: true }, { id: 'ck3', text: 'Rough electrical inspection passed', done: true },
        { id: 'ck4', text: 'Rough plumbing inspection passed', done: true }, { id: 'ck5', text: 'Drywall hung and finished', done: true }, { id: 'ck6', text: 'Cabinets installed', done: false },
        { id: 'ck7', text: 'Countertop template', done: false }, { id: 'ck8', text: 'Tile complete', done: false }, { id: 'ck9', text: 'Final inspection', done: false },
      ],
      punchList: [
        { id: 'pl1', text: 'Touch up paint at hallway corner bead', location: 'Hallway', done: false, photos: [], createdAt: at(-2, 15) },
        { id: 'pl2', text: 'Adjust pantry door reveal', location: 'Kitchen', done: true, photos: [], createdAt: at(-4, 11) },
      ],
      selections: [
        { id: 'sl1', category: 'Tile', item: 'Shower wall tile', status: 'selected', choice: '3x12 handmade-look white gloss' },
        { id: 'sl2', category: 'Fixtures', item: 'Kitchen faucet', status: 'ordered', choice: 'Pull-down, brushed nickel' },
        { id: 'sl3', category: 'Paint', item: 'Primary bedroom color', status: 'pending' },
        { id: 'sl4', category: 'Countertops', item: 'Island slab', status: 'pending' },
      ],
      progressPhotos: [],
    },
    {
      id: 'pj2', name: 'Cho Orthodontics Suite Build-Out', customerId: 'ct_c2', address: '7105 Bakers Bridge Ave, Brentwood, TN 37027', status: 'punch', contractValue: 428_900, percentComplete: 96,
      startDate: dYmd(-110), endDate: dYmd(5), type: 'commercial', createdAt: at(-150, 9), foremanId: 'cr2', crewIds: ['cr2', 'cr4', 'cr6'], subIds: ['ct_s1', 'ct_s3', 'ct_s4', 'ct_s8'],
      description: '4,200 SF orthodontic suite: reception, six treatment chairs in an open bay, sterilization, lab, two offices, and a staff lounge.',
      checklist: [{ id: 'ck10', text: 'Above-ceiling inspection', done: true }, { id: 'ck11', text: 'Fire alarm test', done: true }, { id: 'ck12', text: 'Certificate of occupancy', done: false }],
      punchList: [
        { id: 'pl3', text: 'Replace scratched glass at reception', location: 'Reception', done: false, photos: [], createdAt: at(-3, 10), assignedTo: 'cr4' },
        { id: 'pl4', text: 'Caulk sterilization countertop backsplash', location: 'Sterilization', done: false, photos: [], createdAt: at(-3, 10) },
        { id: 'pl5', text: 'Label electrical panel', location: 'Mechanical', done: true, photos: [], createdAt: at(-5, 14) },
      ],
      selections: [],
      progressPhotos: [],
    },
    {
      id: 'pj3', name: 'Lamont Reroof and Gutters', customerId: 'ct_c3', address: '1810 Sweetbriar Ave, Nashville, TN 37212', status: 'in_progress', contractValue: 28_750, percentComplete: 80,
      startDate: dYmd(-4), endDate: dYmd(3), type: 'residential', createdAt: at(-20, 9), foremanId: 'cr7', crewIds: ['cr7', 'cr8'], subIds: ['ct_s7'],
      description: 'Tear-off and replace architectural shingle roof, new synthetic underlayment, ridge vent, and seamless gutters.',
      checklist: [{ id: 'ck13', text: 'Tear-off complete', done: true }, { id: 'ck14', text: 'Underlayment and flashing', done: true }, { id: 'ck15', text: 'Shingles installed', done: true }, { id: 'ck16', text: 'Gutters installed', done: false }, { id: 'ck17', text: 'Final cleanup and magnet sweep', done: false }],
      punchList: [],
      selections: [{ id: 'sl5', category: 'Roofing', item: 'Shingle color', status: 'selected', choice: 'Weathered Wood' }],
      progressPhotos: [],
    },
    {
      id: 'pj4', name: 'Harrell Sunroom Addition', customerId: 'ct_c5', address: '2209 Blair Blvd, Nashville, TN 37212', status: 'proposed', contractValue: 118_200, percentComplete: 0,
      startDate: dYmd(21), endDate: dYmd(80), type: 'residential', createdAt: at(-14, 9), crewIds: [], subIds: [],
      description: '280 SF sunroom addition on a slab with a vaulted ceiling, mini-split, and composite deck.',
      checklist: [{ id: 'ck18', text: 'Proposal signed', done: false }, { id: 'ck19', text: 'Permit submitted', done: false }],
      punchList: [], selections: [], progressPhotos: [],
    },
    {
      id: 'pj5', name: 'Brandt Boutique Fitness Studio', customerId: 'ct_c7', address: '1200 Villa Pl, Nashville, TN 37212', status: 'complete', contractValue: 214_000, percentComplete: 100,
      startDate: dYmd(-160), endDate: dYmd(-72), type: 'commercial', createdAt: at(-200, 9), foremanId: 'cr2', crewIds: ['cr2', 'cr4'], subIds: ['ct_s1', 'ct_s3', 'ct_s4'],
      description: '2,600 SF fitness studio: rubber flooring, mirrored wall, two restrooms with showers, reception and retail nook.',
      checklist: [{ id: 'ck20', text: 'Final walkthrough', done: true }, { id: 'ck21', text: 'Warranty letter delivered', done: true }],
      punchList: [], selections: [], progressPhotos: [],
    },
    {
      id: 'pj6', name: 'Okonkwo Kitchen Refresh', customerId: 'ct_c9', address: '4411 Harding Pike, Nashville, TN 37205', status: 'estimating', contractValue: 0, percentComplete: 0,
      startDate: dYmd(30), endDate: dYmd(65), type: 'residential', createdAt: at(-5, 9), crewIds: [], subIds: [],
      description: 'Cabinet refacing, new quartz counters, tile backsplash, under-cabinet lighting, and a new sink and faucet.',
      checklist: [{ id: 'ck22', text: 'Site measure', done: true }, { id: 'ck23', text: 'Estimate complete', done: false }],
      punchList: [], selections: [], progressPhotos: [],
    },
  ]
}

export function seedEstimates(): Estimate[] {
  return [
    {
      id: 'es1', projectId: 'pj1', taxRatePct: 9.25, contingencyPct: 5, taxApplies: 'materials', updatedAt: at(-40, 10),
      lines: [
        { id: 'el1', section: 'Demolition', category: 'Labor', description: 'Demo existing kitchen cabinets, counters, flooring and primary bath finishes', qty: 48, unit: 'hr', unitCost: 42, markupPct: 20 },
        { id: 'el2', section: 'Demolition', category: 'Equipment', description: '20-yard dumpster, two pulls', qty: 2, unit: 'ea', unitCost: 525, markupPct: 10 },
        { id: 'el3', section: 'Framing', category: 'Labor', description: 'Frame new range wall, relocate pantry opening, closet partitions', qty: 64, unit: 'hr', unitCost: 48, markupPct: 20 },
        { id: 'el4', section: 'Framing', category: 'Material', description: 'Lumber, LVL header, hardware', qty: 1, unit: 'lot', unitCost: 2_850, markupPct: 15 },
        { id: 'el5', section: 'Electrical', category: 'Subcontract', description: 'Hernandez Electric: kitchen and bath rough and trim, 14 recessed, under-cabinet lighting, 2 dedicated circuits', qty: 1, unit: 'lot', unitCost: 11_400, markupPct: 15 },
        { id: 'el6', section: 'Plumbing', category: 'Subcontract', description: 'Whitfield Plumbing: relocate sink, pot filler, shower valve, freestanding tub rough and trim', qty: 1, unit: 'lot', unitCost: 9_800, markupPct: 15 },
        { id: 'el7', section: 'Drywall and paint', category: 'Subcontract', description: 'Pike Drywall: patch, hang, level 4 finish, prime and two coats', qty: 1, unit: 'lot', unitCost: 7_600, markupPct: 15 },
        { id: 'el8', section: 'Cabinetry', category: 'Subcontract', description: 'Solberg Cabinetry: custom painted maple, 32 LF base, 24 LF upper, island', qty: 1, unit: 'lot', unitCost: 38_500, markupPct: 12 },
        { id: 'el9', section: 'Countertops', category: 'Material', description: 'Quartz countertops, 68 SF, mitered island edge', qty: 68, unit: 'sf', unitCost: 92, markupPct: 15 },
        { id: 'el10', section: 'Tile', category: 'Subcontract', description: 'Farouk Tile: shower walls and floor, bath floor, kitchen backsplash', qty: 1, unit: 'lot', unitCost: 9_200, markupPct: 15 },
        { id: 'el11', section: 'Tile', category: 'Material', description: 'Tile, Schluter, thinset and grout allowance', qty: 1, unit: 'lot', unitCost: 4_800, markupPct: 15 },
        { id: 'el12', section: 'Finishes', category: 'Material', description: 'Fixtures allowance: faucets, shower trim, tub filler, lighting', qty: 1, unit: 'lot', unitCost: 6_500, markupPct: 12 },
        { id: 'el13', section: 'Finishes', category: 'Labor', description: 'Finish carpentry: trim, doors, closet system', qty: 72, unit: 'hr', unitCost: 48, markupPct: 20 },
        { id: 'el14', section: 'Finishes', category: 'Material', description: 'Engineered white oak flooring, 420 SF, installed to match existing', qty: 420, unit: 'sf', unitCost: 11.5, markupPct: 15 },
        { id: 'el15', section: 'General conditions', category: 'Other', description: 'Supervision, permits, cleanup, floor protection, dust walls', qty: 1, unit: 'lot', unitCost: 8_900, markupPct: 10 },
      ],
    },
    {
      id: 'es2', projectId: 'pj4', taxRatePct: 9.25, contingencyPct: 7, taxApplies: 'materials', updatedAt: at(-10, 10),
      lines: [
        { id: 'el20', section: 'Site and foundation', category: 'Subcontract', description: 'TV Concrete: footings, slab, and stem wall for 280 SF addition', qty: 1, unit: 'lot', unitCost: 14_200, markupPct: 15 },
        { id: 'el21', section: 'Framing', category: 'Labor', description: 'Frame walls and vaulted roof, tie into existing', qty: 120, unit: 'hr', unitCost: 48, markupPct: 20 },
        { id: 'el22', section: 'Framing', category: 'Material', description: 'Lumber package, trusses, sheathing', qty: 1, unit: 'lot', unitCost: 9_400, markupPct: 15 },
        { id: 'el23', section: 'Exterior', category: 'Material', description: 'Windows (8) and patio door', qty: 1, unit: 'lot', unitCost: 11_800, markupPct: 12 },
        { id: 'el24', section: 'Exterior', category: 'Subcontract', description: 'Rudd Roofing: shingles to match, flashing', qty: 1, unit: 'lot', unitCost: 4_600, markupPct: 15 },
        { id: 'el25', section: 'Mechanical', category: 'Subcontract', description: 'Mensah HVAC: ductless mini-split', qty: 1, unit: 'lot', unitCost: 5_200, markupPct: 15 },
        { id: 'el26', section: 'Electrical', category: 'Subcontract', description: 'Hernandez Electric: lighting, outlets, fan', qty: 1, unit: 'lot', unitCost: 4_300, markupPct: 15 },
        { id: 'el27', section: 'Finishes', category: 'Subcontract', description: 'Pike Drywall: hang, finish, paint', qty: 1, unit: 'lot', unitCost: 5_800, markupPct: 15 },
        { id: 'el28', section: 'Finishes', category: 'Material', description: 'Flooring, trim, interior doors', qty: 1, unit: 'lot', unitCost: 6_100, markupPct: 15 },
        { id: 'el29', section: 'Deck', category: 'Labor', description: 'Composite deck 240 SF with railing', qty: 56, unit: 'hr', unitCost: 48, markupPct: 20 },
        { id: 'el30', section: 'Deck', category: 'Material', description: 'Composite decking, framing, railing', qty: 1, unit: 'lot', unitCost: 7_900, markupPct: 15 },
        { id: 'el31', section: 'General conditions', category: 'Other', description: 'Permits, supervision, dumpster, cleanup', qty: 1, unit: 'lot', unitCost: 7_200, markupPct: 10 },
      ],
    },
    {
      id: 'es3', projectId: 'pj6', taxRatePct: 9.25, contingencyPct: 5, taxApplies: 'materials', updatedAt: at(-1, 10),
      lines: [
        { id: 'el40', section: 'Cabinetry', category: 'Subcontract', description: 'Solberg Cabinetry: reface 28 LF, new doors and drawer fronts', qty: 1, unit: 'lot', unitCost: 12_800, markupPct: 12 },
        { id: 'el41', section: 'Countertops', category: 'Material', description: 'Quartz countertops, 54 SF', qty: 54, unit: 'sf', unitCost: 88, markupPct: 15 },
        { id: 'el42', section: 'Tile', category: 'Subcontract', description: 'Farouk Tile: backsplash 38 SF', qty: 1, unit: 'lot', unitCost: 1_650, markupPct: 15 },
        { id: 'el43', section: 'Electrical', category: 'Subcontract', description: 'Hernandez Electric: under-cabinet lighting and disposal circuit', qty: 1, unit: 'lot', unitCost: 1_450, markupPct: 15 },
        { id: 'el44', section: 'Plumbing', category: 'Subcontract', description: 'Whitfield Plumbing: sink, faucet, disposal', qty: 1, unit: 'lot', unitCost: 1_100, markupPct: 15 },
      ],
    },
  ]
}

export function seedProposals(): Proposal[] {
  return [
    {
      id: 'pr1', projectId: 'pj1', number: 'P-2026-014', date: dYmd(-42), status: 'accepted',
      scope: 'Complete renovation of the kitchen and primary suite at 4820 Shys Hill Road as described in the attached estimate, including demolition, framing of the new range wall, electrical and plumbing rough and trim, drywall and paint, custom cabinetry, quartz countertops, tile, engineered flooring, finish carpentry, and fixtures per the selections schedule.',
      inclusions: ['Permits and inspections', 'Dust containment and floor protection', 'Daily cleanup and final clean', 'Haul-off of demolition debris', 'One-year workmanship warranty'],
      exclusions: ['Appliances and appliance installation beyond hookup', 'Window treatments', 'Repairs to concealed conditions discovered during demolition (handled by change order)', 'Landscape repair beyond the work area'],
      timeline: 'Nine weeks from the start date, subject to cabinet lead time (six weeks from deposit) and inspection scheduling.',
      draws: [{ id: 'dw1', label: 'Deposit at signing', pct: 30 }, { id: 'dw2', label: 'Rough-in inspections passed', pct: 30 }, { id: 'dw3', label: 'Cabinets installed', pct: 30 }, { id: 'dw4', label: 'Final walkthrough', pct: 10 }],
      terms: 'Proposal valid for 30 days. Draw invoices are due within 5 days. Changes to scope are priced and approved in writing before work proceeds. Allowance overages are billed at cost plus 12 percent.',
      signature: { dataUrl: '', name: 'Elaine Whitaker', signedAt: at(-40, 15) },
    },
    {
      id: 'pr2', projectId: 'pj4', number: 'P-2026-021', date: dYmd(-9), status: 'sent',
      scope: 'Construction of a 280 square foot sunroom addition on a slab foundation at 2209 Blair Boulevard, with a vaulted ceiling, eight windows and a patio door, ductless mini-split heating and cooling, finished interior, and a 240 square foot composite deck with railing.',
      inclusions: ['Architectural drawings and permit', 'Concrete foundation', 'Framing, roofing, siding to match', 'Electrical and HVAC', 'Interior finishes and flooring', 'Composite deck'],
      exclusions: ['Furniture', 'Landscaping', 'Gutter extension beyond the addition', 'Survey if required by Metro Codes'],
      timeline: 'Eight weeks from permit issuance, weather permitting.',
      draws: [{ id: 'dw5', label: 'Deposit at signing', pct: 25 }, { id: 'dw6', label: 'Foundation complete', pct: 25 }, { id: 'dw7', label: 'Dried in', pct: 25 }, { id: 'dw8', label: 'Final', pct: 25 }],
      terms: 'Proposal valid for 30 days. Draw invoices are due within 5 days. Changes to scope are priced and approved in writing before work proceeds.',
    },
  ]
}

export function seedChangeOrders(): ChangeOrder[] {
  return [
    { id: 'co1', projectId: 'pj1', number: 1, description: 'Replace water-damaged subfloor discovered under the old dishwasher, 24 SF, and treat framing.', costImpact: 1_840, daysImpact: 1, status: 'approved', createdAt: at(-28, 14), signature: { dataUrl: '', name: 'Elaine Whitaker', signedAt: at(-27, 9) } },
    { id: 'co2', projectId: 'pj1', number: 2, description: 'Add pot filler above the range and a second under-cabinet lighting zone per client request.', costImpact: 1_260, daysImpact: 0, status: 'pending', createdAt: at(-2, 16) },
    { id: 'co3', projectId: 'pj2', number: 1, description: 'Upgrade reception feature wall to backlit acrylic panel per tenant.', costImpact: 6_400, daysImpact: 4, status: 'approved', createdAt: at(-45, 11), signature: { dataUrl: '', name: 'Nathan Cho', signedAt: at(-44, 10) } },
  ]
}

export function seedDailyLogs(): DailyLog[] {
  return [
    { id: 'dl1', projectId: 'pj1', date: dYmd(-3), createdAt: at(-3, 16), author: 'Marcus Vance (foreman)', weather: 'Sunny, 74 F', crewOnSite: ['Marcus Vance', 'Tyler Brooks', 'Reggie Coleman'], workDone: 'Hung and finished drywall in the primary bath. Set shower pan. Pike finished sanding in the kitchen.', deliveries: 'Cabinets arrived from Solberg, staged in garage.', issues: 'None.', photos: [] },
    { id: 'dl2', projectId: 'pj1', date: dYmd(-2), createdAt: at(-2, 16), author: 'Marcus Vance (foreman)', weather: 'Cloudy, 68 F', crewOnSite: ['Marcus Vance', 'Tyler Brooks'], workDone: 'Primed kitchen and bath. Began base cabinet install on the sink wall.', deliveries: 'None.', issues: 'Island cabinet arrived with a damaged end panel; Solberg to replace by Friday.', photos: [] },
    { id: 'dl3', projectId: 'pj1', date: dYmd(-1), createdAt: at(-1, 16), author: 'Marcus Vance (foreman)', weather: 'Rain, 61 F', crewOnSite: ['Marcus Vance', 'Tyler Brooks', 'Reggie Coleman'], workDone: 'Finished base cabinets, started uppers. Farouk began shower wall tile.', deliveries: 'Tile and Schluter delivered.', issues: 'None.', photos: [] },
    { id: 'dl4', projectId: 'pj1', date: dYmd(-1), createdAt: at(-1, 18), author: 'Marcus Vance (foreman)', weather: 'Rain, 61 F', crewOnSite: ['Marcus Vance', 'Tyler Brooks', 'Reggie Coleman'], workDone: 'Finished base cabinets, started uppers. Farouk began shower wall tile. Correction: Reggie left at 2 PM for the Lamont job.', deliveries: 'Tile and Schluter delivered.', issues: 'None.', photos: [], supersedes: 'dl3' },
    { id: 'dl5', projectId: 'pj3', date: dYmd(-1), createdAt: at(-1, 17), author: 'Dale Pruitt (foreman)', weather: 'Rain until noon, 61 F', crewOnSite: ['Dale Pruitt', 'Reggie Coleman'], workDone: 'Rain delay until noon. Completed ridge vent and rear slope shingles.', deliveries: 'Gutter coil delivered.', issues: 'Found two rotted decking sheets on the rear slope; replaced under the decking allowance.', photos: [] },
    { id: 'dl6', projectId: 'pj2', date: dYmd(-2), createdAt: at(-2, 17), author: 'Sofia Alvarez (foreman)', weather: 'Sunny, 70 F', crewOnSite: ['Sofia Alvarez', 'Jamal Whitley'], workDone: 'Punch list walk with Dr. Cho. Labeled panel, adjusted three doors.', deliveries: 'Replacement reception glass ordered, 5-day lead.', issues: 'CO inspection scheduled for next week.', photos: [] },
  ]
}

export function seedCosts(): CostEntry[] {
  const mk = (id: string, projectId: string, category: string, description: string, amount: number, days: number, vendor?: string): CostEntry => ({ id, projectId, category, description, amount, date: dYmd(days), vendor })
  return [
    mk('c1', 'pj1', 'Labor', 'Crew payroll weeks 1-5', 21_400, -8),
    mk('c2', 'pj1', 'Material', 'Lumber and hardware', 3_120, -30, 'Nashville Lumber'),
    mk('c3', 'pj1', 'Subcontract', 'Hernandez Electric draw 1 and 2', 8_500, -12, 'Hernandez Electric'),
    mk('c4', 'pj1', 'Subcontract', 'Whitfield Plumbing rough', 6_200, -20, 'Whitfield Plumbing'),
    mk('c5', 'pj1', 'Subcontract', 'Pike Drywall', 7_600, -5, 'Pike Drywall and Paint'),
    mk('c6', 'pj1', 'Subcontract', 'Solberg Cabinetry 50 percent', 19_250, -3, 'Solberg Cabinetry'),
    mk('c7', 'pj1', 'Equipment', 'Dumpster pulls', 1_050, -32, 'Metro Waste'),
    mk('c8', 'pj1', 'Material', 'Tile and Schluter', 4_610, -1, 'Tile Shop'),
    mk('c9', 'pj2', 'Labor', 'Crew payroll', 48_900, -10),
    mk('c10', 'pj2', 'Material', 'Millwork, doors, hardware, finishes', 61_200, -40, 'Various'),
    mk('c11', 'pj2', 'Subcontract', 'Hernandez Electric', 42_000, -30, 'Hernandez Electric'),
    mk('c12', 'pj2', 'Subcontract', 'Mensah HVAC', 38_500, -35, 'Mensah HVAC'),
    mk('c13', 'pj2', 'Subcontract', 'Pike Drywall and Paint', 24_800, -25, 'Pike Drywall and Paint'),
    mk('c14', 'pj2', 'Subcontract', 'Solberg Cabinetry', 52_000, -20, 'Solberg Cabinetry'),
    mk('c15', 'pj2', 'Other', 'Permits, dumpsters, supervision', 18_400, -60),
    mk('c16', 'pj2', 'Other', 'Plumbing (outside sub)', 36_900, -45, 'Brentwood Plumbing'),
    mk('c17', 'pj3', 'Labor', 'Crew payroll', 5_800, -1),
    mk('c18', 'pj3', 'Material', 'Shingles, underlayment, ridge vent', 7_400, -5, 'Roofing Supply'),
    mk('c19', 'pj3', 'Subcontract', 'Rudd Roofing crew', 6_900, -1, 'Rudd Roofing Crew'),
    mk('c20', 'pj5', 'Labor', 'Crew payroll', 31_200, -100),
    mk('c21', 'pj5', 'Material', 'Flooring, mirrors, finishes', 38_600, -120, 'Various'),
    mk('c22', 'pj5', 'Subcontract', 'Electrical, HVAC, drywall', 71_400, -110, 'Various'),
    mk('c23', 'pj5', 'Other', 'Permits and general conditions', 11_300, -140),
  ]
}

export function seedInvoices(): Invoice[] {
  return [
    { id: 'in1', projectId: 'pj1', number: 'INV-1041', kind: 'deposit', date: dYmd(-40), dueDate: dYmd(-35), amount: 55_920, retainagePct: 0, status: 'paid', paidAt: at(-38, 10), lineItems: [{ id: 'li1', description: 'Deposit at signing (30 percent)', amount: 55_920 }] },
    { id: 'in2', projectId: 'pj1', number: 'INV-1052', kind: 'progress', date: dYmd(-18), dueDate: dYmd(-13), amount: 55_920, retainagePct: 0, status: 'paid', paidAt: at(-14, 10), lineItems: [{ id: 'li2', description: 'Draw 2: rough-in inspections passed (30 percent)', amount: 55_920 }] },
    { id: 'in3', projectId: 'pj1', number: 'INV-1061', kind: 'progress', date: dYmd(-1), dueDate: dYmd(4), amount: 55_920, retainagePct: 0, status: 'sent', lineItems: [{ id: 'li3', description: 'Draw 3: cabinets installed (30 percent)', amount: 55_920 }] },
    {
      id: 'in4', projectId: 'pj2', number: 'PA-07', kind: 'pay_app', date: dYmd(-6), dueDate: dYmd(24), amount: 41_212, retainagePct: 10, status: 'sent', periodTo: dYmd(-7),
      lineItems: [],
      sov: [
        { id: 'sv1', description: 'General conditions', scheduled: 28_000, previous: 25_200, thisPeriod: 2_800, storedMaterials: 0 },
        { id: 'sv2', description: 'Demolition', scheduled: 14_500, previous: 14_500, thisPeriod: 0, storedMaterials: 0 },
        { id: 'sv3', description: 'Framing and drywall', scheduled: 62_000, previous: 62_000, thisPeriod: 0, storedMaterials: 0 },
        { id: 'sv4', description: 'Electrical', scheduled: 54_000, previous: 51_300, thisPeriod: 2_700, storedMaterials: 0 },
        { id: 'sv5', description: 'Plumbing and medical gas', scheduled: 48_000, previous: 48_000, thisPeriod: 0, storedMaterials: 0 },
        { id: 'sv6', description: 'HVAC', scheduled: 46_000, previous: 46_000, thisPeriod: 0, storedMaterials: 0 },
        { id: 'sv7', description: 'Millwork and casework', scheduled: 78_000, previous: 54_600, thisPeriod: 23_400, storedMaterials: 0 },
        { id: 'sv8', description: 'Flooring', scheduled: 32_000, previous: 25_600, thisPeriod: 6_400, storedMaterials: 0 },
        { id: 'sv9', description: 'Paint and finishes', scheduled: 36_000, previous: 28_800, thisPeriod: 7_200, storedMaterials: 0 },
        { id: 'sv10', description: 'Doors, hardware, glazing', scheduled: 24_000, previous: 19_200, thisPeriod: 3_300, storedMaterials: 1_500 },
        { id: 'sv11', description: 'Change order 1: feature wall', scheduled: 6_400, previous: 6_400, thisPeriod: 0, storedMaterials: 0 },
      ],
    },
    { id: 'in5', projectId: 'pj3', number: 'INV-1058', kind: 'deposit', date: dYmd(-6), dueDate: dYmd(-3), amount: 14_375, retainagePct: 0, status: 'paid', paidAt: at(-5, 9), lineItems: [{ id: 'li5', description: 'Deposit (50 percent)', amount: 14_375 }] },
    { id: 'in6', projectId: 'pj5', number: 'INV-0998', kind: 'final', date: dYmd(-70), dueDate: dYmd(-40), amount: 21_400, retainagePct: 0, status: 'overdue', lineItems: [{ id: 'li6', description: 'Final payment including retainage release', amount: 21_400 }] },
  ]
}

export function seedNotes(): Note[] {
  return [
    { id: 'nt1', title: 'Lumber pricing', bodyHtml: '<p>Nashville Lumber is holding framing package pricing through end of month. Lock the Harrell sunroom package before then.</p>', pinned: true, projectId: 'pj4', createdAt: at(-5, 9), updatedAt: at(-5, 9) },
    { id: 'nt2', title: 'Fire Station 19 pre-bid notes', bodyHtml: '<p>Occupied station, crews sleep on site. Noise after 9 PM not allowed. <b>Two phases</b>: kitchen first, dayroom second. Ask about dumpster location at pre-bid.</p>', pinned: true, createdAt: at(-3, 14), updatedAt: at(-3, 14) },
    { id: 'nt3', title: 'Whitaker island slab', bodyHtml: '<p>Client is choosing between two quartz slabs. Template after the island is set. <i>Remind her Friday.</i></p>', pinned: false, projectId: 'pj1', contactId: 'ct_c1', createdAt: at(-2, 11), updatedAt: at(-2, 11) },
    { id: 'nt4', title: 'Sub COI reminders', bodyHtml: '<ul><li>Whitfield: GL expired, no new assignments until renewed</li><li>Rudd: expires this week</li><li>Mensah: 24 days</li></ul>', pinned: false, createdAt: at(-1, 8), updatedAt: at(-1, 8) },
  ]
}
