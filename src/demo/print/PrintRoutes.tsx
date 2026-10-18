import { useEffect, type ReactNode } from 'react'
import { Link, Route, Routes, useParams, useSearchParams } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'
import { GundyLogo } from '@/components/GundyLogo'
import { Button } from '@/components/Button'
import { useDemo } from '../store'
import { contactById, contactName, projectById, scoreFor } from '../selectors'
import { money, computeEstimateTotals, lineTotal, round2 } from '../lib/money'
import { fmtDate, fmtDateTime, ymd } from '../lib/dates'
import { invoiceNetDue } from '../modules/invoices/ProjectInvoices'
import { site } from '@/config/site'
import './print.css'

function Doc({ title, children, subtitle }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  const [params] = useSearchParams()
  const { state } = useDemo()
  useEffect(() => {
    document.title = `${title} · ${state.brain.name}`
    if (params.get('auto') === '1') {
      const t = setTimeout(() => window.print(), 600)
      return () => clearTimeout(t)
    }
  }, [params, title, state.brain.name])
  return (
    <div className="min-h-screen bg-concrete">
      <div className="print-toolbar sticky top-0 z-10 bg-ink text-white px-4 py-2 flex items-center justify-between gap-2">
        <Link to="/demo/docs" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white min-h-[40px]"><ArrowLeft size={16} /> Back to portal</Link>
        <span className="font-mono text-xs uppercase tracking-widest text-white/60">Sample data · print preview</span>
        <Button size="sm" onClick={() => window.print()} icon={<Printer size={14} />}>Print</Button>
      </div>
      <article className="print-doc">
        <header className="flex items-start justify-between gap-4 pb-4 border-b-2 border-ink">
          <div>
            <GundyLogo size="sm" />
            <p className="stamp mt-2">Prepared by {state.brain.name}</p>
            <p className="text-[11px] text-steel">{state.brain.city}, {state.brain.state} {state.brain.zip} · {state.settings.profile.phone} · {state.settings.profile.email}</p>
          </div>
          <div className="text-right">
            <h1>{title}</h1>
            {subtitle && <div className="stamp mt-1">{subtitle}</div>}
          </div>
        </header>
        {children}
        <footer className="mt-10 pt-3 border-t border-line text-[10px] text-steel flex justify-between">
          <span>{state.brain.name} · TN License {state.brain.licenses[0]?.number ?? ''}</span>
          <span>Generated {fmtDateTime(new Date())} · Portal by {site.name}</span>
        </footer>
      </article>
    </div>
  )
}

function Capability() {
  const { state } = useDemo()
  const b = state.brain
  return (
    <Doc title="Capability statement" subtitle={ymd(new Date())}>
      <CapabilityBody />
      <h2>Contact</h2>
      <p>{state.settings.profile.ownerName}, Owner · {state.settings.profile.phone} · {state.settings.profile.email}</p>
      <p className="stamp mt-1">NAICS {b.naics.join(', ')}</p>
    </Doc>
  )
}

function CapabilityBody() {
  const { state } = useDemo()
  const b = state.brain
  return (
    <>
      <h2>Core competencies</h2>
      <p>{b.name} is a {b.state} licensed general contractor serving {b.counties.join(', ')} counties within {b.serviceRadiusMiles} miles of {b.city}. Trades self-performed: {b.trades.join(', ')}. Crew of {b.crewSize}. Typical project range {money(b.typicalJobMin)} to {money(b.typicalJobMax)}.</p>
      <h2>Licenses, bonding and insurance</h2>
      <table><thead><tr><th>Item</th><th>Detail</th><th>Expires</th></tr></thead><tbody>
        {b.licenses.map((l) => <tr key={l.id}><td>License {l.number}</td><td>{l.classification} · {l.trade} · {l.state}</td><td>{fmtDate(l.expires)}</td></tr>)}
        <tr><td>Surety bonding</td><td>{money(b.bondingSingle)} single · {money(b.bondingAggregate)} aggregate</td><td></td></tr>
        <tr><td>General liability</td><td>{money(b.insuranceOccurrence)} per occurrence · {money(b.insuranceAggregate)} aggregate</td><td></td></tr>
      </tbody></table>
      <h2>Certifications and set-asides</h2>
      <p>{b.certifications.filter((c) => c.active).map((c) => c.name).join(' · ') || 'None'}{b.setAsides.length ? ` · ${b.setAsides.join(' · ')}` : ''}</p>
      <h2>Past performance</h2>
      <table><thead><tr><th>Project</th><th>Type</th><th>Year</th><th className="num">Value</th></tr></thead><tbody>
        {b.pastProjects.map((p) => <tr key={p.id}><td>{p.name}</td><td>{p.type}</td><td>{p.year}</td><td className="num">{money(p.value)}</td></tr>)}
      </tbody></table>
    </>
  )
}

