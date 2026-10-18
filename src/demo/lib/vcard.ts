export type VCardContact = {
  fullName: string
  firstName: string
  lastName: string
  phones: string[]
  emails: string[]
  org?: string
  address?: string
}

/** Unfold RFC 6350 folded lines (CRLF or LF followed by a space or tab). */
export function unfold(text: string): string[] {
  const raw = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const out: string[] = []
  for (const line of raw) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && out.length) {
      out[out.length - 1] += line.slice(1)
    } else {
      out.push(line)
    }
  }
  return out.filter((l) => l.trim().length > 0)
}

function decodeValue(v: string, params: string): string {
  let s = v
  if (/ENCODING=QUOTED-PRINTABLE/i.test(params)) {
    s = s.replace(/=\n/g, '').replace(/=([0-9A-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    try {
      s = decodeURIComponent(
        Array.from(s)
          .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join(''),
      )
    } catch {
      /* keep raw */
    }
  }
  return s.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\').trim()
}

function splitProp(line: string): { name: string; params: string; value: string } | null {
  const idx = line.indexOf(':')
  if (idx < 0) return null
  const head = line.slice(0, idx)
  const value = line.slice(idx + 1)
  const semi = head.indexOf(';')
  const nameWithGroup = semi >= 0 ? head.slice(0, semi) : head
  const params = semi >= 0 ? head.slice(semi + 1) : ''
  const dot = nameWithGroup.indexOf('.')
  const name = (dot >= 0 ? nameWithGroup.slice(dot + 1) : nameWithGroup).toUpperCase()
  return { name, params, value }
}

export function normalizePhone(p: string): string {
  const digits = p.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (digits.length === 10) return `+1${digits}`
  return digits
}

/** Parses one or more vCards (2.1, 3.0 or 4.0) from a file's text. */
export function parseVCards(text: string): VCardContact[] {
  const lines = unfold(text)
  const cards: VCardContact[] = []
  let cur: VCardContact | null = null
  for (const line of lines) {
    const p = splitProp(line)
    if (!p) continue
    if (p.name === 'BEGIN' && p.value.trim().toUpperCase() === 'VCARD') {
      cur = { fullName: '', firstName: '', lastName: '', phones: [], emails: [] }
      continue
    }
    if (p.name === 'END' && p.value.trim().toUpperCase() === 'VCARD') {
      if (cur) {
        if (!cur.fullName) cur.fullName = [cur.firstName, cur.lastName].filter(Boolean).join(' ').trim() || cur.org || ''
        if (!cur.firstName && !cur.lastName && cur.fullName) {
          const parts = cur.fullName.split(/\s+/)
          cur.firstName = parts[0] ?? ''
          cur.lastName = parts.slice(1).join(' ')
        }
        cards.push(cur)
      }
      cur = null
      continue
    }
    if (!cur) continue
    const v = decodeValue(p.value, p.params)
    switch (p.name) {
      case 'FN':
        cur.fullName = v
        break
      case 'N': {
        const [last = '', first = ''] = v.split(';')
        cur.lastName = last.trim()
        cur.firstName = first.trim()
        break
      }
      case 'TEL': {
        const n = normalizePhone(v)
        if (n && !cur.phones.includes(n)) cur.phones.push(n)
        break
      }
      case 'EMAIL': {
        const e = v.toLowerCase()
        if (e && !cur.emails.includes(e)) cur.emails.push(e)
        break
      }
      case 'ORG':
        cur.org = v.split(';')[0]?.trim()
        break
      case 'ADR': {
        const parts = v.split(';').map((s) => s.trim()).filter(Boolean)
        // ADR: PO box; extended; street; locality; region; postal; country
        const raw = v.split(';')
        const street = raw[2]?.trim()
        const city = raw[3]?.trim()
        const region = raw[4]?.trim()
        const postal = raw[5]?.trim()
        const formatted = [street, [city, region].filter(Boolean).join(', '), postal].filter(Boolean).join(', ')
        cur.address = formatted || parts.join(', ')
        break
      }
      default:
        break
    }
  }
  return cards
}

export function formatPhone(p?: string): string {
  if (!p) return ''
  const d = p.replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('1')) return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  return p
}
