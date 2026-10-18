import { describe, it, expect } from 'vitest'
import { parseVCards, unfold, normalizePhone, formatPhone } from './vcard'

const sample = `BEGIN:VCARD\r\nVERSION:3.0\r\nN:Reyes;Marisol;;;\r\nFN:Marisol Reyes\r\nORG:Harpeth Valley Construction;\r\nTEL;type=CELL;type=VOICE:(615) 555-0142\r\nEMAIL;type=INTERNET:marisol@harpethvalley.example\r\nADR;type=WORK:;;410 Church St;Nashville;TN;37219;USA\r\nEND:VCARD\r\nBEGIN:VCARD\r\nVERSION:3.0\r\nN:Okafor;Daniel;;;\r\nFN:Daniel Okafor\r\nTEL;type=HOME:6155550167\r\nTEL;type=WORK:+1 615 555 0167\r\nNOTE:This is a long note that is folded across\r\n  two lines in the file.\r\nEND:VCARD\r\nBEGIN:VCARD\r\nVERSION:2.1\r\nN:;;;;\r\nFN:Belle Meade HOA\r\nEMAIL:board@bellemeadehoa.example\r\nEND:VCARD\r\n`

describe('vcard', () => {
  it('unfolds continuation lines', () => {
    const lines = unfold('A:1\r\n b\r\nB:2\n\tc\n')
    expect(lines).toEqual(['A:1b', 'B:2c'])
  })
  it('parses multiple cards with FN, N, TEL, EMAIL, ORG, ADR', () => {
    const cards = parseVCards(sample)
    expect(cards).toHaveLength(3)
    const m = cards[0]
    expect(m.fullName).toBe('Marisol Reyes')
    expect(m.firstName).toBe('Marisol')
    expect(m.lastName).toBe('Reyes')
    expect(m.org).toBe('Harpeth Valley Construction')
    expect(m.phones).toEqual(['+16155550142'])
    expect(m.emails).toEqual(['marisol@harpethvalley.example'])
    expect(m.address).toBe('410 Church St, Nashville, TN, 37219')
  })
  it('dedupes equivalent phone numbers', () => {
    const d = parseVCards(sample)[1]
    expect(d.phones).toEqual(['+16155550167'])
  })
  it('derives first/last from FN when N is empty', () => {
    const h = parseVCards(sample)[2]
    expect(h.firstName).toBe('Belle')
    expect(h.lastName).toBe('Meade HOA')
    expect(h.emails).toEqual(['board@bellemeadehoa.example'])
  })
  it('normalizes and formats phones', () => {
    expect(normalizePhone('(615) 555-0100')).toBe('+16155550100')
    expect(normalizePhone('1-615-555-0100')).toBe('+16155550100')
    expect(formatPhone('+16155550100')).toBe('(615) 555-0100')
  })
  it('handles quoted-printable values', () => {
    const qp = 'BEGIN:VCARD\nN;ENCODING=QUOTED-PRINTABLE:Garc=C3=ADa;Jos=C3=A9\nEND:VCARD'
    const c = parseVCards(qp)[0]
    expect(c.firstName).toBe('José')
    expect(c.lastName).toBe('García')
  })
  it('ignores garbage outside BEGIN/END', () => {
    expect(parseVCards('hello\nTEL:123\n')).toEqual([])
  })
})
