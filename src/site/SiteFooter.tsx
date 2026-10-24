import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import { GundyLogo } from '@/components/GundyLogo'
import { site } from '@/config/site'

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-ink text-white bg-blueprint-grid-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <GundyLogo variant="light" size="lg" />
          <p className="mt-4 text-white/70 max-w-sm text-sm leading-relaxed">
            A website that wins trust, plus a portal that finds the bids and leads you qualify for, drafts the outreach, and runs the jobs. Built for contractors and construction companies.
          </p>
        </div>
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-survey-light mb-4">Explore</h3>
          <ul className="space-y-2 text-sm">
            {[
              ['/#how-it-works', 'How it works'],
              ['/#features', 'Features'],
              ['/#who', "Who it's for"],
              ['/#packages', 'Packages'],
              ['/#faq', 'FAQ'],
            ].map(([href, label]) => (
              <li key={href}>
                {href.startsWith('/#') ? (
                  <a href={href} className="text-white/80 hover:text-white inline-flex min-h-[32px] items-center">{label}</a>
                ) : (
                  <Link to={href} className="text-white/80 hover:text-white inline-flex min-h-[32px] items-center">{label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-survey-light mb-4">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={site.phoneHref} className="inline-flex items-center gap-2 text-white/80 hover:text-white min-h-[32px]">
                <Phone size={16} /> {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 text-white/80 hover:text-white min-h-[32px] break-all">
                <Mail size={16} /> {site.email}
              </a>
            </li>
            <li className="inline-flex items-start gap-2 text-white/80">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>
                {site.address.street}
                <br />
                {site.address.city}, {site.address.state} {site.address.zip}, {site.address.country}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs text-white/60">
          <p>&copy; {year} {site.legalName}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
