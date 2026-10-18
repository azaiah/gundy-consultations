import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Upload, Smartphone, Download, ArrowLeft, Check } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { useDemo } from '../../store'
import type { Contact, ContactType } from '../../types'
import { parseVCards, formatPhone, type VCardContact } from '../../lib/vcard'
import { samplePhoneContacts } from '../../seed/contacts'
import { uid } from '../../lib/ids'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'

type Row = { key: string; c: VCardContact; tag: ContactType | 'skip'; duplicateOf?: Contact }

export default function ContactImport() {
  const { state, upsert } = useDemo()
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const nav = useNavigate()

  function findDuplicate(c: VCardContact): Contact | undefined {
    return state.contacts.find((x) => (x.phone && c.phones.includes(x.phone)) || (x.email && c.emails.includes(x.email)))
  }
  function load(cards: VCardContact[]) {
    if (!cards.length) {
      setError('No contacts were found in that file. Make sure it is a .vcf export.')
      return
    }
    setError(null)
    setDone(null)
    setRows(cards.map((c, i) => {
      const dup = findDuplicate(c)
      const guessSub = /(electric|plumb|hvac|roof|paint|tile|concrete|cabinet|floor|glass|drywall|mason)/i.test(c.org ?? '')
      const guessLead = /(property|realty|hoa|management|group)/i.test(c.org ?? '')
      return { key: `${i}-${c.fullName}`, c, tag: dup ? 'skip' : guessSub ? 'sub' : guessLead ? 'lead' : 'lead', duplicateOf: dup }
    }))
  }
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const text = await f.text()
      load(parseVCards(text))
    } catch {
      setError('Could not read that file.')
    }
    e.target.value = ''
  }
  function importAll() {
    let n = 0
    for (const r of rows) {
      if (r.tag === 'skip') continue
      const c: Contact = {
        id: uid('ct'), type: r.tag, firstName: r.c.firstName, lastName: r.c.lastName, company: r.c.org || undefined,
        phone: r.c.phones[0], email: r.c.emails[0], address: r.c.address, tags: ['imported'], notesHtml: '', attachments: [], logs: [], createdAt: new Date().toISOString(), source: 'Phone import', compliance: [],
      }
      upsert('contacts', c, `Import ${r.c.fullName}`)
      n += 1
    }
    setDone(n)
    setRows([])
  }
  const setTag = (key: string, tag: Row['tag']) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, tag } : r)))
  const setAll = (tag: Row['tag']) => setRows((rs) => rs.map((r) => (r.duplicateOf ? r : { ...r, tag })))

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Import contacts" helpKey="contacts" subtitle="Bring in your phone contacts and tag each one before it lands." actions={<Link to="/demo/contacts" className="inline-flex items-center gap-1 text-sm text-blueprint min-h-[44px]"><ArrowLeft size={16} /> Back to contacts</Link>} />
      {done !== null && (
        <div role="status" className="mb-4 rounded-lg border border-success/30 bg-[#E6F3EC] p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-success font-medium flex items-center gap-2"><Check size={16} /> Imported {done} contact{done === 1 ? '' : 's'}.</p>
          <Button size="sm" onClick={() => nav('/demo/contacts')}>View contacts</Button>
        </div>
      )}
      {rows.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader title="From a .vcf file" subtitle="What iPhone and Android export when you share contacts." />
            <CardBody>
              <input ref={fileRef} type="file" accept=".vcf,text/vcard,text/x-vcard" onChange={onFile} className="sr-only" aria-label="Choose a .vcf file" />
              <Button onClick={() => fileRef.current?.click()} icon={<Upload size={16} />}>Choose .vcf file</Button>
              <p className="text-xs text-steel mt-3">Handles multiple contacts per file, folded lines, and vCard 2.1, 3.0 and 4.0.</p>
              <a href="/sample-contacts.vcf" download className="mt-3 inline-flex items-center gap-1 text-sm text-blueprint underline min-h-[32px]"><Download size={14} /> Download sample .vcf (5 contacts)</a>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Sample phone contacts" subtitle="Load 10 fake contacts to try the review screen." />
            <CardBody>
              <Button variant="outline" onClick={() => load(samplePhoneContacts)} icon={<Smartphone size={16} />}>Load sample contacts</Button>
              <p className="text-xs text-steel mt-3">One of them duplicates an existing lead so you can see duplicate detection.</p>
            </CardBody>
          </Card>
          {error && <p role="alert" className="md:col-span-2 text-sm text-danger">{error}</p>}
        </div>
      ) : (
        <Card>
          <CardHeader title={`Review ${rows.length} contacts`} subtitle="Tag each one as Lead, Customer or Sub, or skip it. Duplicates are detected by phone or email." action={
            <div className="flex flex-wrap gap-1">
              <Button size="sm" variant="ghost" onClick={() => setAll('lead')}>All leads</Button>
              <Button size="sm" variant="ghost" onClick={() => setAll('sub')}>All subs</Button>
            </div>
          } />
          <CardBody>
            <ul className="divide-y divide-line">
              {rows.map((r) => (
                <li key={r.key} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink break-words">{r.c.fullName}{r.c.org ? <span className="text-steel font-normal"> · {r.c.org}</span> : null}</p>
                    <p className="text-xs text-steel break-words">{[r.c.phones[0] ? formatPhone(r.c.phones[0]) : null, r.c.emails[0], r.c.address].filter(Boolean).join(' · ') || 'No phone or email'}</p>
                    {r.duplicateOf && <Badge tone="warning" className="mt-1">Duplicate of {`${r.duplicateOf.firstName} ${r.duplicateOf.lastName}`.trim() || r.duplicateOf.company} ({r.duplicateOf.type})</Badge>}
                  </div>
                  <div role="radiogroup" aria-label={`Tag ${r.c.fullName}`} className="flex gap-1 flex-wrap">
                    {(['lead', 'customer', 'sub', 'skip'] as const).map((t) => (
                      <button key={t} type="button" role="radio" aria-checked={r.tag === t} onClick={() => setTag(r.key, t)} className={`tap rounded-lg border px-3 text-xs font-medium ${r.tag === t ? (t === 'skip' ? 'border-steel bg-concrete text-ink' : 'border-survey bg-survey-50 text-survey') : 'border-line text-steel hover:border-steel'}`}>
                        {t === 'sub' ? 'Sub' : t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              <Button variant="ghost" onClick={() => setRows([])}>Cancel</Button>
              <Button onClick={importAll} disabled={rows.every((r) => r.tag === 'skip')}>Import {rows.filter((r) => r.tag !== 'skip').length} contact{rows.filter((r) => r.tag !== 'skip').length === 1 ? '' : 's'}</Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
