import type { CompanyBrain, CompanyDoc } from '../types'
import { addDays, ymd } from '../lib/dates'

export function seedBrain(): CompanyBrain {
  const t = new Date()
  return {
    name: 'Cumberland Ridge Builders',
    city: 'Nashville',
    state: 'TN',
    zip: '37210',
    lat: 36.1447,
    lng: -86.7489,
    trades: ['General contractor', 'Carpentry', 'Interior finishes', 'Roofing'],
    naics: ['236118', '236220'],
    licenses: [
      { id: 'lic1', number: 'TN-00074211', classification: 'BC-A (Residential and Commercial)', state: 'TN', expires: ymd(addDays(t, 412)), trade: 'General contractor' },
      { id: 'lic2', number: 'TN-00074211-R', classification: 'Home Improvement', state: 'TN', expires: ymd(addDays(t, 212)), trade: 'Roofing' },
      { id: 'lic3', number: 'TN-00074211-C', classification: 'BC-B (Residential)', state: 'TN', expires: ymd(addDays(t, 412)), trade: 'Carpentry' },
    ],
    bondingSingle: 750_000,
    bondingAggregate: 2_000_000,
    insuranceOccurrence: 1_000_000,
    insuranceAggregate: 2_000_000,
    certifications: [
      { id: 'c1', name: 'OSHA 30', active: true, expires: ymd(addDays(t, 540)) },
      { id: 'c2', name: 'EPA RRP (Lead-Safe Renovator)', active: true, expires: ymd(addDays(t, 300)) },
      { id: 'c3', name: 'TN Drug-Free Workplace', active: true },
    ],
    setAsides: ['State small business'],
    serviceRadiusMiles: 60,
    counties: ['Davidson', 'Williamson', 'Rutherford', 'Wilson', 'Sumner'],
    crewSize: 9,
    typicalJobMin: 40_000,
    typicalJobMax: 650_000,
    pastProjects: [
      { id: 'pp1', name: 'Green Hills Kitchen and Primary Suite', value: 184_000, year: 2025, type: 'Residential remodel' },
      { id: 'pp2', name: 'Berry Hill Dental Office Build-Out', value: 412_000, year: 2025, type: 'Commercial tenant improvement' },
      { id: 'pp3', name: 'Metro Parks Shelter Reroof (3 locations)', value: 96_500, year: 2024, type: 'Public roofing' },
      { id: 'pp4', name: 'Franklin Whole-Home Renovation', value: 540_000, year: 2024, type: 'Residential remodel' },
      { id: 'pp5', name: 'Antioch Church Fellowship Hall Addition', value: 318_000, year: 2023, type: 'Commercial addition' },
    ],
  }
}

export function seedCompanyDocs(): CompanyDoc[] {
  const t = new Date()
  return [
    { id: 'cd1', holder: 'company', kind: 'License', name: 'TN Contractor License BC-A', number: 'TN-00074211', issued: ymd(addDays(t, -318)), expires: ymd(addDays(t, 412)) },
    { id: 'cd2', holder: 'company', kind: 'COI', name: 'General Liability $1M / $2M', number: 'GL-88211-07', issued: ymd(addDays(t, -200)), expires: ymd(addDays(t, 165)) },
    { id: 'cd3', holder: 'company', kind: 'COI', name: "Workers' Compensation", number: 'WC-55019', issued: ymd(addDays(t, -340)), expires: ymd(addDays(t, 25)) },
    { id: 'cd4', holder: 'company', kind: 'Bond', name: 'Surety Bonding Letter $750k / $2M', number: 'SB-2231', issued: ymd(addDays(t, -90)), expires: ymd(addDays(t, 275)) },
    { id: 'cd5', holder: 'company', kind: 'OSHA', name: 'OSHA 30 (owner and two foremen)', issued: ymd(addDays(t, -550)), expires: ymd(addDays(t, 540)) },
    { id: 'cd6', holder: 'company', kind: 'EPA RRP', name: 'EPA Lead-Safe Firm Certification', number: 'NAT-F2219', issued: ymd(addDays(t, -1500)), expires: ymd(addDays(t, 300)) },
    { id: 'cd7', holder: 'company', kind: 'Other', name: 'Commercial Auto Policy', number: 'CA-10944', issued: ymd(addDays(t, -300)), expires: ymd(addDays(t, 6)) },
  ]
}
