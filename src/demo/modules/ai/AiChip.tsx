import { Sparkles, FileCode2 } from 'lucide-react'

export function AiChip({ live }: { live: boolean }) {
  return live ? (
    <span className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-[#E6F3EC] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-success">
      <Sparkles size={11} /> Live AI
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md border border-line bg-concrete px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-steel">
      <FileCode2 size={11} /> Demo output
    </span>
  )
}