function Prequal() {
  const { id } = useParams()
  const { state } = useDemo()
  const o = state.opportunities.find((x) => x.id === id)
  if (!o) return <Doc title="Prequalification packet"><p>Bid not found.</p></Doc>
  const s = scoreFor(state, o)
  return (
    <Doc title="Prequalification packet" subtitle={`${o.title}`}>
      <h2>Solicitation</h2>
      <table><tbody>
        <tr><th>Owner</th><td>{o.owner}</td><th>Source</th><td>{o.source}</td></tr>
        <tr><th>Bid due</th><td>{o.dueDate ? fmtDate(o.dueDate) : 'Open'}</td><th>Pre-bid</th><td>{o.preBidDate ? fmtDate(o.preBidDate) : 'None'}</td></tr>
        <tr><th>Est. value</th><td>{money(o.estValue)}</td><th>Requirements</th><td>{[o.bondRequired ? 'Bond required' : null, o.prevailingWage ? 'Davis-Bacon' : null, o.setAside && o.setAside !== 'None' ? o.setAside : null].filter(Boolean).join(' · ') || 'None noted'}</td></tr>
      </tbody></table>
      <h2>Statement of interest</h2>
      <p>{o.draftResponse ?? `${state.brain.name} is pleased to submit our qualifications for ${o.title}. ${o.scopeSummary}`}</p>
      <h2>Fit assessment (internal)</h2>
      <table><thead><tr><th>Factor</th><th className="num">Points</th><th>Note</th></tr></thead><tbody>
        {s.factors.map((f) => <tr key={f.name}><td>{f.name}</td><td className="num">{f.points} / {f.max}</td><td>{f.note}</td></tr>)}
        <tr><td className="font-semibold">Score</td><td className="num font-semibold">{s.disqualified ? 'No-go' : s.score}</td><td>{s.disqualified ?? ''}</td></tr>
      </tbody></table>
      <CapabilityBody />
      <h2>References</h2>
      <p>Available on request: {state.contacts.filter((c) => c.type === 'customer' && c.company).slice(0, 3).map((c) => c.company).join(', ')}.</p>
    </Doc>
  )
}

function ProposalDoc() {
  const { id } = useParams()
  const { state } = useDemo()
  const p = state.proposals.find((x) => x.id === id)
  const project = p ? projectById(state, p.projectId) : undefined
  const est = project ? state.estimates.find((e) => e.projectId === project.id) : undefined
  const totals = est ? computeEstimateTotals(est.lines, est.taxRatePct, est.contingencyPct, est.taxApplies) : null
  if (!p || !project) return <Doc title="Proposal"><p>Proposal not found.</p></Doc>
  const customer = contactById(state, project.customerId)
  return (
    <Doc title="Proposal" subtitle={`${p.number} · ${fmtDate(p.date)}`}>
      <table><tbody><tr><th>Prepared for</th><td>{contactName(customer)}<br />{customer?.address}</td><th>Project</th><td>{project.name}<br />{project.address}</td></tr></tbody></table>
      <h2>Scope of work</h2><p>{p.scope}</p>
      {totals && (
        <>
          <h2>Pricing summary</h2>
          <table><thead><tr><th>Section</th><th className="num">Amount</th></tr></thead><tbody>
            {Object.entries(totals.bySection).map(([s, v]) => <tr key={s}><td>{s}</td><td className="num">{money(v)}</td></tr>)}
            {totals.tax > 0 && <tr><td>Sales tax ({est!.taxRatePct}%)</td><td className="num">{money(totals.tax)}</td></tr>}
            {totals.contingency > 0 && <tr><td>Contingency ({est!.contingencyPct}%)</td><td className="num">{money(totals.contingency)}</td></tr>}
            <tr><td className="total">Total</td><td className="num total">{money(totals.grandTotal)}</td></tr>
          </tbody></table>
        </>
      )}
      <div className="grid grid-cols-2 gap-6">
        <div><h2>Inclusions</h2><ul className="list-disc pl-4">{p.inclusions.map((i) => <li key={i}>{i}</li>)}</ul></div>
        <div><h2>Exclusions</h2><ul className="list-disc pl-4">{p.exclusions.map((i) => <li key={i}>{i}</li>)}</ul></div>
      </div>
      <h2>Timeline</h2><p>{p.timeline}</p>
      <h2>Payment schedule</h2>
      <table><thead><tr><th>Draw</th><th className="num">Percent</th><th className="num">Amount</th></tr></thead><tbody>{p.draws.map((d) => <tr key={d.id}><td>{d.label}</td><td className="num">{d.pct}%</td><td className="num">{totals ? money((totals.grandTotal * d.pct) / 100) : ''}</td></tr>)}</tbody></table>
      <h2>Terms</h2><p>{p.terms}</p>
      <div className="sig">
        <div>{p.signature ? <>{p.signature.dataUrl && <img src={p.signature.dataUrl} alt="Client signature" style={{ height: 40 }} />}<br />Accepted by {p.signature.name} · {fmtDateTime(p.signature.signedAt)}</> : 'Client signature and date'}</div>
        <div>{state.settings.profile.ownerName}, {state.brain.name}</div>
      </div>
      <p className="stamp mt-4">Demo signature. Legally binding e-signature via SignWell is coming in v1.1.</p>
    </Doc>
  )
}

