import { describe, it, expect } from 'vitest'
import { buildIcs, escapeIcs, foldLine, toIcsDateTime } from './ics'

describe('ics', () => {
  it('formats UTC datetimes', () => {
    expect(toIcsDateTime('2026-06-01T14:30:00Z')).toBe('20260601T143000Z')
  })
  it('escapes special characters', () => {
    expect(escapeIcs('Pre-bid; room 2, floor 3\nBring ID')).toBe('Pre-bid\\; room 2\\, floor 3\\nBring ID')
  })
  it('folds long lines at 75 octets', () => {
    const long = 'DESCRIPTION:' + 'x'.repeat(100)
    const folded = foldLine(long)
    const parts = folded.split('\r\n')
    expect(parts[0].length).toBe(75)
    expect(parts[1].startsWith(' ')).toBe(true)
  })
  it('builds a valid calendar with timed and all-day events', () => {
    const ics = buildIcs([
      { uid: 'e1', title: 'Site visit', start: '2026-06-01T14:00:00Z', end: '2026-06-01T15:00:00Z', location: '12 Oak St' },
      { uid: 'e2', title: 'Bid due', start: '2026-06-10T00:00:00', end: '2026-06-10T00:00:00', allDay: true },
    ])
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('UID:e1@gundy-demo')
    expect(ics).toContain('DTSTART:20260601T140000Z')
    expect(ics).toContain('DTSTART;VALUE=DATE:20260610')
    expect(ics).toContain('DTEND;VALUE=DATE:20260611')
    expect(ics).toContain('LOCATION:12 Oak St')
    expect(ics.trim().endsWith('END:VCALENDAR')).toBe(true)
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(2)
  })
})
