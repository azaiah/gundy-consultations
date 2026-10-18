import { useEffect, useRef, useState } from 'react'
import { MessageCircleQuestion, X, Send } from 'lucide-react'
import { MicButton } from '@/components/MicButton'
import { useFocusTrap } from '@/components/useFocusTrap'
import { askLive, assistantSystemPrompt, localAssistantAnswer } from '../../lib/ai'
import { AiChip } from './AiChip'

type Msg = { id: number; from: 'you' | 'app'; text: string; live?: boolean }

export function AskAssistant() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: 'app', text: 'Ask me how to do something in this portal. I only answer questions about using the app.' }])
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, () => setOpen(false))
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [msgs, open])

  async function send() {
    const text = q.trim()
    if (!text || busy) return
    setQ('')
    setMsgs((m) => [...m, { id: Date.now(), from: 'you', text }])
    setBusy(true)
    const live = await askLive(assistantSystemPrompt, text, 0.3)
    const answer = live ?? { text: localAssistantAnswer(text), live: false }
    setMsgs((m) => [...m, { id: Date.now() + 1, from: 'app', text: answer.text, live: answer.live }])
    setBusy(false)
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="fixed bottom-20 lg:bottom-6 right-4 z-[45] h-12 w-12 rounded-full bg-ink text-white shadow-lift flex items-center justify-center hover:bg-survey transition-colors no-print" aria-label="Ask the app">
        <MessageCircleQuestion size={22} />
      </button>
      {open && (
        <div className="fixed inset-0 z-[88]" role="presentation">
          <div className="absolute inset-0 bg-ink/30 lg:bg-transparent" onClick={() => setOpen(false)} aria-hidden="true" />
          <div ref={ref} role="dialog" aria-modal="true" aria-label="Ask the app" tabIndex={-1} className="absolute bottom-0 inset-x-0 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[380px] max-h-[80vh] bg-paper rounded-t-2xl sm:rounded-2xl shadow-lift border border-line flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <h2 className="font-semibold text-sm">Ask the app</h2>
              <button type="button" onClick={() => setOpen(false)} className="tap inline-flex items-center justify-center rounded-lg" aria-label="Close"><X size={18} /></button>
            </div>
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px]">
              {msgs.map((m) => (
                <div key={m.id} className={`text-sm max-w-[90%] ${m.from === 'you' ? 'ml-auto bg-blueprint text-white rounded-2xl rounded-br-sm px-3 py-2' : 'bg-concrete rounded-2xl rounded-bl-sm px-3 py-2'}`}>
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  {m.from === 'app' && m.id !== 0 && <div className="mt-1.5"><AiChip live={!!m.live} /></div>}
                </div>
              ))}
              {busy && <p className="text-xs text-steel">Thinking...</p>}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); void send() }} className="flex items-center gap-2 p-3 border-t border-line">
              <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Your question" placeholder="How do I..." className="flex-1 rounded-lg border border-line px-3 min-h-[44px] text-sm" />
              <MicButton onTranscript={(t) => setQ((v) => `${v} ${t}`.trim())} />
              <button type="submit" className="tap inline-flex items-center justify-center rounded-lg bg-survey text-white" aria-label="Send" disabled={busy}><Send size={18} /></button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
