export type IcsEvent = {
  uid: string
  title: string
  start: string // ISO
  end: string // ISO
  allDay?: boolean
  location?: string
  description?: string
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}
export function toIcsDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}
export function toIcsDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
}
export function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}
/** Fold lines at 75 octets per RFC 5545. */
export function foldLine(line: string): string {
  const out: string[] = []
  let cur = ''
  let bytes = 0
  for (const ch of line) {
    const b = new TextEncoder().encode(ch).length
    if (bytes + b > 75) {
      out.push(cur)
      cur = ' ' + ch
      bytes = 1 + b
    } else {
      cur += ch
      bytes += b
    }
  }
  out.push(cur)
  return out.join('\r\n')
}

export function buildIcs(events: IcsEvent[], calName = 'Gundy Portal'): string {
  const now = toIcsDateTime(new Date().toISOString())
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gundy Consultations//Portal Demo//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(calName)}`,
  ]
  for (const e of events) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${e.uid}@gundy-demo`)
    lines.push(`DTSTAMP:${now}`)
    if (e.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${toIcsDate(e.start)}`)
      const endDate = new Date(e.end)
      endDate.setDate(endDate.getDate() + 1)
      lines.push(`DTEND;VALUE=DATE:${toIcsDate(endDate.toISOString())}`)
    } else {
      lines.push(`DTSTART:${toIcsDateTime(e.start)}`)
      lines.push(`DTEND:${toIcsDateTime(e.end)}`)
    }
    lines.push(`SUMMARY:${escapeIcs(e.title)}`)
    if (e.location) lines.push(`LOCATION:${escapeIcs(e.location)}`)
    if (e.description) lines.push(`DESCRIPTION:${escapeIcs(e.description)}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

export function downloadIcs(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.endsWith('.ics') ? fileName : `${fileName}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
