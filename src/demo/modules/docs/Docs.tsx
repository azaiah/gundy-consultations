import { useState } from 'react'
import { Printer, FileText, FileSignature, FileDiff, Receipt, ListChecks, FileBadge } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Select } from '@/components/Field'
import { useDemo } from '../../store'
import { projectById } from '../../selectors'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'

export default function Docs() {
  const { state } = useDemo()
  const bids = state.opportunities.filter((o) => o.kind === 'bid' && o.status !== 'no_bid')
  const [bidId, setBidId] = useState(bids[0]?.id ?? '')
  const [proposalId, setProposalId] = useState(state.proposals[0]?.id ?? '')
  const [coId, setCoId] = useState(state.changeOrders[0]?.id ?? '')
  const [invoiceId, setInvoiceId] = useState(state.invoices[0]?.id ?? '')
  const [projectId, setProjectId] = useState(state.projects[0]?.id ?? '')
  const open = (path: string) => window.open(`/demo/print/${path}?auto=1`, '_blank')

  const docs = [
    { icon: FileBadge, title: 'Capability statement', text: 'One page from the Company Brain: trades, NAICS, licenses, bonding, certifications, past projects.', action: <Button onClick={() => open('capability')} icon={<Printer size={16} />}>Print</Button> },
    { icon: FileText, title: 'Prequalification packet', text: 'Capability statement plus the bid-specific response, references and compliance summary.', action: <div className="flex gap-2 flex-wrap"><Select aria-label="Bid" value={bidId} onChange={(e) => setBidId(e.target.value)} className="w-56">{bids.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}</Select><Button onClick={() => open(`prequal/${bidId}`)} disabled={!bidId} icon={<Printer size={16} />}>Print</Button></div> },
    { icon: FileSignature, title: 'Proposal', text: 'Branded proposal with scope, inclusions, exclusions, timeline, draws and terms.', action: <div className="flex gap-2 flex-wrap"><Select aria-label="Proposal" value={proposalId} onChange={(e) => setProposalId(e.target.value)} className="w-56">{state.proposals.map((p) => <option key={p.id} value={p.id}>{p.number} · {projectById(state, p.projectId)?.name}</option>)}</Select><Button onClick={() => open(`proposal/${proposalId}`)} disabled={!proposalId} icon={<Printer size={16} />}>Print</Button></div> },
    { icon: FileDiff, title: 'Change order', text: 'Description, cost and schedule impact, signature block.', action: <div className="flex gap-2 flex-wrap"><Select aria-label="Change order" value={coId} onChange={(e) => setCoId(e.target.value)} className="w-56">{state.changeOrders.map((c) => <option key={c.id} value={c.id}>CO #{c.number} · {projectById(state, c.projectId)?.name}</option>)}</Select><Button onClick={() => open(`change-order/${coId}`)} disabled={!coId} icon={<Printer size={16} />}>Print</Button></div> },
    { icon: Receipt, title: 'Invoice or pay application', text: 'Deposit, draw, final invoice, or AIA-style pay application with schedule of values.', action: <div className="flex gap-2 flex-wrap"><Select aria-label="Invoice" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} className="w-56">{state.invoices.map((i) => <option key={i.id} value={i.id}>{i.number} · {projectById(state, i.projectId)?.name}</option>)}</Select><Button onClick={() => open(`invoice/${invoiceId}`)} disabled={!invoiceId} icon={<Printer size={16} />}>Print</Button></div> },
    { icon: ListChecks, title: 'Lien waiver request checklist', text: 'A checklist of waivers to collect per draw. Actual lien waiver forms are state-specific and are supplied as real files in the live system.', action: <div className="flex gap-2 flex-wrap"><Select aria-label="Project" value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-56">{state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select><Button onClick={() => open(`lien-checklist/${projectId}`)} disabled={!projectId} icon={<Printer size={16} />}>Print</Button></div> },
  ]

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="Paperwork on demand" helpKey="docs" subtitle="Printable documents generated from your data. Each opens in a print-ready tab." />
      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((d) => (
          <Card key={d.title}>
            <CardHeader title={<span className="inline-flex items-center gap-2"><d.icon size={18} className="text-blueprint" /> {d.title}</span>} subtitle={d.text} />
            <CardBody>{d.action}</CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
