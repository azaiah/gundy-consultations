import { useRef, useState } from 'react'
import { Camera, ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/Button'
import type { Attachment } from '../../types'
import { downscaleImage, dataUrlSize } from '../../lib/image'
import { uid } from '../../lib/ids'

/** Photo and media attachments with file input + camera capture on mobile; images downscaled to 1280px JPEG. */
export function PhotoAttach({ attachments, onChange, label = 'Photos', compact = false }: { attachments: Attachment[]; onChange: (a: Attachment[]) => void; label?: string; compact?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const camRef = useRef<HTMLInputElement>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handle(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    setErr(null)
    const next: Attachment[] = []
    for (const f of Array.from(files)) {
      try {
        if (!f.type.startsWith('image/')) {
          setErr(`${f.name} is not an image. Only photos are stored in the demo.`)
          continue
        }
        const dataUrl = await downscaleImage(f)
        next.push({ id: uid('att'), name: f.name, dataUrl, type: 'image/jpeg', createdAt: new Date().toISOString(), size: dataUrlSize(dataUrl) })
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Could not read that file.')
      }
    }
    if (next.length) onChange([...attachments, ...next])
    setBusy(false)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" aria-label={`Add ${label.toLowerCase()} from files`} onChange={(e) => { void handle(e.target.files); e.target.value = '' }} />
        <input ref={camRef} type="file" accept="image/*" capture="environment" className="sr-only" aria-label="Take a photo" onChange={(e) => { void handle(e.target.files); e.target.value = '' }} />
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} icon={<ImagePlus size={14} />} disabled={busy}>{busy ? 'Processing...' : compact ? 'Add' : `Add ${label.toLowerCase()}`}</Button>
        <Button size="sm" variant="outline" onClick={() => camRef.current?.click()} icon={<Camera size={14} />} disabled={busy}>Camera</Button>
        <span className="text-xs text-steel">Downscaled to 1280px JPEG</span>
      </div>
      {err && <p role="alert" className="text-xs text-danger mt-1">{err}</p>}
      {attachments.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {attachments.map((a) => (
            <li key={a.id} className="relative group rounded-lg overflow-hidden border border-line bg-concrete aspect-square">
              <img src={a.dataUrl} alt={a.name} className="h-full w-full object-cover" />
              <button type="button" onClick={() => onChange(attachments.filter((x) => x.id !== a.id))} className="absolute top-1 right-1 h-8 w-8 rounded-full bg-ink/70 text-white flex items-center justify-center" aria-label={`Remove ${a.name}`}>
                <X size={14} />
              </button>
              <span className="absolute bottom-0 inset-x-0 bg-ink/60 text-white text-[10px] px-1 py-0.5 truncate">{Math.round(a.size / 1024)} KB</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
