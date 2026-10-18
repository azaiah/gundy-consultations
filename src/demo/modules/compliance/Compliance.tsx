import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, AlertTriangle, Building2 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Tabs } from '@/components/Tabs'
import { useDemo } from '../../store'
import { complianceAlerts, subBlockReason, contactName } from '../../selectors'
import type { CompanyDoc } from '../../types'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { ComplianceDocs, expiryBadge } from '../shared/ComplianceDocs'

export default function Compliance() {
  const { state, replace, upsert } = useDemo()
  const [tab, setTab] = useState<'alerts' | 'company' | 'subs'>('alerts')
  const alerts = complianceAlerts(state)
  const subs = state.contacts.filter((c) => c.type === 'sub')
  const blocked = subs.filter((s) => subBlockReason(s))

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Compliance vault" helpKey="compliance" subtitle={`${alerts.filter((a) => a.level === 'expired').length} expired · ${alerts.filter((a) => a.level !== 'expired').length} expiring within 60 days · ${blocked.length} sub${blocked.length === 1 ? '' : 's'} blocked from assignment`} />
      <Tabs className="mb-4" value={tab} onChange={setTab} items={[{ id: 'alerts', label: 'Alerts', count: alerts.length }, { id: 'company', label: 'Company documents', count: state.companyDocs.length }, { id: 'subs', label: 'Subcontractors', count: subs.length }]} />

      {tab === 'alerts' && (
        <div className="space-y-4">
          {blocked.length > 0 && (
            <Card className="border-danger/40">
              <CardHeader title={<span className="inline-flex items-center gap-2 text-danger"><AlertTriangle size={18} /> Blocked from assignment</span>} subtitle="These subs cannot be added to a job until their paperwork is renewed." />
              <CardBody>
                <ul className="divide-y divide-line">
                  {blocked.map((s) => <li key={s.id} className="py-2 flex flex-wrap items-center justify-between gap-2 text-sm"><Link to={`/demo/contacts/${s.id}`} className="text-blueprint underline">{s.company ?? contactName(s)}</Link><span className="text-steel text-xs">{subBlockReason(s)}</span></li>)}
                </ul>
              </CardBody>
            </Card>
          )}
          <Card>
            <CardHeader title="Expiry alerts" subtitle="At 60, 30 and 7 days, and when expired." />
            <CardBody>
              {alerts.length === 0 ? <p className="text-sm text-success flex items-center gap-2"><ShieldCheck size={16} /> Everything is current for the next 60 days.</p> : (
                <ul className="divide-y divide-line">
                  {alerts.map((a, i) => (
                    <li key={i} className="py-2.5 flex flex-wrap items-center gap-2">
                      <Badge tone={a.level === 'expired' ? 'danger' : a.level === '7' ? 'danger' : a.level === '30' ? 'warning' : 'blueprint'} mono>{a.level === 'expired' ? 'Expired' : `${a.level} day`}</Badge>
                      <span className="min-w-0 flex-1 text-sm"><span className="font-medium">{a.holderId ? <Link to={`/demo/contacts/${a.holderId}`} className="underline">{a.holder}</Link> : <span className="inline-flex items-center gap-1"><Building2 size={14} /> {a.holder}</span>}</span> · {a.doc.name}</span>
                      {expiryBadge(a.doc.expires)}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'company' && (
        <Card>
          <CardHeader title={state.brain.name} subtitle="Licenses, insurance, bonds, OSHA cards and EPA RRP certification. Upload up to 2 MB per document (demo)." />
          <CardBody><ComplianceDocs title="Company documents" docs={state.companyDocs} onChange={(docs) => replace('companyDocs', docs.map((d) => ({ ...d, holder: 'company' as const })) as CompanyDoc[], 'Update company documents')} /></CardBody>
        </Card>
      )}

      {tab === 'subs' && (
        <div className="space-y-4">
          {subs.map((s) => {
            const block = subBlockReason(s)
            return (
              <Card key={s.id} className={block ? 'border-danger/40' : ''}>
                <CardHeader title={<Link to={`/demo/contacts/${s.id}`} className="hover:underline">{s.company ?? contactName(s)}</Link>} subtitle={<span className="flex flex-wrap items-center gap-2">{s.trade}{block ? <Badge tone="danger"><AlertTriangle size={11} /> {block}</Badge> : <Badge tone="success">Can be assigned</Badge>}</span>} />
                <CardBody><ComplianceDocs title="Paperwork" docs={s.compliance} onChange={(compliance) => upsert('contacts', { ...s, compliance }, `Update ${s.company ?? contactName(s)} paperwork`)} /></CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
