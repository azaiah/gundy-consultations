import { helpContent } from '../helpContent'

export type AiResult = { text: string; live: boolean; note?: string }

const FN_URL = '/.netlify/functions/ai'
let knownUnavailable = false

/** Try the server proxy; on any failure return null so callers fall back to templates. */
export async function askLive(system: string, prompt: string, temperature = 0.5): Promise<AiResult | null> {
  if (knownUnavailable) return null
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 12_000)
    const res = await fetch(FN_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system, prompt, temperature }), signal: ctrl.signal })
    clearTimeout(timer)
    if (res.status === 503 || res.status === 404) {
      knownUnavailable = true
      return null
    }
    if (!res.ok) return null
    const data = (await res.json()) as { text?: string }
    if (!data.text) return null
    return { text: data.text, live: true }
  } catch {
    return null
  }
}

/* ---------------- Local template generators ---------------- */

export type Tone = 'friendly' | 'professional' | 'direct' | 'warm'
export type Purpose = 'follow_up' | 'estimate_ready' | 'schedule_confirm' | 'change_order' | 'payment_reminder' | 'review_request' | 'bid_intro'

export const purposeLabels: Record<Purpose, string> = {
  follow_up: 'Follow-up',
  estimate_ready: 'Estimate ready',
  schedule_confirm: 'Schedule confirmation',
  change_order: 'Change-order explanation',
  payment_reminder: 'Payment reminder',
  review_request: 'Review request',
  bid_intro: 'Bid intro to a GC',
}
export const toneLabels: Record<Tone, string> = { friendly: 'Friendly', professional: 'Professional', direct: 'Direct', warm: 'Warm' }

export type MessageInput = { contactFirstName: string; contactCompany?: string; company: string; owner: string; purpose: Purpose; tone: Tone; project?: string; amount?: string; date?: string; details?: string }

const greet: Record<Tone, (n: string) => string> = {
  friendly: (n) => `Hi ${n},`,
  professional: (n) => `Hello ${n},`,
  direct: (n) => `${n},`,
  warm: (n) => `Hi ${n}, I hope your week is going well.`,
}
const signoff: Record<Tone, string> = { friendly: 'Thanks,', professional: 'Best regards,', direct: 'Thanks,', warm: 'Warm regards,' }

export function generateMessage(i: MessageInput): string {
  const n = i.contactFirstName || 'there'
  const proj = i.project ? ` on the ${i.project}` : ''
  const det = i.details ? `\n\n${i.details.trim()}` : ''
  let body = ''
  switch (i.purpose) {
    case 'follow_up':
      body = `I wanted to follow up${proj ? ` ${proj.trim()}` : ' on our last conversation'}. ${i.tone === 'direct' ? 'Do you have a decision, or is there anything you need from us to move forward?' : 'Is there anything I can clarify or any question I can answer to help you decide?'}${det}\n\nI am glad to jump on a quick call whenever it suits you.`
      break
    case 'estimate_ready':
      body = `Your estimate${proj} is ready${i.amount ? ` and comes to ${i.amount}` : ''}. It breaks out each section so you can see exactly where the money goes, and it includes a contingency line so there are no surprises.${det}\n\nI can walk you through it in about 15 minutes. What day works for you?`
      break
    case 'schedule_confirm':
      body = `Confirming our ${i.date ? `${i.date} ` : ''}visit${proj}. The crew will arrive at the start time we discussed, and we will protect floors and keep the work area contained.${det}\n\nIf anything changes on your side, reply here and we will adjust.`
      break
    case 'change_order':
      body = `While working${proj} we found a condition that was not visible before demolition and needs to be addressed before we continue.${det}\n\nThe change order${i.amount ? ` of ${i.amount}` : ''} covers the added labor and material only. Nothing proceeds until you approve it, and approval is a quick signature in your portal.`
      break
    case 'payment_reminder':
      body = `A friendly reminder that the invoice${proj}${i.amount ? ` for ${i.amount}` : ''}${i.date ? ` was due on ${i.date}` : ' is now due'}.${det}\n\nYou can pay from the portal, or let me know if it has already been sent and I will update our records.`
      break
    case 'review_request':
      body = `It was a pleasure completing the work${proj}. If you were happy with the result, a short Google review would mean a great deal to our small crew; it is how most of our new clients find us.${det}\n\nThank you again for trusting us with your home.`
      break
    case 'bid_intro':
      body = `${i.company} is a Tennessee-licensed general contractor focused on interior renovation and light commercial work, bonded and fully insured, with a crew that self-performs carpentry and finishes. We would like to be considered for upcoming invitations to bid${i.contactCompany ? ` from ${i.contactCompany}` : ''}.${det}\n\nI have attached our capability statement and can send references and a prequalification packet on request.`
      break
  }
  return `${greet[i.tone](n)}\n\n${body}\n\n${signoff[i.tone]}\n${i.owner}\n${i.company}`
}

