import { useState, type FormEvent } from 'react'
import { CheckCircle2, Copy, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/Button'
import { Input, Select, Textarea } from '@/components/Field'
import { site } from '@/config/site'
import { SectionHeading } from '../motion'

const trades = ['General contractor', 'Remodeler', 'Roofing', 'Electrical', 'Plumbing', 'HVAC', 'Concrete and masonry', 'Framing and carpentry', 'Painting and finishes', 'Flooring', 'Site work and excavation', 'Specialty sub (other)']

type FormState = { name: string; company: string; trade: string; serviceArea: string; phone: string; email: string; wantMoreOf: string; message: string }
const empty: FormState = { name: '', company: '', trade: '', serviceArea: '', phone: '', email: '', wantMoreOf: '', message: '' }

function validate(f: FormState) {
  const e: Partial<Record<keyof FormState, string>> = {}
  if (f.name.trim().length < 2) e.name = 'Please enter your name.'
  if (f.company.trim().length < 2) e.company = 'Please enter your company name.'
  if (!f.trade) e.trade = 'Pick the closest trade.'
  if (f.serviceArea.trim().length < 2) e.serviceArea = 'Tell us the counties or metro you serve.'
  if (!/^[\d\s()+.-]{7,}$/.test(f.phone)) e.phone = 'Enter a phone number we can call.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email.'
  if (!f.wantMoreOf) e.wantMoreOf = 'Choose one.'
  return e
}

export function ConsultForm() {
  const [form, setForm] = useState<FormState>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const fallbackText = `Consultation request\nName: ${form.name}\nCompany: ${form.company}\nTrade: ${form.trade}\nService area: ${form.serviceArea}\nPhone: ${form.phone}\nEmail: ${form.email}\nWant more of: ${form.wantMoreOf}\nMessage: ${form.message}`

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setStatus('sending')
    try {
      const body = new URLSearchParams({ 'form-name': site.consultationFormName, ...form }).toString()
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(fallbackText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable: text is visible in the box */
    }
  }

  return (
    <section id="consult" aria-labelledby="consult-h" className="py-20 sm:py-28 bg-ink text-white bg-blueprint-grid-dark scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading dark eyebrow="Book a free consultation" title={<span id="consult-h">Thirty minutes. We run a sample sweep on your profile.</span>} text="Tell us your trades and service area. On the call we check permit coverage in your counties and show you real opportunities that match, before you decide anything." />
          <ul className="mt-8 space-y-3 text-white/80">
            <li>
              <a href={site.phoneHref} className="inline-flex items-center gap-2 hover:text-white min-h-[44px]"><Phone size={18} /> {site.phone}</a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 hover:text-white min-h-[44px] break-all"><Mail size={18} /> {site.email}</a>
            </li>
          </ul>
          <p className="mt-6 text-sm text-white/50">{site.hours}</p>
        </div>

        <div className="rounded-2xl bg-paper text-ink p-5 sm:p-8 shadow-lift">
          {status === 'success' ? (
            <div className="text-center py-10" role="status">
              <CheckCircle2 size={48} className="mx-auto text-success" />
              <h3 className="font-display uppercase text-3xl mt-4">Request received</h3>
              <p className="text-steel mt-2 max-w-sm mx-auto">We will call or email within one business day to schedule your consultation. Meanwhile, the live demo is open.</p>
              <Button className="mt-6" variant="dark" onClick={() => (window.location.href = '/demo')}>Try the Live Demo</Button>
            </div>
          ) : (
            <form name={site.consultationFormName} method="POST" data-netlify="true" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="form-name" value={site.consultationFormName} />
              <p className="hidden">
                <label>Do not fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
              </p>
              <Input label="Your name" name="name" value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" required />
              <Input label="Company" name="company" value={form.company} onChange={set('company')} error={errors.company} autoComplete="organization" required />
              <Select label="Trade" name="trade" value={form.trade} onChange={set('trade')} error={errors.trade} required>
                <option value="">Select your trade</option>
                {trades.map((t) => <option key={t}>{t}</option>)}
              </Select>
              <Input label="Service area" name="serviceArea" placeholder="Counties or metro you serve" value={form.serviceArea} onChange={set('serviceArea')} error={errors.serviceArea} required />
              <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} autoComplete="tel" required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" required />
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-medium mb-2">What do you want more of?</legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Leads', 'Bids', 'Both', 'Getting organized'].map((o) => (
                    <label key={o} className={`tap flex items-center justify-center rounded-lg border px-3 text-sm font-medium cursor-pointer ${form.wantMoreOf === o ? 'border-survey bg-survey-50 text-survey' : 'border-line hover:border-steel'}`}>
                      <input type="radio" name="wantMoreOf" value={o} checked={form.wantMoreOf === o} onChange={set('wantMoreOf')} className="sr-only" />
                      {o}
                    </label>
                  ))}
                </div>
                {errors.wantMoreOf && <p className="text-xs text-danger mt-1">{errors.wantMoreOf}</p>}
              </fieldset>
              <Textarea className="sm:col-span-2" label="Message" hint="(optional)" name="message" value={form.message} onChange={set('message')} placeholder="Anything we should know before the call?" />
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending...' : 'Book a Free Consultation'}
                </Button>
                <p className="text-xs text-steel mt-2 text-center">No contract on the call. We reply within one business day.</p>
              </div>
              {status === 'error' && (
                <div role="alert" className="sm:col-span-2 rounded-lg border border-warning/40 bg-[#FBF2E0] p-4 text-sm">
                  <p className="font-semibold text-ink">The form could not be sent right now.</p>
                  <p className="text-steel mt-1">Copy this message and email it to <a className="underline" href={`mailto:${site.email}`}>{site.email}</a>, or call {site.phone}.</p>
                  <pre className="mt-3 whitespace-pre-wrap break-words rounded bg-paper border border-line p-3 font-mono text-xs">{fallbackText}</pre>
                  <Button variant="outline" size="sm" className="mt-2" onClick={copy} icon={<Copy size={14} />}>{copied ? 'Copied' : 'Copy this message'}</Button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
