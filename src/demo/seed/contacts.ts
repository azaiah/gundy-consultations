import type { Contact, Todo } from '../types'
import { addDays, addHours, iso, ymd } from '../lib/dates'

const t = new Date()
const d = (days: number, hours = 9) => iso(addHours(addDays(t, days), hours - t.getHours()))

const mk = (c: Partial<Contact> & Pick<Contact, 'id' | 'type' | 'firstName' | 'lastName'>): Contact => ({
  company: undefined,
  phone: undefined,
  email: undefined,
  address: undefined,
  trade: undefined,
  tags: [],
  notesHtml: '',
  attachments: [],
  logs: [],
  createdAt: d(-30),
  compliance: [],
  ...c,
})

export function seedContacts(): Contact[] {
  return [
    // ---- Leads (12) ----
    mk({ id: 'ct_l1', type: 'lead', firstName: 'Priya', lastName: 'Natarajan', phone: '+16155550111', email: 'priya.n@example.com', address: '2214 Golf Club Ln, Nashville, TN 37215', tags: ['kitchen', 'permit lead'], source: 'Permit sweep', notesHtml: '<p>Permit filed for a kitchen and addition. Owner-occupied. Wants to start after the holidays.</p>', logs: [{ id: 'lg1', type: 'call', at: d(-2, 14), outcome: 'Left voicemail', notes: 'Introduced the company and mentioned the Green Hills kitchen project.' }], createdAt: d(-3) }),
    mk({ id: 'ct_l2', type: 'lead', firstName: 'Marcus', lastName: 'Bell', company: 'Bell Family Trust', phone: '+16155550112', email: 'mbell@example.com', address: '118 Woodmont Blvd, Nashville, TN 37205', tags: ['roof', 'storm damage'], source: 'Website form', createdAt: d(-5) }),
    mk({ id: 'ct_l3', type: 'lead', firstName: 'Lena', lastName: 'Hoffman', company: 'Twelve South Property Management', phone: '+16155550113', email: 'lhoffman@twelvesouthpm.example', address: '2500 12th Ave S, Nashville, TN 37204', tags: ['property manager', 'turnovers'], source: 'Outreach', logs: [{ id: 'lg2', type: 'email', at: d(-6, 10), outcome: 'Replied', notes: 'Asked for insurance certificate and a unit turnover price sheet.' }], createdAt: d(-9) }),
    mk({ id: 'ct_l4', type: 'lead', firstName: 'Desmond', lastName: 'Wright', phone: '+16155550114', address: '4005 Hillsboro Pike, Nashville, TN 37215', tags: ['bathroom'], source: 'Referral', createdAt: d(-12) }),
    mk({ id: 'ct_l5', type: 'lead', firstName: 'Carla', lastName: 'Esposito', company: 'Esposito Dental', phone: '+16155550115', email: 'carla@espositodental.example', address: '5110 Maryland Way, Brentwood, TN 37027', tags: ['commercial', 'build-out'], source: 'Build-out sweep', createdAt: d(-1) }),
    mk({ id: 'ct_l6', type: 'lead', firstName: 'Thomas', lastName: 'Greer', company: 'Lakeshore Pointe HOA', phone: '+16155550116', email: 'board@lakeshorepointe.example', address: 'Hendersonville, TN 37075', tags: ['HOA', 'clubhouse'], source: 'HOA sweep', createdAt: d(-4) }),
    mk({ id: 'ct_l7', type: 'lead', firstName: 'Anita', lastName: 'Shah', phone: '+16155550117', email: 'anita.shah@example.com', address: '1411 Ashwood Ave, Nashville, TN 37212', tags: ['addition'], source: 'Permit sweep', createdAt: d(-2) }),
    mk({ id: 'ct_l8', type: 'lead', firstName: 'Robert', lastName: 'Kinsley', company: 'Kinsley Commercial Realty', phone: '+16155550118', email: 'rk@kinsleycre.example', tags: ['property manager'], source: 'Outreach', createdAt: d(-20) }),
    mk({ id: 'ct_l9', type: 'lead', firstName: 'Jasmine', lastName: 'Ortiz', phone: '+16155550119', address: '812 Fatherland St, Nashville, TN 37206', tags: ['roof', 'gutters'], source: 'Website form', createdAt: d(-8) }),
    mk({ id: 'ct_l10', type: 'lead', firstName: 'Howard', lastName: 'Pruitt', company: 'Pruitt Veterinary Clinic', phone: '+16155550120', email: 'howard@pruittvet.example', address: '220 Nolensville Pike, Nashville, TN 37211', tags: ['commercial', 'build-out'], source: 'Build-out sweep', createdAt: d(-15) }),
    mk({ id: 'ct_l11', type: 'lead', firstName: 'Grace', lastName: 'Lindqvist', phone: '+16155550121', email: 'grace.l@example.com', address: '3302 Lealand Ln, Nashville, TN 37204', tags: ['kitchen', 'primary bath'], source: 'Referral', createdAt: d(-6) }),
    mk({ id: 'ct_l12', type: 'lead', firstName: 'Samuel', lastName: 'Adeyemi', company: 'Sunrise Senior Living Murfreesboro', phone: '+16155550122', email: 's.adeyemi@sunrisesl.example', address: 'Murfreesboro, TN 37129', tags: ['commercial', 'renovation'], source: 'Outreach', createdAt: d(-11) }),

    // ---- Customers (10) ----
    mk({ id: 'ct_c1', type: 'customer', firstName: 'Elaine', lastName: 'Whitaker', phone: '+16155550131', email: 'elaine.w@example.com', address: '4820 Shys Hill Rd, Nashville, TN 37215', tags: ['remodel'], createdAt: d(-120), logs: [{ id: 'lg3', type: 'meeting', at: d(-40, 15), outcome: 'Signed proposal', notes: 'Approved the kitchen and primary suite proposal. Deposit paid.' }] }),
    mk({ id: 'ct_c2', type: 'customer', firstName: 'Nathan', lastName: 'Cho', company: 'Cho Orthodontics', phone: '+16155550132', email: 'nathan@choortho.example', address: '7105 Bakers Bridge Ave, Brentwood, TN 37027', tags: ['commercial'], createdAt: d(-200) }),
    mk({ id: 'ct_c3', type: 'customer', firstName: 'Beatrice', lastName: 'Lamont', phone: '+16155550133', email: 'bea.lamont@example.com', address: '1810 Sweetbriar Ave, Nashville, TN 37212', tags: ['roof'], createdAt: d(-80) }),
    mk({ id: 'ct_c4', type: 'customer', firstName: 'Victor', lastName: 'Reinholt', company: 'Reinholt Holdings', phone: '+16155550134', email: 'victor@reinholt.example', address: '600 Division St, Nashville, TN 37203', tags: ['commercial', 'repeat'], createdAt: d(-400) }),
    mk({ id: 'ct_c5', type: 'customer', firstName: 'Monique', lastName: 'Harrell', phone: '+16155550135', email: 'monique.h@example.com', address: '2209 Blair Blvd, Nashville, TN 37212', tags: ['addition'], createdAt: d(-60) }),
    mk({ id: 'ct_c6', type: 'customer', firstName: 'Gerald', lastName: 'Fitzpatrick', phone: '+16155550136', address: '305 Hillwood Blvd, Nashville, TN 37205', tags: ['bathroom'], createdAt: d(-30) }),
    mk({ id: 'ct_c7', type: 'customer', firstName: 'Olivia', lastName: 'Brandt', company: 'Brandt Boutique Fitness', phone: '+16155550137', email: 'olivia@brandtfit.example', address: '1200 Villa Pl, Nashville, TN 37212', tags: ['commercial'], createdAt: d(-140) }),
    mk({ id: 'ct_c8', type: 'customer', firstName: 'Raymond', lastName: 'Tubbs', phone: '+16155550138', email: 'ray.tubbs@example.com', address: '118 Cumberland Ave, Franklin, TN 37064', tags: ['whole home'], createdAt: d(-300) }),
    mk({ id: 'ct_c9', type: 'customer', firstName: 'Helen', lastName: 'Okonkwo', phone: '+16155550139', email: 'helen.o@example.com', address: '4411 Harding Pike, Nashville, TN 37205', tags: ['kitchen'], createdAt: d(-15) }),
    mk({ id: 'ct_c10', type: 'customer', firstName: 'Metro', lastName: 'Parks and Recreation', company: 'Metro Nashville Parks', phone: '+16155550140', email: 'facilities@nashville.example', address: '2565 Park Plaza, Nashville, TN 37203', tags: ['public', 'repeat'], createdAt: d(-500) }),

    // ---- Subcontractors (8) ----
    mk({ id: 'ct_s1', type: 'sub', firstName: 'Luis', lastName: 'Hernandez', company: 'Hernandez Electric LLC', trade: 'Electrical', phone: '+16155550151', email: 'luis@hernandezelectric.example', tags: ['preferred'], rating: 5, createdAt: d(-600), compliance: [
      { id: 'cp1', kind: 'COI', name: 'General Liability $1M/$2M', number: 'GL-4410', issued: ymd(addDays(t, -200)), expires: ymd(addDays(t, 165)) },
      { id: 'cp2', kind: 'License', name: 'TN Electrical Contractor CE', number: 'TN-E-20118', expires: ymd(addDays(t, 290)) },
    ] }),
    mk({ id: 'ct_s2', type: 'sub', firstName: 'Dana', lastName: 'Whitfield', company: 'Whitfield Plumbing', trade: 'Plumbing', phone: '+16155550152', email: 'dana@whitfieldplumbing.example', tags: ['preferred'], rating: 4, createdAt: d(-500), compliance: [
      { id: 'cp3', kind: 'COI', name: 'General Liability $1M/$2M', number: 'GL-7781', issued: ymd(addDays(t, -380)), expires: ymd(addDays(t, -15)) }, // EXPIRED
      { id: 'cp4', kind: 'License', name: 'TN Plumbing Contractor CMC', number: 'TN-P-30877', expires: ymd(addDays(t, 120)) },
    ] }),
    mk({ id: 'ct_s3', type: 'sub', firstName: 'Kwame', lastName: 'Mensah', company: 'Mensah HVAC Services', trade: 'HVAC', phone: '+16155550153', email: 'kwame@mensahhvac.example', tags: [], rating: 4, createdAt: d(-420), compliance: [
      { id: 'cp5', kind: 'COI', name: 'General Liability $1M/$2M', number: 'GL-2210', expires: ymd(addDays(t, 24)) }, // expiring soon
      { id: 'cp6', kind: 'License', name: 'TN HVAC Contractor CMC-A', number: 'TN-H-11290', expires: ymd(addDays(t, 400)) },
    ] }),
    mk({ id: 'ct_s4', type: 'sub', firstName: 'Shannon', lastName: 'Pike', company: 'Pike Drywall and Paint', trade: 'Drywall and paint', phone: '+16155550154', email: 'shannon@pikedrywall.example', tags: [], rating: 4, createdAt: d(-350), compliance: [
      { id: 'cp7', kind: 'COI', name: 'General Liability $1M/$2M', number: 'GL-9031', expires: ymd(addDays(t, 210)) },
      { id: 'cp8', kind: 'W-9', name: 'W-9 on file' },
    ] }),
    mk({ id: 'ct_s5', type: 'sub', firstName: 'Omar', lastName: 'Farouk', company: 'Farouk Tile and Stone', trade: 'Tile', phone: '+16155550155', email: 'omar@farouktile.example', tags: ['preferred'], rating: 5, createdAt: d(-280), compliance: [
      { id: 'cp9', kind: 'COI', name: 'General Liability $1M/$2M', number: 'GL-6612', expires: ymd(addDays(t, 55)) }, // 60-day alert
    ] }),
    mk({ id: 'ct_s6', type: 'sub', firstName: 'Teresa', lastName: 'Villanueva', company: 'TV Concrete and Masonry', trade: 'Concrete and masonry', phone: '+16155550156', email: 'teresa@tvconcrete.example', tags: [], rating: 3, createdAt: d(-240), compliance: [
      { id: 'cp10', kind: 'COI', name: 'General Liability $1M/$2M', number: 'GL-3300', expires: ymd(addDays(t, 140)) },
      { id: 'cp11', kind: 'License', name: 'TN Masonry Contractor', number: 'TN-M-5531', expires: ymd(addDays(t, -40)) }, // EXPIRED license
    ] }),
    mk({ id: 'ct_s7', type: 'sub', firstName: 'Caleb', lastName: 'Rudd', company: 'Rudd Roofing Crew', trade: 'Roofing', phone: '+16155550157', email: 'caleb@ruddroofing.example', tags: [], rating: 4, createdAt: d(-180), compliance: [
      { id: 'cp12', kind: 'COI', name: 'General Liability $1M/$2M', number: 'GL-1188', expires: ymd(addDays(t, 6)) }, // 7-day alert
      { id: 'cp13', kind: 'OSHA', name: 'OSHA 10 (crew lead)', expires: ymd(addDays(t, 700)) },
    ] }),
    mk({ id: 'ct_s8', type: 'sub', firstName: 'Ingrid', lastName: 'Solberg', company: 'Solberg Cabinetry', trade: 'Cabinetry and millwork', phone: '+16155550158', email: 'ingrid@solbergcabinetry.example', tags: ['preferred'], rating: 5, createdAt: d(-150), compliance: [
      { id: 'cp14', kind: 'COI', name: 'General Liability $1M/$2M', number: 'GL-4455', expires: ymd(addDays(t, 300)) },
      { id: 'cp15', kind: 'W-9', name: 'W-9 on file' },
    ] }),
  ]
}

