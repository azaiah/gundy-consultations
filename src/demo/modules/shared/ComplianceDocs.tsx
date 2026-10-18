import { useRef, useState } from 'react'
import { Upload, Trash2, FileText, Plus } from 'lucide-react'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Input, Select } from '@/components/Field'
import { Modal } from '@/components/Modal'
import type { ComplianceDoc } from '../../types'
import { readFileAsDataUrl } from '../../lib/image'
import { uid } from '../../lib/ids'
import { daysUntil, fmtDate } from '../../lib/dates'

export function expiryBadge(expires?: string) {
  if (!expires) return <Badge tone="neutral" mono>No expiry</Badge>
  const d = daysUntil(expires) ?? 0
  if (d < 0) return <Badge tone="danger" mono>Expired {fmtDate(expires, { month: 'numeric', day: 'numeric' })}</Badge>
  if (d <= 7) return <Badge tone="danger" mono>{d}d left</Badge>
  if (d <= 30) return <Badge tone="warning" mono>{d}d left</Badge>
  if (d <= 60) return <Badge tone="blueprint" mono>{d}d left</Badge>
  return <Badge tone="success" mono>Exp {fmtDate(expires, { month: 'numeric', day: 'numeric', year: '2-digit' })}</Badge>
}

const kinds: ComplianceDoc['kind'][] = ['COI', 'License', 'Bond', 'OSHA', 'EPA RRP', 'W-9', 'Other']

export function ComplianceDocs({ docs, onChange, title = 'Documents' }: { docs: ComplianceDoc[]; onChange: (d: ComplianceDoc[]) => void; title?: string }) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<Partial<ComplianceDoc>>({ kind: 'COI' })
  const [err, setErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadFor, setUploadFor] = useState<string | null>(null)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const dataUrl = await readFileAsDataUrl(f)
      if (uploadFor === 'new') setDraft((d) => ({ ...d, fileName: f.name, dataUrl }))
      else if (uploadFor) onChange(docs.map((d) => (d.id === uploadFor ? { ...d, fileName: f.name, dataUrl } : d)))
      setErr(null)
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Upload failed')
    }
    setUploadFor(null)
  }
  function save() {
    if (!draft.name?.trim()) {
      setErr('Give the document a name.')
      return
    }
    onChange([...docs, { id: uid('cp'), kind: draft.kind ?? 'Other', name: draft.name.trim(), number: draft.number, issued: draft.issued, expires: draft.expires, fileName: draft.fileName, dataUrl: draft.dataUrl }])
    setDraft({ kind: 'COI' })
    setAdding(false)
    setErr(null)
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept=".pdf,image/*" className="sr-only" aria-label="Upload document file" onChange={onFile} />
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="font-semibold">{title}</h3>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)} icon={<Plus size={14} />}>Add document</Button>
      </div>
      {err && <p role="alert" className="text-xs text-danger mb-2">{err}</p>}
      {docs.length === 0 ? <p className="text-sm text-steel">No documents on file.</p> : (
        <ul className="divide-y divide-line">
          {docs.map((d) => (
            <li key={d.id} className="py-2.5 flex flex-wrap items-center gap-2">
              <FileText size={16} className="text-blueprint shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium break-words">{d.name}{d.number ? <span className="font-mono text-xs text-steel"> · {d.number}</span> : null}</p>
                <p className="text-xs text-steel">{d.kind}{d.issued ? ` · issued ${fmtDate(d.issued, { month: 'numeric', day: 'numeric', year: '2-digit' })}` : ''}{d.fileName ? ` · ${d.fileName}` : ' · no file attached'}</p>
              </div>
              {expiryBadge(d.expires)}
              <Button size="sm" variant="ghost" onClick={() => { setUploadFor(d.id); fileRef.current?.click() }} icon={<Upload size={14} />} aria-label={`Upload file for ${d.name}`}>Upload</Button>
              <button type="button" onClick={() => onChange(docs.filter((x) => x.id !== d.id))} className="tap inline-flex items-center justify-center rounded-lg text-steel hover:text-danger" aria-label={`Remove ${d.name}`}><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}
      <Modal open={adding} onClose={() => setAdding(false)} title="Add document" footer={<><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Select label="Type" value={draft.kind} onChange={(e) => setDraft((d) => ({ ...d, kind: e.target.value as ComplianceDoc['kind'] }))}>{kinds.map((k) => <option key={k}>{k}</option>)}</Select>
          <Input label="Name" value={draft.name ?? ''} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="General Liability $1M/$2M" />
          <Input label="Number" value={draft.number ?? ''} onChange={(e) => setDraft((d) => ({ ...d, number: e.target.value }))} />
          <Input label="Issued" type="date" value={draft.issued ?? ''} onChange={(e) => setDraft((d) => ({ ...d, issued: e.target.value }))} />
          <Input label="Expires" type="date" value={draft.expires ?? ''} onChange={(e) => setDraft((d) => ({ ...d, expires: e.target.value }))} />
          <div className="flex items-end">
            <Button variant="outline" onClick={() => { setUploadFor('new'); fileRef.current?.click() }} icon={<Upload size={14} />}>{draft.fileName ? draft.fileName : 'Upload file (max 2 MB)'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
