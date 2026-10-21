# Gundy Consultations: website + demo portal

Marketing website for Gundy Consultations plus a fully interactive demo portal (`/demo`) that lets any visitor try every feature of the contractor "business operating system" Gundy sets up: Company Brain, bid and lead sweeps with fit scoring, pipeline, outreach, CRM, projects, estimator, proposals, change orders, daily logs, calendar, crew, field app, client portal, invoicing, job costing, compliance vault, paperwork on demand, and AI assist.

The demo uses a fictional sample company, **Cumberland Ridge Builders** (Nashville, TN). All demo data is invented and labelled "Sample data". Nothing in it is a real solicitation, permit or person.

## Stack

Vite + React 18 + TypeScript (strict) + Tailwind CSS v3 + React Router v6 + lucide-react + framer-motion. Vitest for unit tests. No chart or PDF libraries: charts are SVG, documents print through a print stylesheet.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build to dist/
npm run preview    # serve dist/ locally
npm test           # vitest: scoring, vcard, ics, money
```

## Deploy to Netlify

1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site > Import an existing project**, pick the repo.
3. Build command `npm run build`, publish directory `dist` (both are already in `netlify.toml`, as is the SPA redirect and the functions folder).
4. Optional, for live AI: **Site settings > Environment variables**, add `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`, default `gpt-4o-mini`). Without a key the demo falls back to local template generators and shows a "Demo output" chip instead of "Live AI".
5. The consultation form uses Netlify Forms. After the first deploy, check **Forms** in the Netlify dashboard for the `consultation` form and add an email notification.

## Where things live

```
src/config/site.ts        every unconfirmed business detail (phone, email, address, prices) with TODO comments
src/components/           shared UI: Button, Card, Badge, Drawer, Modal, Sheet, Tabs, Table, EmptyState, MicButton, SignaturePad, WheelTimePicker, RichTextEditor, GundyLogo, charts/BarChart
src/site/                 landing page sections and layout
src/pages/                Privacy, Terms, NotFound
src/demo/                 the portal
  types.ts                all demo types
  store.tsx               React context + reducer, persisted to localStorage under gundy-demo-v1
  seed/                   sample data (dates computed at runtime)
  lib/                    scoring, vcard, ics, money, ai, image, offlineQueue, dates
  layout/                 gate, shell, help sheets, offline queue panel, setup wizard, global search
  modules/                one folder per screen
  print/                  print routes: capability statement, prequal packet, proposal, change order, invoice / pay app, estimate, lien waiver checklist
netlify/functions/ai.ts   server-side OpenAI proxy (key never reaches the browser)
public/images/            logo files; put real photos here
public/og-image.png       the link preview card (1200x630); regenerate from scripts/og-card.html
scripts/og-card.html      HTML source of the preview card: open in a browser at 1200x630 and screenshot, or render with Playwright
public/sample-contacts.vcf  5-contact file for testing the import
```

## Verification checklist (what was tested)

- `npm run build` passes with zero TypeScript errors; `npm test` passes (28 tests).
- Every route and every demo module opened as every role; no console errors.
- 375px, 768px and 1440px: no horizontal scroll; drawers, modals and the kanban work (Move to menu on touch).
- Reset Demo restores seed. Run sweep adds 2 to 4 stamped "New" records. Toggling a credential or changing bonding re-scores bids live. Expired COI blocks sub assignment. Tax rate is editable per estimate. `.vcf` import handles a multi-contact file. `.ics` export opens in a calendar app. Print routes render. Mic button works in Chrome and shows the unsupported message elsewhere. AI falls back to templates with no key. The offline queue shows and retries failed saves.
- No emoji and no placeholder filler text anywhere in the repo.

## TODO: confirm with Gundy

All of these are in `src/config/site.ts` unless noted.

- Legal entity name
- Custom domain: connected (https://gundyconsultations.com). The netlify.app subdomain 301-redirects to it via `netlify.toml`.
- Phone number and `tel:` link
- Service area statement
- Business hours
- Founding year
- Social links (LinkedIn, Facebook, Instagram)
- Package prices: Contracts $5,000 + $399/mo, Growth $1,500 + $199/mo, Foundation $999 + $99/mo
- Package notes: annual prepay (2 months free) and setup credit toward an upgrade
- Privacy Policy and Terms of Service: starter text, to be reviewed by counsel (`src/pages/Privacy.tsx`, `src/pages/Terms.tsx`)
- Real photos for `public/images/`
- Google reviews embed on client sites (only real reviews)
- SignWell (or chosen e-signature provider) for v1.1