export function seedTodos(): Todo[] {
  return [
    { id: 'td1', title: 'Call Priya Natarajan back about kitchen scope', due: ymd(t), done: false, contactId: 'ct_l1', createdAt: d(-2) },
    { id: 'td2', title: 'Send COI and turnover price sheet to Twelve South PM', due: ymd(addDays(t, -1)), done: false, contactId: 'ct_l3', createdAt: d(-6) },
    { id: 'td3', title: 'Order quartz slab for Whitaker kitchen', due: ymd(addDays(t, 2)), done: false, projectId: 'pj1', createdAt: d(-3) },
    { id: 'td4', title: 'Schedule final inspection for Lamont reroof', due: ymd(addDays(t, 4)), done: false, projectId: 'pj3', createdAt: d(-1) },
    { id: 'td5', title: 'Request updated COI from Whitfield Plumbing', due: ymd(addDays(t, -3)), done: false, contactId: 'ct_s2', createdAt: d(-10) },
    { id: 'td6', title: 'Walk Esposito Dental space with Carla', due: ymd(addDays(t, 3)), done: false, contactId: 'ct_l5', createdAt: d(-1) },
    { id: 'td7', title: 'Submit Fire Station 19 prequal packet', due: ymd(addDays(t, 5)), done: false, createdAt: d(-2) },
    { id: 'td8', title: 'Pay Hernandez Electric draw 2', due: ymd(addDays(t, -2)), done: true, contactId: 'ct_s1', createdAt: d(-8) },
    { id: 'td9', title: 'Photograph finished Cho Orthodontics lobby for website', due: ymd(addDays(t, 7)), done: false, projectId: 'pj2', createdAt: d(-4) },
    { id: 'td10', title: 'Renew commercial auto policy', due: ymd(addDays(t, 5)), done: false, createdAt: d(-12) },
  ]
}

