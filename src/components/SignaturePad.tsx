import { useEffect, useRef, useState } from 'react'
import { Eraser } from 'lucide-react'
import { Button } from './Button'

/** Canvas signature pad. Returns a PNG data URL on save. */
export function SignaturePad({ onSave, onCancel, signerLabel = 'Sign here' }: { onSave: (dataUrl: string, signerName: string) => void; onCancel?: () => void; signerLabel?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasInk, setHasInk] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ratio = window.devicePixelRatio || 1
    const rect = c.getBoundingClientRect()
    c.width = rect.width * ratio
    c.height = rect.height * ratio
    const ctx = c.getContext('2d')
    if (ctx) {
      ctx.scale(ratio, ratio)
      ctx.lineWidth = 2.2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#14171C'
    }
  }, [])

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }
  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault()
    drawing.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    const ctx = e.currentTarget.getContext('2d')
    const p = pos(e)
    ctx?.beginPath()
    ctx?.moveTo(p.x, p.y)
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    const ctx = e.currentTarget.getContext('2d')
    const p = pos(e)
    ctx?.lineTo(p.x, p.y)
    ctx?.stroke()
    if (!hasInk) setHasInk(true)
  }
  function up(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = false
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* noop */ }
  }
  function clear() {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (c && ctx) {
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.restore()
    }
    setHasInk(false)
  }
  function save() {
    const c = canvasRef.current
    if (!c || !hasInk) return
    onSave(c.toDataURL('image/png'), name.trim())
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="sig-name" className="block text-sm font-medium mb-1">Full name</label>
        <input id="sig-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Type your name" className="w-full rounded-lg border border-line px-3 py-2.5 text-sm min-h-[44px]" />
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Signature drawing area"
          className="w-full h-40 rounded-lg border border-line bg-paper touch-none cursor-crosshair"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={up}
        />
        <div className="pointer-events-none absolute inset-x-6 bottom-8 border-b border-dashed border-steel/50" />
        <span className="pointer-events-none absolute left-6 bottom-2 font-mono text-[10px] uppercase tracking-widest text-steel">{signerLabel}</span>
      </div>
      <p className="text-xs text-steel">
        Demo signature pad. Legally binding e-signature via SignWell is coming in v1.1.
      </p>
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={clear} icon={<Eraser size={16} />}>Clear</Button>
        {onCancel && <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>}
        <Button size="sm" onClick={save} disabled={!hasInk || !name.trim()}>Accept and sign</Button>
      </div>
    </div>
  )
}
