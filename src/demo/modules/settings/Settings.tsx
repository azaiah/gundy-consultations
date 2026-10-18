import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2, RotateCcw, Shield, User, Check } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Input, Select, Toggle } from '@/components/Field'
import { Modal } from '@/components/Modal'
import { Tabs } from '@/components/Tabs'
import { useDemo } from '../../store'
import type { PriceBookItem, Role, Seat, Settings as SettingsT } from '../../types'
import { money } from '../../lib/money'
import { uid } from '../../lib/ids'
import { packages } from '@/config/site'
import { roleMeta } from '../../nav'
import { cadenceLabel } from '../../selectors'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'

const allSources = ['SAM.gov', 'State of Tennessee CPO', 'Metro Nashville Procurement', 'Williamson County', 'Rutherford County', 'Metro Nashville Public Schools', 'MDHA', 'GC Invitation to Bid', 'Metro Codes Permit', 'Commercial Build-Out', 'Property Manager', 'HOA']

export default function Settings() {
  const { state, set, reset } = useDemo()
  const nav = useNavigate()
  const s = state.settings
  const up = (patch: Partial<SettingsT>, label = 'Update settings') => set('settings', { ...s, ...patch }, label)
  const [tab, setTab] = useState<'company' | 'pricebook' | 'seats' | 'notifications' | 'sweeps' | 'demo'>('company')
  const [confirm, setConfirm] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)
  const flash = (k: string) => { setSaved(k); setTimeout(() => setSaved(null), 1500) }

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Settings" helpKey="settings" subtitle="Company profile, tax rate, price book, seats, notifications, sweep sources and demo controls." />
      <Tabs className="mb-4" value={tab} onChange={setTab} items={[{ id: 'company', label: 'Company and profile' }, { id: 'pricebook', label: 'Price book', count: s.priceBook.length }, { id: 'seats', label: 'Roles and seats', count: s.seats.length }, { id: 'notifications', label: 'Notifications' }, { id: 'sweeps', label: 'Sweep sources' }, { id: 'demo', label: 'Demo controls' }]} />

      {tab === 'company' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Company profile" subtitle="Trades, licenses and bonding live in the Company Brain." action={<Link to="/demo/brain" className="text-sm text-blueprint underline min-h-[32px] inline-flex items-center">Open Company Brain</Link>} />
            <CardBody className="grid gap-3">
              <Input label="Company name" value={state.brain.name} onChange={(e) => set('brain', { ...state.brain, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Default tax rate %" type="number" step="0.01" min={0} value={s.defaultTaxRatePct} onChange={(e) => up({ defaultTaxRatePct: Number(e.target.value) || 0 }, 'Update default tax rate')} hint="new estimates" />
                <Select label="Package" value={s.packageId} onChange={(e) => up({ packageId: e.target.value as SettingsT['packageId'] })}>{packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
              </div>
              <p className="text-xs text-steel">Sweep cadence: {cadenceLabel[s.packageId]}.</p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title={<span className="inline-flex items-center gap-2"><User size={16} /> Edit profile</span>} subtitle="The name that signs proposals and generated messages." />
            <CardBody className="grid gap-3">
              <Input label="Your name" value={s.profile.ownerName} onChange={(e) => up({ profile: { ...s.profile, ownerName: e.target.value } })} />
              <Input label="Email" type="email" value={s.profile.email} onChange={(e) => up({ profile: { ...s.profile, email: e.target.value } })} />
              <Input label="Phone" type="tel" value={s.profile.phone} onChange={(e) => up({ profile: { ...s.profile, phone: e.target.value } })} />
              <Button variant="outline" size="sm" onClick={() => flash('profile')} icon={saved === 'profile' ? <Check size={14} /> : undefined}>{saved === 'profile' ? 'Saved' : 'Save profile'}</Button>
            </CardBody>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader title={<span className="inline-flex items-center gap-2"><Shield size={16} /> Privacy and security</span>} subtitle="Demo controls that mirror the live app's account settings." />
            <CardBody>
              <div className="divide-y divide-line">
                <Toggle label="Two-factor authentication" description="Require a code from your phone at sign-in." checked={s.security.twoFactor} onChange={(v) => up({ security: { ...s.security, twoFactor: v } })} />
                <Toggle label="Share anonymized usage data" description="Helps improve the portal. Never includes your contacts, projects or documents." checked={s.security.shareAnonymizedUsage} onChange={(v) => up({ security: { ...s.security, shareAnonymizedUsage: v } })} />
                <div className="py-2">
                  <Select label="Session timeout" value={String(s.security.sessionTimeoutMin)} onChange={(e) => up({ security: { ...s.security, sessionTimeoutMin: Number(e.target.value) } })} className="max-w-xs">{[15, 30, 60, 240, 480].map((m) => <option key={m} value={m}>{m < 60 ? `${m} minutes` : `${m / 60} hour${m > 60 ? 's' : ''}`}</option>)}</Select>
                </div>
              </div>
              <p className="text-xs text-steel mt-3">Read the <Link to="/privacy" className="underline text-blueprint">Privacy Policy</Link> and <Link to="/terms" className="underline text-blueprint">Terms of Service</Link>.</p>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'pricebook' && (
        <Card>
          <CardHeader title="Price book" subtitle="Saved line items the estimator can pull from." action={<Button size="sm" onClick={() => up({ priceBook: [...s.priceBook, { id: uid('pb'), section: 'General conditions', category: 'Other', description: 'New item', unit: 'ea', unitCost: 0 }] }, 'Add price book item')} icon={<Plus size={14} />}>Add item</Button>} />
          <CardBody>
            <div className="space-y-2">
              {s.priceBook.map((p) => (
                <div key={p.id} className="grid gap-2 sm:grid-cols-12 items-center rounded-lg border border-line p-2">
                  <Input aria-label="Section" className="sm:col-span-2" value={p.section} onChange={(e) => up({ priceBook: s.priceBook.map((x) => (x.id === p.id ? { ...x, section: e.target.value } : x)) })} />
                  <Input aria-label="Description" className="sm:col-span-4" value={p.description} onChange={(e) => up({ priceBook: s.priceBook.map((x) => (x.id === p.id ? { ...x, description: e.target.value } : x)) })} />
                  <Select aria-label="Category" className="sm:col-span-2" value={p.category} onChange={(e) => up({ priceBook: s.priceBook.map((x) => (x.id === p.id ? { ...x, category: e.target.value as PriceBookItem['category'] } : x)) })}>{['Labor', 'Material', 'Equipment', 'Subcontract', 'Other'].map((c) => <option key={c}>{c}</option>)}</Select>
                  <Input aria-label="Unit" className="sm:col-span-1" value={p.unit} onChange={(e) => up({ priceBook: s.priceBook.map((x) => (x.id === p.id ? { ...x, unit: e.target.value } : x)) })} />
                  <Input aria-label="Unit cost" className="sm:col-span-2" type="number" min={0} step="0.01" value={p.unitCost} onChange={(e) => up({ priceBook: s.priceBook.map((x) => (x.id === p.id ? { ...x, unitCost: Number(e.target.value) || 0 } : x)) })} />
                  <div className="sm:col-span-1 flex justify-end"><button type="button" onClick={() => up({ priceBook: s.priceBook.filter((x) => x.id !== p.id) }, 'Remove price book item')} className="tap inline-flex items-center justify-center rounded-lg text-steel hover:text-danger" aria-label={`Remove ${p.description}`}><Trash2 size={16} /></button></div>
                </div>
              ))}
            </div>
            <p className="text-xs text-steel mt-3">{s.priceBook.length} items · average unit cost {money(s.priceBook.reduce((a, p) => a + p.unitCost, 0) / Math.max(1, s.priceBook.length))}</p>
          </CardBody>
        </Card>
      )}

      {tab === 'seats' && (
        <Card>
          <CardHeader title="Roles and seats" subtitle={`${s.seats.filter((x) => x.active).length} active of ${packages.find((p) => p.id === s.packageId)?.seats ?? ''} on ${packages.find((p) => p.id === s.packageId)?.name}.`} action={<Button size="sm" onClick={() => up({ seats: [...s.seats, { id: uid('st'), name: 'New user', email: '', role: 'office', active: true }] }, 'Add seat')} icon={<Plus size={14} />}>Add seat</Button>} />
          <CardBody>
            <ul className="space-y-2">
              {s.seats.map((seat) => (
                <li key={seat.id} className="grid gap-2 sm:grid-cols-12 items-center rounded-lg border border-line p-2">
                  <Input aria-label="Name" className="sm:col-span-3" value={seat.name} onChange={(e) => up({ seats: s.seats.map((x) => (x.id === seat.id ? { ...x, name: e.target.value } : x)) })} />
                  <Input aria-label="Email" className="sm:col-span-4" type="email" value={seat.email} onChange={(e) => up({ seats: s.seats.map((x) => (x.id === seat.id ? { ...x, email: e.target.value } : x)) })} />
                  <Select aria-label="Role" className="sm:col-span-3" value={seat.role} onChange={(e) => up({ seats: s.seats.map((x) => (x.id === seat.id ? { ...x, role: e.target.value as Role } : x)) })}>{(Object.keys(roleMeta) as Role[]).map((r) => <option key={r} value={r}>{roleMeta[r].label}</option>)}</Select>
                  <div className="sm:col-span-2 flex items-center justify-between gap-2">
                    <button type="button" onClick={() => up({ seats: s.seats.map((x) => (x.id === seat.id ? { ...x, active: !x.active } : x)) })} className="min-h-[36px]"><Badge tone={seat.active ? 'success' : 'neutral'}>{seat.active ? 'Active' : 'Inactive'}</Badge></button>
                    <button type="button" onClick={() => up({ seats: s.seats.filter((x: Seat) => x.id !== seat.id) }, 'Remove seat')} className="tap inline-flex items-center justify-center rounded-lg text-steel hover:text-danger" aria-label={`Remove ${seat.name}`}><Trash2 size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card>
          <CardHeader title="Notifications" subtitle="Demo toggles. The live app sends email and push." />
          <CardBody className="divide-y divide-line">
            <Toggle label="New finds after each sweep" checked={s.notifications.newFinds} onChange={(v) => up({ notifications: { ...s.notifications, newFinds: v } })} />
            <Toggle label="Bid due in 7, 3 and 1 days" checked={s.notifications.bidDue} onChange={(v) => up({ notifications: { ...s.notifications, bidDue: v } })} />
            <Toggle label="Compliance expiring at 60, 30 and 7 days" checked={s.notifications.complianceExpiry} onChange={(v) => up({ notifications: { ...s.notifications, complianceExpiry: v } })} />
            <Toggle label="Invoice overdue" checked={s.notifications.invoiceOverdue} onChange={(v) => up({ notifications: { ...s.notifications, invoiceOverdue: v } })} />
            <Toggle label="Weekly briefing on Monday morning" checked={s.notifications.weeklyBriefing} onChange={(v) => up({ notifications: { ...s.notifications, weeklyBriefing: v } })} />
          </CardBody>
        </Card>
      )}

      {tab === 'sweeps' && (
        <Card>
          <CardHeader title="Sweep sources" subtitle="Turn a source off and the next run skips it." />
          <CardBody className="divide-y divide-line">
            {allSources.map((src) => <Toggle key={src} label={src} checked={s.sweepSources[src] !== false} onChange={(v) => up({ sweepSources: { ...s.sweepSources, [src]: v } }, `Toggle source ${src}`)} />)}
          </CardBody>
        </Card>
      )}

      {tab === 'demo' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Simulate offline" subtitle="Saves queue up and flush when you turn it back on. Some flushes fail on purpose so you can see Retry." />
            <CardBody><Toggle label="Simulate offline" checked={s.simulateOffline} onChange={(v) => set('settings', { ...s, simulateOffline: v })} /></CardBody>
          </Card>
          <Card>
            <CardHeader title="Tour and reset" />
            <CardBody className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => up({ tourDone: false })} icon={<RotateCcw size={16} />}>Replay tour</Button>
              <Button variant="danger" onClick={() => setConfirm(true)}>Reset demo</Button>
              <Link to="/demo/help" className="inline-flex items-center text-sm text-blueprint underline min-h-[44px] px-1">Help Center</Link>
            </CardBody>
          </Card>
        </div>
      )}

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset the demo?" size="sm" footer={<><Button variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button><Button variant="danger" onClick={() => { reset(); setConfirm(false); nav('/demo') }}>Reset to sample data</Button></>}>
        <p className="text-sm text-steel">All changes in this browser are replaced with the original sample data.</p>
      </Modal>
    </div>
  )
}
