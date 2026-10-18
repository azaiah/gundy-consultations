import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Square } from 'lucide-react'

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SpeechResultEvent) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
}
type SpeechResultEvent = { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export const speechSupported = () => getRecognitionCtor() !== null

/**
 * Reusable voice-to-text button. Appends final transcript chunks via onTranscript.
 * onInterim receives the live interim transcript (optional, for a preview line).
 */
export function MicButton({
  onTranscript,
  onInterim,
  size = 'md',
  className = '',
  label = 'Dictate',
}: {
  onTranscript: (text: string) => void
  onInterim?: (text: string) => void
  size?: 'sm' | 'md'
  className?: string
  label?: string
}) {
  const [listening, setListening] = useState(false)
  const [unsupported, setUnsupported] = useState(false)
  const [showMsg, setShowMsg] = useState(false)
  const recRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    setUnsupported(!speechSupported())
    return () => {
      recRef.current?.abort()
    }
  }, [])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
    onInterim?.('')
  }, [onInterim])

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      setUnsupported(true)
      setShowMsg(true)
      setTimeout(() => setShowMsg(false), 3500)
      return
    }
    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        const t = r[0]?.transcript ?? ''
        if (r.isFinal) onTranscript(t.trim())
        else interim += t
      }
      onInterim?.(interim)
    }
    rec.onend = () => {
      setListening(false)
      onInterim?.('')
    }
    rec.onerror = () => {
      setListening(false)
      onInterim?.('')
    }
    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }, [onTranscript, onInterim])

  const dim = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'
  const icon = size === 'sm' ? 16 : 18

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={listening ? stop : start}
        aria-pressed={listening}
        aria-label={listening ? 'Stop dictation' : unsupported ? `${label} (not supported in this browser)` : label}
        title={unsupported ? 'Voice input is not supported in this browser' : listening ? 'Stop' : label}
        className={`${dim} inline-flex items-center justify-center rounded-lg border transition-colors ${
          listening
            ? 'bg-danger text-white border-danger animate-pulseDot'
            : unsupported
              ? 'bg-concrete text-steel border-line'
              : 'bg-paper text-blueprint border-line hover:border-blueprint'
        }`}
      >
        {listening ? <Square size={icon} /> : unsupported ? <MicOff size={icon} /> : <Mic size={icon} />}
      </button>
      {listening && (
        <span className="absolute -top-7 right-0 whitespace-nowrap rounded bg-danger px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white">
          Listening...
        </span>
      )}
      {showMsg && (
        <span role="status" className="absolute top-full right-0 mt-1 z-10 w-56 rounded-lg border border-line bg-paper p-2 text-xs text-steel shadow-card">
          Voice input is not supported in this browser. Try Chrome, Edge or Safari.
        </span>
      )}
    </span>
  )
}
