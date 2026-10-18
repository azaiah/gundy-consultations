import { useMemo, useState } from 'react'
import { Plus, Trash2, BookOpen, Sparkles, Printer } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input, Select, inputClass } from '@/components/Field'
import { MicButton } from '@/components/MicButton'
import { Sheet } from '@/components/Sheet'
import { useDemo } from '../../store'
import type { Estimate, EstimateLine, Project } from '../../types'
import { money, computeEstimateTotals, lineTotal } from '../../lib/money'
import { uid } from '../../lib/ids'
import { askLive, generateLineDescription } from '../../lib/ai'
import { AiChip } from '../ai/AiChip'

const categories: EstimateLine['category'][] = ['Labor', 'Material', 'Equipment', 'Subcontract', 'Other']
const defaultSections = ['Demolition', 'Framing', 'Electrical', 'Plumbing', 'Drywall and paint', 'Cabinetry', 'Countertops', 'Tile', 'Finishes', 'Roofing', 'General conditions']

export function Estimator({ project }: { project: Project }) {
  const { state, upsert } = useDemo()
  const existing = state.estimates.find((e) => e.projectId === project.id)
  const est: Estimate = existing ?? { id: uid('es'), projectId: project.id, lines: [], taxRatePct: state.settings.defaultTaxRatePct, contingencyPct: 5, taxApplies: 'materials', updatedAt: new Date().toISOString() }
  const save = (patch: Partial<Estimate>, label = 'Update estimate') => upsert('estimates', { ...est, ...patch, updatedAt: new Date().toISOString() }, label)
  const [pb, setPb] = useState(false)
  const [aiFor, setAiFor] = useState<{ id: string; live: boolean } | null>(null)
  const totals = useMemo(() => computeEstimateTotals(est.lines, est.taxRatePct, est.contingencyPct, est.taxApplies), [est.lines, est.taxRatePct, est.contingencyPct, est.taxApplies])
  const sections = Array.from(new Set([...est.lines.map((l) => l.section)]))

  function addLine(section = sections[0] ?? 'General conditions', partial: Partial<EstimateLine> = {}) {
    const l: EstimateLine = { id: uid('el'), section, category: 'Labor', description: '', qty: 1, unit: 'ea', unitCost: 0, markupPct: 15, ...partial }
    save({ lines: [...est.lines, l] }, 'Add estimate line')
  }
  const patchLine = (id: string, p: Partial<EstimateLine>) => save({ lines: est.lines.map((l) => (l.id === id ? { ...l, ...p } : l)) })
  async function autofill(l: EstimateLine) {
    const live = await askLive('You write concise construction estimate line descriptions (one sentence).', `Section: ${l.section}. Category: ${l.category}. Hint: ${l.description || '(none)'}. Project: ${project.name}.`)
    patchLine(l.id, { description: live?.text ?? generateLineDescription(l.description, l.section, l.category) })
    setAiFor({ id: l.id, live: !!live })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Estimate settings" subtitle="Tax rate is editable per estimate. The default lives in Settings." action={<Button size="sm" variant="outline" onClick={() => window.open(`/demo/print/estimate/${project.id}?auto=1`, '_blank')} icon={<Printer size={14} />}>Print</Button>} />
        <CardBody className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input label="Tax rate %" type="number" step="0.01" min={0} value={est.taxRatePct} onChange={(e) => save({ taxRatePct: Number(e.target.value) || 0 })} />
          <Select label="Tax applies to" value={est.taxApplies} onChange={(e) => save({ taxApplies: e.target.value as Estimate['taxApplies'] })}><option value="materials">Materials only</option><option value="all">All lines</option><option value="none">No tax</option></Select>
          <Input label="Contingency %" type="number" step="0.5" min={0} value={est.contingencyPct} onChange={(e) => save({ contingencyPct: Number(e.target.value) || 0 })} />
          <div className="flex items-end"><Button variant="outline" onClick={() => setPb(true)} icon={<BookOpen size={16} />} className="w-full">Price book</Button></div>
        </CardBody>
      </Card>

      {sections.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-steel text-sm">No line items yet. Add a line or pull from the price book.</p>
          <div className="mt-3 flex justify-center gap-2 flex-wrap">
            <Button onClick={() => addLine('Demolition')} icon={<Plus size={16} />}>Add first line</Button>
            <Button variant="outline" onClick={() => setPb(true)} icon={<BookOpen size={16} />}>Price book</Button>
          </div>
        </Card>
      )}

      {sections.map((section) => {
        const lines = est.lines.filter((l) => l.section === section)
        return (
          <Card key={section}>
            <CardHeader title={section} subtitle={`${lines.length} line${lines.length === 1 ? '' : 's'} · ${money(totals.bySection[section] ?? 0)}`} action={<Button size="sm" variant="ghost" onClick={() => addLine(section)} icon={<Plus size={14} />}>Line</Button>} />
            <CardBody className="space-y-3">
              {lines.map((l) => (
                <div key={l.id} className="rounded-lg border border-line p-3 grid gap-2 sm:grid-cols-12 items-start">
                  <div className="sm:col-span-12">
                    <label htmlFor={`d-${l.id}`} className="sr-only">Description</label>
                    <div className="flex gap-2">
                      <input id={`d-${l.id}`} value={l.description} onChange={(e) => patchLine(l.id, { description: e.target.value })} placeholder="Description" className={inputClass} />
                      <MicButton size="md" onTranscript={(t) => patchLine(l.id, { description: `${l.description} ${t}`.trim() })} />
                      <Button variant="outline" onClick={() => autofill(l)} icon={<Sparkles size={14} />} aria-label="Auto-fill description">AI</Button>
                    </div>
                    {aiFor?.id === l.id && <div className="mt-1"><AiChip live={aiFor.live} /></div>}
                  </div>
                  <Select aria-label="Category" className="sm:col-span-3" value={l.category} onChange={(e) => patchLine(l.id, { category: e.target.value as EstimateLine['category'] })}>{categories.map((c) => <option key={c}>{c}</option>)}</Select>
                  <Input aria-label="Quantity" className="sm:col-span-2" type="number" min={0} step="0.01" value={l.qty} onChange={(e) => patchLine(l.id, { qty: Number(e.target.value) || 0 })} />
                  <Input aria-label="Unit" className="sm:col-span-1" value={l.unit} onChange={(e) => patchLine(l.id, { unit: e.target.value })} />
                  <Input aria-label="Unit cost" className="sm:col-span-2" type="number" min={0} step="0.01" value={l.unitCost} onChange={(e) => patchLine(l.id, { unitCost: Number(e.target.value) || 0 })} />
                  <Input aria-label="Markup percent" className="sm:col-span-2" type="number" min={0} step="0.5" value={l.markupPct} onChange={(e) => patchLine(l.id, { markupPct: Number(e.target.value) || 0 })} />
                  <div className="sm:col-span-2 flex items-center justify-between gap-2 min-h-[44px]">
                    <span className="font-mono text-sm">{money(lineTotal(l.qty, l.unitCost, l.markupPct))}</span>
                    <button type="button" onClick={() => save({ lines: est.lines.filter((x) => x.id !== l.id) }, 'Remove estimate line')} className="tap inline-flex items-center justify-center rounded-lg text-steel hover:text-danger" aria-label="Remove line"><Trash2 size={16} /></button>
                  </div>
                  <p className="sm:col-span-12 text-[11px] text-steel -mt-1">Category · Qty · Unit · Unit cost · Markup %</p>
                </div>
              ))}
            </CardBody>
          </Card>
        )
      })}

      {sections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Select aria-label="Add a section" value="" onChange={(e) => { if (e.target.value) addLine(e.target.value) }} className="w-56">
            <option value="">Add a section...</option>
            {defaultSections.filter((s) => !sections.includes(s)).map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
      )}

      <Card className="bg-ink text-white border-ink">
        <CardBody className="pt-4">
          <dl className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
            <div><dt className="text-white/60">Subtotal</dt><dd className="font-mono">{money(totals.subtotal)}</dd></div>
            <div><dt className="text-white/60">Markup included</dt><dd className="font-mono">{money(totals.markupTotal)}</dd></div>
            <div><dt className="text-white/60">Tax ({est.taxRatePct}% on {money(totals.taxableBase)})</dt><dd className="font-mono">{money(totals.tax)}</dd></div>
            <div><dt className="text-white/60">Contingency ({est.contingencyPct}%)</dt><dd className="font-mono">{money(totals.contingency)}</dd></div>
            <div><dt className="text-white/60">Grand total</dt><dd className="font-display text-3xl text-survey-light">{money(totals.grandTotal)}</dd></div>
          </dl>
        </CardBody>
      </Card>

      <Sheet open={pb} onClose={() => setPb(false)} title="Price book">
        <p className="text-xs text-steel mb-2">Tap an item to add it as a line. Edit the price book in Settings.</p>
        <ul className="divide-y divide-line">
          {state.settings.priceBook.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => { addLine(p.section, { category: p.category, description: p.description, unit: p.unit, unitCost: p.unitCost }); setPb(false) }} className="w-full text-left py-2.5 flex items-center justify-between gap-3 min-h-[44px] hover:bg-concrete rounded px-1">
                <span className="min-w-0"><span className="block text-sm">{p.description}</span><span className="text-xs text-steel">{p.section} · {p.category}</span></span>
                <span className="font-mono text-xs shrink-0">{money(p.unitCost)} / {p.unit}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  )
}