function ChangeOrderDoc() {
  const { id } = useParams()
  const { state } = useDemo()
  const c = state.changeOrders.find((x) => x.id === id)
  const project = c ? projectById(state, c.projectId) : undefined
  if (!c || !project) return <Doc title="Change order"><p>Change order not found.</p></Doc>
  const base = project.contractValue
  const prior = state.changeOrders.filter((x) => x.projectId === project.id && x.status === 'approved' && x.number < c.number).reduce((s, x) => s + x.costImpact, 0)
  return (
    <Doc title={`Change order #${c.number}`} subtitle={`${project.name} · ${fmtDate(c.createdAt)}`}>
      <table><tbody><tr><th>Project</th><td>{project.name}<br />{project.address}</td><th>Client</th><td>{contactName(contactById(state, project.customerId))}</td></tr></tbody></table>
      <h2>Description of change</h2><p>{c.description}</p>
      <h2>Contract adjustment</h2>
      <table><tbody>
        <tr><td>Original contract value</td><td className="num">{money(base)}</td></tr>
        <tr><td>Previously approved change orders</td><td className="num">{money(prior)}</td></tr>
        <tr><td>This change order</td><td className="num">{money(c.costImpact)}</td></tr>
        <tr><td className="total">Revised contract value</td><td className="num total">{money(base + prior + c.costImpact)}</td></tr>
        <tr><td>Schedule adjustment</td><td className="num">{c.daysImpact} day{Math.abs(c.daysImpact) === 1 ? '' : 's'}</td></tr>
      </tbody></table>
      <div className="sig">
        <div>{c.signature ? <>{c.signature.dataUrl && <img src={c.signature.dataUrl} alt="Client signature" style={{ height: 40 }} />}<br />Approved by {c.signature.name} · {fmtDateTime(c.signature.signedAt)}</> : 'Client approval signature and date'}</div>
        <div>{state.settings.profile.ownerName}, {state.brain.name}</div>
      </div>
    </Doc>
  )
}

