import { useEffect, useRef } from 'react'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { MicButton } from './MicButton'

/** Minimal rich text editor (bold, italic, lists) backed by contentEditable; emits sanitized-ish HTML. */
export function RichTextEditor({ value, onChange, placeholder = 'Write a note...', label }: { value: string; onChange: (html: string) => void; placeholder?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el && el.innerHTML !== value) el.innerHTML = value
  }, [value])

  function exec(cmd: string) {
    ref.current?.focus()
    document.execCommand(cmd, false)
    onChange(ref.current?.innerHTML ?? '')
  }

  function appendText(t: string) {
    const el = ref.current
    if (!el) return
    el.innerHTML = `${el.innerHTML}${el.innerHTML ? ' ' : ''}${escapeHtml(t)}`
    onChange(el.innerHTML)
  }

  return (
    <div className="rte rounded-lg border border-line bg-paper">
      <div className="flex items-center gap-1 border-b border-line px-2 py-1.5">
        <button type="button" onClick={() => exec('bold')} className="tap inline-flex items-center justify-center rounded hover:bg-concrete" aria-label="Bold"><Bold size={16} /></button>
        <button type="button" onClick={() => exec('italic')} className="tap inline-flex items-center justify-center rounded hover:bg-concrete" aria-label="Italic"><Italic size={16} /></button>
        <button type="button" onClick={() => exec('insertUnorderedList')} className="tap inline-flex items-center justify-center rounded hover:bg-concrete" aria-label="Bulleted list"><List size={16} /></button>
        <button type="button" onClick={() => exec('insertOrderedList')} className="tap inline-flex items-center justify-center rounded hover:bg-concrete" aria-label="Numbered list"><ListOrdered size={16} /></button>
        <span className="ml-auto"><MicButton size="sm" onTranscript={appendText} /></span>
      </div>
      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => onChange(ref.current?.innerHTML ?? '')}
        className="min-h-[110px] px-3 py-2 text-sm outline-none break-words"
      />
    </div>
  )
}

export function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Allow only a tiny safe subset when rendering stored HTML. */
export function sanitizeHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const allowed = new Set(['B', 'STRONG', 'I', 'EM', 'UL', 'OL', 'LI', 'BR', 'P', 'DIV'])
  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      if (!allowed.has(child.tagName)) {
        child.replaceWith(...Array.from(child.childNodes))
      } else {
        for (const attr of Array.from(child.attributes)) child.removeAttribute(attr.name)
        walk(child)
      }
    }
  }
  walk(doc.body)
  return doc.body.innerHTML
}