export function generateLineDescription(hint: string, section: string, category: string): string {
  const h = hint.trim()
  const base = h || `${section} ${category.toLowerCase()}`
  const map: Record<string, string> = {
    Labor: `${cap(base)}: supply skilled labor including setup, protection of adjacent surfaces, daily cleanup and disposal of debris generated by this scope.`,
    Material: `${cap(base)}: furnish materials per the selections schedule, including delivery, handling and waste allowance of 10 percent.`,
    Equipment: `${cap(base)}: equipment rental, delivery, pickup and fuel for the duration of this scope.`,
    Subcontract: `${cap(base)}: subcontracted scope including permits by the sub where required, coordination with other trades, and inspection sign-off.`,
    Other: `${cap(base)}: general conditions including supervision, scheduling, site protection and project closeout.`,
  }
  return map[category] ?? cap(base)
}

export function generateScope(projectName: string, description: string, sections: string[]): string {
  const s = sections.length ? sections.join(', ').toLowerCase() : 'the scope described in the estimate'
  return `${cap(projectName)}: ${description.trim().replace(/\.$/, '')}. Work includes ${s}, performed by licensed and insured crews, with permits obtained where required, daily cleanup, protection of existing finishes, and a final walkthrough with a written punch list before the final draw.`
}

export function generateProjectDescription(name: string, address: string, type: 'residential' | 'commercial'): string {
  return type === 'residential'
    ? `${name} at ${address}: a residential renovation delivered in phases to keep the home livable, with selections confirmed before ordering, inspections scheduled through Metro Codes, and progress photos shared in the client portal.`
    : `${name} at ${address}: a commercial build-out coordinated with the landlord and architect of record, with above-ceiling and final inspections scheduled ahead of the tenant's opening date and an AIA-style pay application each period.`
}

export function generateLeadSummary(title: string, owner: string, source: string, scope: string, whyFits: string[]): string {
  return `${title} (${source}) from ${owner}. ${scope} Best reasons to pursue: ${whyFits.length ? whyFits.join('; ').toLowerCase() : 'fits the trades and service area in the Company Brain'}. Suggested next step: a short call this week, then a site visit.`
}

/* ---------------- Ask-the-app local fallback ---------------- */

const synonyms: Record<string, string[]> = {
  contacts: ['contact', 'customer', 'lead', 'sub', 'vcf', 'import', 'phone', 'log', 'call'],
  projects: ['project', 'estimate', 'proposal', 'punch', 'checklist', 'change order', 'daily log', 'tax'],
  calendar: ['calendar', 'schedule', 'event', 'ics', 'export', 'time picker', 'sync'],
  sweeps: ['sweep', 'run', 'source', 'cadence'],
  bids: ['bid', 'score', 'fit', 'no-bid', 'prequal', 'solicitation'],
  leads: ['permit', 'hoa', 'property manager', 'build-out'],
  pipeline: ['pipeline', 'kanban', 'stage', 'won', 'lost', 'drag'],
  outreach: ['outreach', 'approve', 'draft', 'send', 'script'],
  compliance: ['compliance', 'coi', 'insurance', 'license', 'expire', 'vault', 'block'],
  invoices: ['invoice', 'draw', 'retainage', 'pay app', 'payment'],
  costing: ['cost', 'margin', 'p&l', 'profit', 'actual'],
  crew: ['crew', 'assign', 'availability', 'certification'],
  notes: ['note', 'to-do', 'todo', 'scratchpad', 'voice', 'mic', 'dictate'],
  field: ['field', 'clock', 'foreman', 'location'],
  client: ['client portal', 'homeowner', 'selection', 'approve change'],
  settings: ['setting', 'reset', 'offline', 'tour', 'seat', 'price book', 'notification'],
  brain: ['brain', 'bonding', 'naics', 'set-aside', 'certification', 'service area', 'radius'],
  docs: ['capability', 'paperwork', 'lien', 'print'],
  ai: ['ai', 'auto-fill', 'message generator', 'tone'],
}

export function localAssistantAnswer(question: string): string {
  const q = question.toLowerCase()
  if (!q.trim()) return 'Ask me how to do something in the portal, for example "how do I import contacts" or "where do I change the tax rate".'
  const offTopic = ['weather', 'stock', 'recipe', 'joke', 'news', 'sports', 'movie', 'politic', 'who won', 'translate', 'poem']
  if (offTopic.some((w) => q.includes(w))) return 'I can only help with using this portal. Try asking about leads, bids, projects, estimates, the calendar, compliance or settings.'
  let best: { key: string; hits: number } | null = null
  for (const [key, words] of Object.entries(synonyms)) {
    const hits = words.filter((w) => q.includes(w)).length + (q.includes(key) ? 1 : 0)
    if (hits > 0 && (!best || hits > best.hits)) best = { key, hits }
  }
  if (!best) return 'I did not find that in the help topics. Try different words, or open the Help Center from Settings for a list of "How do I" answers.'
  const h = helpContent[best.key]
  return `${h.title}: ${h.intro}\n\n${h.bullets.map((b) => `- ${b}`).join('\n')}\n\nOpen it from the sidebar, or the More menu on a phone.`
}

export const assistantSystemPrompt =
  'You are the in-app help assistant for a contractor business portal (Gundy Consultations). Only answer questions about using the portal: leads, bids, sweeps, pipeline, outreach, contacts, projects, estimates, proposals, calendar, crew, notes, field app, client portal, invoices, job costing, compliance vault, paperwork, settings. If a question is off-topic, politely decline in one sentence and suggest a portal topic. Keep answers under 120 words, plain text, no markdown headings.'

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
