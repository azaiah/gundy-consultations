import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Upload, Users, Phone, Mail, AlertTriangle } from 'lucide-react'
import { Tabs } from '@/components/Tabs'
import { Button, LinkButton } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { useDemo } from '../../store'
import { contactName, subBlockReason } from '../../selectors'
import type { ContactType } from '../../types'
import { formatPhone } from '../../lib/vcard'
import { relative } from '../../lib/dates'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { SearchBox } from '../shared/Filters'
import { ContactForm } from './ContactForm'

export default function Contacts() {
  const { state, upsert } = useDemo()
  const [tab, setTab] = useState<ContactType>('lead')
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const nav = useNavigate()

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return state.contacts
      .filter((c) => c.type === tab)
      .filter((c) => !s || `${contactName(c)} ${c.company ?? ''} ${c.phone ?? ''} ${c.email ?? ''} ${c.address ?? ''} ${c.trade ?? ''} ${c.tags.join(' ')}`.toLowerCase().includes(s))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [state.contacts, tab, q])
  const count = (t: ContactType) => state.contacts.filter((c) => c.type === t).length

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Contacts" helpKey="contacts" subtitle={`${state.contacts.length} contacts · leads, customers and subcontractors`} actions={<><LinkButton to="/demo/contacts/import" variant="outline" icon={<Upload size={16} />}>Import</LinkButton><Button onClick={() => setAdding(true)} icon={<Plus size={16} />}>Add contact</Button></>} />
      <Tabs items={[{ id: 'lead', label: 'Leads', count: count('lead') }, { id: 'customer', label: 'Customers', count: count('customer') }, { id: 'sub', label: 'Subcontractors', count: count('sub') }]} value={tab} onChange={setTab} />
      <div className="my-4">
        <SearchBox value={q} onChange={setQ} placeholder={`Search ${tab === 'sub' ? 'subcontractors' : `${tab}s`} by name, company, phone or email`} className="w-full sm:max-w-md" />
      </div>
      {list.length === 0 ? (
        <EmptyState icon={Users} title={q ? 'No matches' : `No ${tab === 'sub' ? 'subcontractors' : `${tab}s`} yet`} text={q ? 'Try a different name, phone or email.' : 'Add one by hand or import from your phone.'} action={<Button onClick={() => setAdding(true)} icon={<Plus size={16} />}>Add contact</Button>} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const block = c.type === 'sub' ? subBlockReason(c) : null
            const lastLog = [...c.logs].sort((a, b) => b.at.localeCompare(a.at))[0]
            const openTodos = state.todos.filter((t) => t.contactId === c.id && !t.done).length
            return (
              <li key={c.id}>
                <Link to={`/demo/contacts/${c.id}`} className="card block p-4 hover:shadow-lift transition-shadow h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink break-words">{`${c.firstName} ${c.lastName}`.trim() || c.company}</p>
                      {c.company && (c.firstName || c.lastName) && <p className="text-sm text-steel break-words">{c.company}</p>}
                      {c.trade && <p className="text-xs text-blueprint mt-0.5">{c.trade}</p>}
                    </div>
                    {block && <Badge tone="danger"><AlertTriangle size={11} /> Blocked</Badge>}
                  </div>
                  <div className="mt-2 space-y-0.5 text-xs text-steel">
                    {c.phone && <p className="flex items-center gap-1.5"><Phone size={12} /> {formatPhone(c.phone)}</p>}
                    {c.email && <p className="flex items-center gap-1.5 break-all"><Mail size={12} /> {c.email}</p>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {c.tags.slice(0, 3).map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
                    {openTodos > 0 && <Badge tone="survey" mono>{openTodos} to-do</Badge>}
                  </div>
                  <p className="mt-2 text-[11px] text-steel">{lastLog ? `Last ${lastLog.type.replace('_', ' ')} ${relative(lastLog.at)}` : `Added ${relative(c.createdAt)}`}</p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {adding && <ContactForm open={adding} onClose={() => setAdding(false)} defaultType={tab} onSave={(c) => { upsert('contacts', c, `Add contact ${contactName(c)}`); nav(`/demo/contacts/${c.id}`) }} />}
    </div>
  )
}
