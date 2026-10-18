import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { Input, Select } from '@/components/Field'
import type { Contact, ContactType } from '../../types'
import { uid } from '../../lib/ids'
import { normalizePhone } from '../../lib/vcard'

export function ContactForm({ open, onClose, onSave, initial, defaultType = 'lead' }: { open: boolean; onClose: () => void; onSave: (c: Contact) => void; initial?: Contact; defaultType?: ContactType }) {
  const [f, setF] = useState<Partial<Contact>>(initial ?? { type: defaultType, tags: [] })
  const [err, setErr] = useState<string | null>(null)
  const set = (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }))

  function save() {
    if (!(f.firstName?.trim() || f.lastName?.trim() || f.company?.trim())) {
      setErr('Enter at least a name or a company.')
      return
    }
    const c: Contact = {
      id: initial?.id ?? uid('ct'),
      type: (f.type as ContactType) ?? defaultType,
      firstName: f.firstName?.trim() ?? '',
      lastName: f.lastName?.trim() ?? '',
      company: f.company?.trim() || undefined,
      phone: f.phone ? normalizePhone(f.phone) : undefined,
      email: f.email?.trim().toLowerCase() || undefined,
      address: f.address?.trim() || undefined,
      trade: f.trade?.trim() || undefined,
      tags: initial?.tags ?? [],
      notesHtml: initial?.notesHtml ?? '',
      attachments: initial?.attachments ?? [],
      logs: initial?.logs ?? [],
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      source: initial?.source ?? 'Manual',
      compliance: initial?.compliance ?? [],
      rating: initial?.rating,
    }
    onSave(c)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit contact' : 'Add contact'} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}>Save</Button></>}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Select label="Type" value={f.type ?? defaultType} onChange={set('type')}>
          <option value="lead">Lead</option>
          <option value="customer">Customer</option>
          <option value="sub">Subcontractor</option>
        </Select>
        <Input label="Company" value={f.company ?? ''} onChange={set('company')} />
        <Input label="First name" value={f.firstName ?? ''} onChange={set('firstName')} />
        <Input label="Last name" value={f.lastName ?? ''} onChange={set('lastName')} />
        <Input label="Phone" type="tel" value={f.phone ?? ''} onChange={set('phone')} />
        <Input label="Email" type="email" value={f.email ?? ''} onChange={set('email')} />
        <Input label="Address" className="sm:col-span-2" value={f.address ?? ''} onChange={set('address')} />
        {(f.type ?? defaultType) === 'sub' && <Input label="Trade" className="sm:col-span-2" value={f.trade ?? ''} onChange={set('trade')} placeholder="Electrical, Plumbing, HVAC..." />}
      </div>
      {err && <p className="text-sm text-danger mt-2" role="alert">{err}</p>}
    </Modal>
  )
}
