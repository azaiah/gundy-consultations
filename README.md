# Gundy Consultations: marketing website

Marketing website for Gundy Consultations (https://gundyconsultations.com). The interactive demo portal lives in its own private project (`gundy-demo`) and is shared by link only, so none of its code ships with this site.

## Stack

Vite + React 18 + TypeScript (strict) + Tailwind CSS v3 + React Router v6 + lucide-react + framer-motion.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build to dist/
npm run preview    # serve dist/ locally
```

## Deploy to Netlify

1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site > Import an existing project**, pick the repo.
3. Build command `npm run build`, publish directory `dist` (both are already in `netlify.toml`, with the SPA redirect, the netlify.app to custom-domain redirect and the old `/demo` redirect).
4. The consultation form uses Netlify Forms. After the first deploy, check **Forms** in the Netlify dashboard for the `consultation` form and add an email notification.

## Where things live

```
src/config/site.ts        every business detail (phone, email, address, prices); unconfirmed ones have TODO comments
src/components/           shared UI: Button, Card, Badge, GundyLogo and friends
src/site/                 landing page sections and layout
src/pages/                Privacy, Terms, NotFound
public/images/            logo files; put real photos here
public/og-image.png       the link preview card (1200x630); regenerate from scripts/og-card.html
scripts/og-card.html      HTML source of the preview card: render at 1200x630 with Playwright
```

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