function InvoiceDoc() {
  const { id } = useParams()
  const { state } = useDemo()
  const i = state.invoices.find((x) => x.id === id)
  const project = i ? projectById(state, i.projectId) : undefined
  if (!i || !project) return <Doc title="Invoice"><p>Invoice not found.</p></Doc>
  const customer = contactById(state, project.customerId)
  if (i.kind === 'pay_app' && i.sov) {
    const sched = i.sov.reduce((s, l) => s + l.scheduled, 0)
    const prev = i.sov.reduce((s, l) => s + l.previous, 0)
    const thisP = i.sov.reduce((s, l) => s + l.thisPeriod, 0)
    const stored = i.sov.reduce((s, l) => s + l.storedMaterials, 0)
    const completed = prev + thisP + stored
    const retain = round2(completed * (i.retainagePct / 100))
    const lessPrev = round2(prev * (1 - i.retainagePct / 100))
    return (
      <Doc title="Application for payment" subtitle={`${i.number} · period to ${fmtDate(i.periodTo ?? i.date)}`}>
        <p className="stamp">AIA-style pay application (not an AIA form)</p>
        <table><tbody><tr><th>To (owner)</th><td>{contactName(customer)}<br />{customer?.address}</td><th>Project</th><td>{project.name}<br />{project.address}</td></tr><tr><th>Application date</th><td>{fmtDate(i.date)}</td><th>Due</th><td>{fmtDate(i.dueDate)}</td></tr></tbody></table>
        <h2>Summary</h2>
        <table><tbody>
          <tr><td>1. Original contract sum</td><td className="num">{money(sched)}</td></tr>
          <tr><td>2. Total completed and stored to date</td><td className="num">{money(completed)}</td></tr>
          <tr><td>3. Retainage ({i.retainagePct}%)</td><td className="num">{money(retain)}</td></tr>
          <tr><td>4. Total earned less retainage</td><td className="num">{money(completed - retain)}</td></tr>
          <tr><td>5. Less previous certificates for payment</td><td className="num">{money(lessPrev)}</td></tr>
          <tr><td className="total">6. Current payment due</td><td className="num total">{money(invoiceNetDue(i))}</td></tr>
          <tr><td>7. Balance to finish, including retainage</td><td className="num">{money(sched - (completed - retain))}</td></tr>
        </tbody></table>
        <h2>Continuation sheet (schedule of values)</h2>
        <table><thead><tr><th>Item</th><th className="num">Scheduled</th><th className="num">Previous</th><th className="num">This period</th><th className="num">Stored</th><th className="num">Completed</th><th className="num">%</th><th className="num">Balance</th></tr></thead><tbody>
          {i.sov.map((l) => { const done = l.previous + l.thisPeriod + l.storedMaterials; return <tr key={l.id}><td>{l.description}</td><td className="num">{money(l.scheduled)}</td><td className="num">{money(l.previous)}</td><td className="num">{money(l.thisPeriod)}</td><td className="num">{money(l.storedMaterials)}</td><td className="num">{money(done)}</td><td className="num">{l.scheduled ? Math.round((done / l.scheduled) * 100) : 0}%</td><td className="num">{money(l.scheduled - done)}</td></tr> })}
          <tr><td className="font-semibold">Totals</td><td className="num">{money(sched)}</td><td className="num">{money(prev)}</td><td className="num">{money(thisP)}</td><td className="num">{money(stored)}</td><td className="num">{money(completed)}</td><td className="num">{sched ? Math.round((completed / sched) * 100) : 0}%</td><td className="num">{money(sched - completed)}</td></tr>
        </tbody></table>
        <div className="sig"><div>Contractor signature and date</div><div>Owner or architect certification</div></div>
      </Doc>
    )
  }
  return (
    <Doc title="Invoice" subtitle={`${i.number} · ${fmtDate(i.date)}`}>
      <table><tbody><tr><th>Bill to</th><td>{contactName(customer)}<br />{customer?.address}</td><th>Project</th><td>{project.name}<br />{project.address}</td></tr><tr><th>Due date</th><td>{fmtDate(i.dueDate)}</td><th>Status</th><td>{i.status}{i.paidAt ? ` · paid ${fmtDate(i.paidAt)}` : ''}</td></tr></tbody></table>
      <h2>Items</h2>
      <table><thead><tr><th>Description</th><th className="num">Amount</th></tr></thead><tbody>
        {i.lineItems.map((l) => <tr key={l.id}><td>{l.description}</td><td className="num">{money(l.amount)}</td></tr>)}
        {i.retainagePct > 0 && <tr><td>Less retainage ({i.retainagePct}%)</td><td className="num">-{money(i.amount * (i.retainagePct / 100))}</td></tr>}
        <tr><td className="total">Amount due</td><td className="num total">{money(invoiceNetDue(i))}</td></tr>
      </tbody></table>
      <h2>Payment</h2>
      <p>Pay online from your client portal, or by check to {state.brain.name}. Thank you for your business.</p>
    </Doc>
  )
}

