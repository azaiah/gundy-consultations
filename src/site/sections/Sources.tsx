import { Landmark, Building, MapPin, School, Home, HardHat, FileText, Store, Users, KeyRound } from 'lucide-react'

const sources = [
  { icon: Landmark, label: 'SAM.gov' },
  { icon: Building, label: 'State procurement portals' },
  { icon: MapPin, label: 'County and city procurement' },
  { icon: School, label: 'School districts' },
  { icon: Home, label: 'Housing authorities' },
  { icon: HardHat, label: 'GC invitations to bid' },
  { icon: FileText, label: 'Building permits' },
  { icon: Store, label: 'New commercial build-outs' },
  { icon: Users, label: 'Property managers' },
  { icon: KeyRound, label: 'HOAs' },
]

export function Sources() {
  return (
    <section aria-labelledby="sources-h" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <h2 id="sources-h" className="stamp text-center mb-5">Where the engine looks</h2>
        <ul className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {sources.map((s) => (
            <li key={s.label} className="inline-flex items-center gap-2 rounded-full border border-line bg-concrete px-3.5 py-2 text-sm font-medium text-ink">
              <s.icon size={16} className="text-blueprint" aria-hidden="true" />
              {s.label}
            </li>
          ))}
        </ul>
        <p className="text-center text-xs text-steel mt-4">Public sources, your own GC relationships, and local permit data. We never scrape paid plan rooms.</p>
      </div>
    </section>
  )
}
