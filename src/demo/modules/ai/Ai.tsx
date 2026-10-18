import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Sparkles, Copy, Check, ClipboardList, Send } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input, Select, Textarea } from '@/components/Field'
import { MicButton } from '@/components/MicButton'
import { useDemo } from '../../store'
import { contactById, contactName } from '../../selectors'
import { askLive, generateMessage, purposeLabels, toneLabels, type Purpose, type Tone } from '../../lib/ai'
import { copyText } from '../../lib/download'
import { uid } from '../../lib/ids'
import { PageHeader, SampleRibbon } from '../../layout/PageHeader'
import { AiChip } from './AiChip'

export default function Ai() {
  const { state, upsert } = useDemo()
  const [params] = useSearchParams()
  const [contactId, setContactId] = useState(params.get('contact') ?? state.contacts[0]?.id ?? '')
  const [purpose, setPurpose] = useState<Purpose>('follow_up')
  const [tone, setTone] = useState<Tone>('professional')
  const [projectId, setProjectId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [details, setDetails] = useState('')
  const [draft, setDraft] = useState('')
  const [live, setLive] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [logged, setLogged] = useState(false)
  const contact = contactById(state, contactId)
  const project = state.projects.find((p) => p.id === projectId)

  async function generate() {
    if (!contact) return
    setBusy(true)
    setLogged(false)
    const input = { contactFirstName: contact.firstName || contact.company || 'there', contactCompany: contact.company, company: state.brain.name, owner: state.settings.profile.ownerName, purpose, tone, project: project?.name, amount: amount || undefined, date: date || undefined, details: details || undefined }
    const local = generateMessage(input)
    const res = await askLive(
      `You write short, professional messages for a construction contractor named ${state.brain.name}. Plain text, no subject line, no markdown. Sign as ${state.settings.profile.ownerName}.`,
      `Write a ${toneLabels[tone].toLowerCase()} ${purposeLabels[purpose].toLowerCase()} message to ${contact.firstName} ${contact.lastName}${contact.company ? ` at ${contact.company}` : ''}.${project ? ` Project: ${project.name}.` : ''}${amount ? ` Amount: ${amount}.` : ''}${date ? ` Date: ${date}.` : ''}${details ? ` Details: ${details}` : ''} Keep it under 140 words.`,
      0.6,
    )
    setDraft(res?.text ?? local)
    setLive(!!res)
    setBusy(false)
  }
  function log() {
    if (!contact || !draft) return
    upsert('contacts', { ...contact, logs: [...contact.logs, { id: uid('lg'), type: 'email', at: new Date().toISOString(), outcome: `${purposeLabels[purpose]} drafted`, notes: draft }] }, `Log message to ${contactName(contact)}`)
    setLogged(true)
  }
  function toOutreach() {
    if (!contact || !draft) return
    upsert('outreach', { id: uid('or'), opportunityId: '', contactId: contact.id, channel: 'email', subject: `${purposeLabels[purpose]}: ${contactName(contact)}`, body: draft, status: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, 'Send draft to Outreach')
  }

  return (
    <div>
      <SampleRibbon />
      <PageHeader title="AI assist" helpKey="ai" subtitle="Message generator. Auto-fill buttons also live on estimates, proposals, projects and leads. The chip tells you whether Live AI or the demo generator wrote it." />
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader title="Message generator" subtitle="Pick who, why and how it should sound." />
          <CardBody className="space-y-3">
            <Select label="Contact" value={contactId} onChange={(e) => setContactId(e.target.value)}>{state.contacts.map((c) => <option key={c.id} value={c.id}>{contactName(c)} ({c.type})</option>)}</Select>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value as Purpose)}>{(Object.keys(purposeLabels) as Purpose[]).map((p) => <option key={p} value={p}>{purposeLabels[p]}</option>)}</Select>
              <Select label="Tone" value={tone} onChange={(e) => setTone(e.target.value as Tone)}>{(Object.keys(toneLabels) as Tone[]).map((t) => <option key={t} value={t}>{toneLabels[t]}</option>)}</Select>
            </div>
            <Select label="Project" hint="(optional)" value={projectId} onChange={(e) => setProjectId(e.target.value)}><option value="">None</option>{state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Amount" hint="(optional)" placeholder="$12,400" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input label="Date" hint="(optional)" placeholder="Thursday 8 AM" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <Textarea label="Extra details" hint="(optional)" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Anything specific to mention" trailing={<MicButton size="sm" onTranscript={(t) => setDetails((v) => `${v} ${t}`.trim())} />} />
            <Button onClick={generate} disabled={busy || !contact} icon={<Sparkles size={16} />} className="w-full">{busy ? 'Writing...' : 'Generate draft'}</Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Draft" subtitle={live !== null ? <AiChip live={live} /> : 'Editable once generated.'} action={draft ? <div className="flex gap-1.5 flex-wrap"><Button size="sm" variant="outline" onClick={async () => { if (await copyText(draft)) { setCopied(true); setTimeout(() => setCopied(false), 1500) } }} icon={copied ? <Check size={14} /> : <Copy size={14} />}>{copied ? 'Copied' : 'Copy'}</Button><Button size="sm" variant="outline" onClick={log} icon={<ClipboardList size={14} />}>{logged ? 'Logged' : 'Log this message'}</Button><Button size="sm" variant="secondary" onClick={toOutreach} icon={<Send size={14} />}>To Outreach</Button></div> : undefined} />
          <CardBody>
            <Textarea aria-label="Generated draft" rows={16} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Your draft appears here." trailing={<MicButton size="sm" onTranscript={(t) => setDraft((v) => `${v} ${t}`.trim())} />} />
            <p className="text-xs text-steel mt-2">Live AI runs through a server-side proxy with no key in the browser. Without a key, the demo generator writes the draft from templates so the feature always works.</p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