function EstimateDoc() {
  const { id } = useParams()
  const { state } = useDemo()
  const project = projectById(state, id)
  const est = project ? state.estimates.find((e) => e.projectId === project.id) : undefined
  if (!project || !est) return <Doc title="Estimate"><p>Estimate not found.</p></Doc>
  const t = computeEstimateTotals(est.lines, est.taxRatePct, est.contingencyPct, est.taxApplies)
  const sections = Array.from(new Set(est.lines.map((l) => l.section)))
  return (
    <Doc title="Estimate" subtitle={`${project.name} · ${fmtDate(est.updatedAt)}`}>
      <table><tbody><tr><th>Client</th><td>{contactName(contactById(state, project.customerId))}</td><th>Site</th><td>{project.address}</td></tr></tbody></table>
      {sections.map((s) => (
        <div key={s}>
          <h2>{s}</h2>
          <table><thead><tr><th>Description</th><th>Category</th><th className="num">Qty</th><th>Unit</th><th className="num">Unit cost</th><th className="num">Markup</th><th className="num">Total</th></tr></thead><tbody>
            {est.lines.filter((l) => l.section === s).map((l) => <tr key={l.id}><td>{l.description}</td><td>{l.category}</td><td className="num">{l.qty}</td><td>{l.unit}</td><td className="num">{money(l.unitCost)}</td><td className="num">{l.markupPct}%</td><td className="num">{money(lineTotal(l.qty, l.unitCost, l.markupPct))}</td></tr>)}
            <tr><td colSpan={6} className="font-semibold">Section total</td><td className="num font-semibold">{money(t.bySection[s] ?? 0)}</td></tr>
          </tbody></table>
        </div>
      ))}
      <h2>Totals</h2>
      <table><tbody>
        <tr><td>Subtotal</td><td className="num">{money(t.subtotal)}</td></tr>
        <tr><td>Sales tax ({est.taxRatePct}% on {est.taxApplies === 'materials' ? 'materials' : est.taxApplies === 'all' ? 'all lines' : 'nothing'})</td><td className="num">{money(t.tax)}</td></tr>
        <tr><td>Contingency ({est.contingencyPct}%)</td><td className="num">{money(t.contingency)}</td></tr>
        <tr><td className="total">Grand total</td><td className="num total">{money(t.grandTotal)}</td></tr>
      </tbody></table>
    </Doc>
  )
}

function LienChecklist() {
  const { id } = useParams()
  const { state } = useDemo()
  const project = projectById(state, id)
  if (!project) return <Doc title="Lien waiver request checklist"><p>Project not found.</p></Doc>
  const subs = state.contacts.filter((c) => c.type === 'sub' && project.subIds.includes(c.id))
  const invoices = state.invoices.filter((i) => i.projectId === project.id)
  return (
    <Doc title="Lien waiver request checklist" subtitle={project.name}>
      <p>Collect the waivers below before releasing each payment. Actual lien waiver forms are state-specific; the live system supplies the correct {state.brain.state} forms as real files. This checklist tracks what has been requested and received.</p>
      <h2>Per draw</h2>
      <table><thead><tr><th>Draw or invoice</th><th className="num">Amount</th><th>Waiver type</th><th>From</th><th>Requested</th><th>Received</th></tr></thead><tbody>
        {invoices.map((i) => (
          <>
            <tr key={`${i.id}-gc`}><td>{i.number}</td><td className="num">{money(invoiceNetDue(i))}</td><td>{i.status === 'paid' ? 'Unconditional progress' : 'Conditional progress'}</td><td>{state.brain.name}</td><td>[ ]</td><td>[ ]</td></tr>
            {subs.map((s) => <tr key={`${i.id}-${s.id}`}><td></td><td></td><td>{i.status === 'paid' ? 'Unconditional progress' : 'Conditional progress'}</td><td>{s.company ?? contactName(s)}</td><td>[ ]</td><td>[ ]</td></tr>)}
          </>
        ))}
        {invoices.length === 0 && <tr><td colSpan={6}>No invoices yet for this project.</td></tr>}
      </tbody></table>
      <h2>Final payment</h2>
      <table><thead><tr><th>Waiver type</th><th>From</th><th>Requested</th><th>Received</th></tr></thead><tbody>
        <tr><td>Unconditional final</td><td>{state.brain.name}</td><td>[ ]</td><td>[ ]</td></tr>
        {subs.map((s) => <tr key={s.id}><td>Unconditional final</td><td>{s.company ?? contactName(s)}</td><td>[ ]</td><td>[ ]</td></tr>)}
      </tbody></table>
      <h2>Also collect</h2>
      <ul className="list-disc pl-4"><li>Supplier waivers for any material vendor over the state threshold</li><li>Sworn statement of all subs and suppliers, if the lender requires it</li><li>Updated COI from each sub before their final waiver</li></ul>
    </Doc>
  )
}

export default function PrintRoutes() {
  return (
    <Routes>
      <Route path="print/capability" element={<Capability />} />
      <Route path="print/prequal/:id" element={<Prequal />} />
      <Route path="print/proposal/:id" element={<ProposalDoc />} />
      <Route path="print/change-order/:id" element={<ChangeOrderDoc />} />
      <Route path="print/invoice/:id" element={<InvoiceDoc />} />
      <Route path="print/estimate/:id" element={<EstimateDoc />} />
      <Route path="print/lien-checklist/:id" element={<LienChecklist />} />
      <Route path="*" element={<Doc title="Not found"><p>Unknown document.</p></Doc>} />
    </Routes>
  )
}
