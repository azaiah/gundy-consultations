import { useState } from 'react'
import { Brain, Radar, Calculator, Smartphone } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { useDemo } from '../store'

const steps = [
  { icon: Brain, title: 'Company Brain', text: 'Start here. Your trades, licenses, bonding, insurance and service area drive every score. Change a credential and watch the boards re-score live.' },
  { icon: Radar, title: 'Leads and Bids', text: 'Sweeps run on your package cadence and stamp everything they find. The Bids and Leads boards show fit scores, drafted outreach and a go/no-go breakdown. Approve a draft and it moves to the pipeline.' },
  { icon: Calculator, title: 'Projects and Estimates', text: 'Build an estimate from the price book, set the tax rate per job, generate a branded proposal and collect a signature. Change orders and daily logs keep the record straight.' },
  { icon: Smartphone, title: 'Field and Client Portal', text: 'Switch to the Foreman role for the phone view: clock in, logs, punch photos. Switch to Client to see what a homeowner sees: schedule, photos, approvals and invoices.' },
]

export function SetupWizard() {
  const { state, set } = useDemo()
  const [i, setI] = useState(0)
  const open = state.entered && !state.settings.tourDone
  const finish = () => set('settings', { ...state.settings, tourDone: true })
  if (!open) return null
  const s = steps[i]
  return (
    <Modal open={open} onClose={finish} title={`Quick tour (${i + 1} of ${steps.length})`} footer={
      <>
        <Button variant="ghost" onClick={finish}>Skip</Button>
        {i > 0 && <Button variant="outline" onClick={() => setI(i - 1)}>Back</Button>}
        {i < steps.length - 1 ? <Button onClick={() => setI(i + 1)}>Next</Button> : <Button onClick={finish}>Start exploring</Button>}
      </>
    }>
      <div className="flex gap-4">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-survey-50 text-survey flex items-center justify-center"><s.icon size={24} /></div>
        <div>
          <h3 className="font-display uppercase text-2xl">{s.title}</h3>
          <p className="text-steel mt-2 leading-relaxed">{s.text}</p>
        </div>
      </div>
      <div className="mt-6 flex gap-1.5" aria-hidden="true">
        {steps.map((_, k) => <span key={k} className={`h-1.5 flex-1 rounded-full ${k <= i ? 'bg-survey' : 'bg-line'}`} />)}
      </div>
    </Modal>
  )
}