export const samplePhoneContacts = [
  { fullName: 'Aaron Delgado', firstName: 'Aaron', lastName: 'Delgado', phones: ['+16155550201'], emails: ['aaron.d@example.com'], org: '' },
  { fullName: 'Brooke Tanaka', firstName: 'Brooke', lastName: 'Tanaka', phones: ['+16155550202'], emails: [], org: 'Tanaka Interiors' },
  { fullName: 'Chris Mbeki', firstName: 'Chris', lastName: 'Mbeki', phones: ['+16155550203'], emails: ['chris@mbekipainting.example'], org: 'Mbeki Painting' },
  { fullName: 'Diane Russo', firstName: 'Diane', lastName: 'Russo', phones: ['+16155550204'], emails: ['diane.russo@example.com'], org: '' },
  { fullName: 'Evan Castellano', firstName: 'Evan', lastName: 'Castellano', phones: ['+16155550205'], emails: [], org: 'Castellano Glass' },
  { fullName: 'Farah Qureshi', firstName: 'Farah', lastName: 'Qureshi', phones: ['+16155550206'], emails: ['farah.q@example.com'], org: 'Qureshi Property Group' },
  { fullName: 'Gavin Holloway', firstName: 'Gavin', lastName: 'Holloway', phones: ['+16155550207'], emails: [], org: '' },
  { fullName: 'Hana Petrova', firstName: 'Hana', lastName: 'Petrova', phones: ['+16155550208'], emails: ['hana@petrovaflooring.example'], org: 'Petrova Flooring' },
  { fullName: 'Isaac Boateng', firstName: 'Isaac', lastName: 'Boateng', phones: ['+16155550209'], emails: ['isaac.b@example.com'], org: '' },
  { fullName: 'Priya Natarajan', firstName: 'Priya', lastName: 'Natarajan', phones: ['+16155550111'], emails: ['priya.n@example.com'], org: '' }, // duplicate on purpose
]
