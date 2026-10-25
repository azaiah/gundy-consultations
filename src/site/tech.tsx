import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Landmark, Send, FileSignature, ShieldAlert, Receipt, Radar, type LucideIcon } from 'lucide-react'

/* ------------------------------------------------------------------ portal screens */
export type Screen = { key: string; label: string; desk: string; phone: string; caption: string }
export const SCREENS: Screen[] = [
  { key: 'dashboard', label: 'Dashboard', desk: '/portal/desk-home.webp', phone: '/portal/phone-home.webp', caption: 'New leads, bids due, pipeline value and what needs you today.' },
  { key: 'bids', label: 'Bids board', desk: '/portal/desk-bids.webp', phone: '/portal/phone-bids.webp', caption: 'Public bids and GC invitations, each scored against your credentials.' },
  { key: 'pipeline', label: 'Pipeline', desk: '/portal/desk-pipeline.webp', phone: '/portal/phone-pipeline.webp', caption: 'Every opportunity from found to won, with win rate and dollars bid.' },
  { key: 'projects', label: 'Projects', desk: '/portal/desk-projects.webp', phone: '/portal/phone-field.webp', caption: 'Jobs, punch lists and daily logs, with the field app on every phone.' },
]

/* ------------------------------------------------------------------ device frames */
export function Laptop({ src, alt, scan = true, eager = false }: { src: string; alt: string; scan?: boolean; eager?: boolean }) {
  return (
    <div className="laptop" role="img" aria-label={alt}>
      <div className="laptop-lid">
        <span className="laptop-cam" aria-hidden="true" />
        <div className="laptop-screen">
          <AnimatePresence mode="sync" initial={false}>
            <motion.img
              key={src}
              src={src}
              alt=""
              width={1600}
              height={1000}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              initial={{ opacity: 0, scale: 1.015 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </AnimatePresence>
          {scan && <span className="scanline" aria-hidden="true" />}
          <span className="screen-glare" aria-hidden="true" />
        </div>
      </div>
      <div className="laptop-base" aria-hidden="true"><span /></div>
    </div>
  )
}

export function Phone({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return (
    <div className="phone" role="img" aria-label={alt}>
      <div className="phone-screen">
        <AnimatePresence mode="sync" initial={false}>
          <motion.img
            key={src}
            src={src}
            alt=""
            width={780}
            height={1688}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </AnimatePresence>
        <span className="phone-island" aria-hidden="true" />
        <span className="screen-glare" aria-hidden="true" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ floating notifications */
type Chip = { icon: LucideIcon; title: string; sub: string; tone: 'survey' | 'ok' | 'warn' }
const CHIPS: Chip[] = [
  { icon: Landmark, title: 'New bid matched', sub: 'Fire Station 19 Kitchen · Fit 88', tone: 'survey' },
  { icon: Send, title: 'Outreach drafted', sub: 'Waiting for your approval', tone: 'survey' },
  { icon: FileSignature, title: 'Change order signed', sub: 'Whitaker Kitchen · +$4,850', tone: 'ok' },
  { icon: ShieldAlert, title: 'COI expires in 7 days', sub: 'Whitfield Plumbing · reminder sent', tone: 'warn' },
  { icon: Receipt, title: 'Invoice paid', sub: 'Lamont Reroof · $12,400', tone: 'ok' },
  { icon: Radar, title: 'Sweep #45 complete', sub: '6 new matches · 2 no-go', tone: 'survey' },
]

function FloatChip({ chip, className }: { chip: Chip; className: string }) {
  const Icon = chip.icon
  return (
    <motion.div
      className={`float-chip ${className}`}
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <span className={`chip-icon tone-${chip.tone}`}><Icon size={15} aria-hidden="true" /></span>
      <span className="min-w-0">
        <span className="block text-[12.5px] font-semibold text-white leading-tight">{chip.title}</span>
        <span className="block font-mono text-[10.5px] text-white/60 leading-tight mt-0.5 truncate">{chip.sub}</span>
      </span>
    </motion.div>
  )
}

/**
 * Laptop + phone floating over the blueprint, cycling through real portal screens,
 * with notifications popping in around them. Tilts slightly toward the cursor on desktop.
 */
export function DeviceShowcase({ screens = SCREENS, index: controlled, auto = true, chips = true, eager = false }: { screens?: Screen[]; index?: number; auto?: boolean; chips?: boolean; eager?: boolean }) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [c, setC] = useState(0)
  const idx = controlled ?? i
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-10% 0px' })
  useEffect(() => {
    if (!auto || controlled !== undefined || reduce || !inView) return
    const t = setInterval(() => setI((v) => (v + 1) % screens.length), 4800)
    return () => clearInterval(t)
  }, [auto, controlled, reduce, inView, screens.length])
  useEffect(() => {
    if (!chips || reduce || !inView) return
    const t = setInterval(() => setC((v) => (v + 1) % CHIPS.length), 2600)
    return () => clearInterval(t)
  }, [chips, reduce, inView])

  const mx = useMotionValue(0), my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 120, damping: 20 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 20 })
  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = ref.current?.getBoundingClientRect(); if (!r) return
    mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const s = screens[idx]
  const a = CHIPS[c], b = CHIPS[(c + 3) % CHIPS.length]

  return (
    <div ref={ref} className="showcase" onPointerMove={onMove} onPointerLeave={() => { mx.set(0); my.set(0) }}>
      <motion.div className="showcase-stage" style={reduce ? undefined : { rotateX: rx, rotateY: ry }}>
        <div className="showcase-glow" aria-hidden="true" />
        <div className={`showcase-laptop ${reduce ? '' : 'float-a'}`}>
          <Laptop src={s.desk} alt={`Gundy portal ${s.label} on a laptop`} eager={eager} />
        </div>
        <div className={`showcase-phone ${reduce ? '' : 'float-b'}`}>
          <Phone src={s.phone} alt={`Gundy portal ${s.label} on a phone`} eager={eager} />
        </div>
        {chips && (
          <>
            <AnimatePresence mode="wait"><FloatChip key={'a' + c} chip={a} className="chip-pos-a" /></AnimatePresence>
            <AnimatePresence mode="wait"><FloatChip key={'b' + c} chip={b} className="chip-pos-b" /></AnimatePresence>
          </>
        )}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ live sweep ticker */
const LOG = [
  '06:00:02 ▸ SWEEP #45 START · Cumberland Ridge Builders',
  '06:00:07 ▸ SAM.gov · 212 notices scanned · 3 match trade + bonding',
  '06:00:11 ▸ TN state procurement · 41 scanned · 1 match',
  '06:00:14 ▸ Metro Codes permits · 37215 · $148,000 addition · lead created',
  '06:00:19 ▸ GC invite parsed · Harpeth Valley · 12,400 SF fit-out · Fit 81',
  '06:00:23 ▸ Fit scoring · 6 go · 2 no-go (bond limit)',
  '06:00:31 ▸ Outreach drafted · 6 emails · 6 call scripts',
  '06:00:34 ▸ SWEEP #45 COMPLETE · waiting for your approval',
]
export function SweepTicker({ dark = false }: { dark?: boolean }) {
  const reduce = useReducedMotion()
  const row = (
    <span className="ticker-row" aria-hidden={false}>
      {LOG.map((l) => (
        <span key={l} className="ticker-item"><span className="ticker-dot" aria-hidden="true" />{l}</span>
      ))}
    </span>
  )
  return (
    <div className={`ticker ${dark ? 'ticker-dark' : ''}`} aria-label="Sample sweep log">
      <div className={`ticker-track ${reduce ? '' : 'is-moving'}`}>
        {row}
        <span aria-hidden="true" className="ticker-row">{LOG.map((l) => <span key={'d' + l} className="ticker-item"><span className="ticker-dot" />{l}</span>)}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ terminal */
export function SweepTerminal({ title = 'sweep.log', lines = LOG }: { title?: string; lines?: string[] }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const [n, setN] = useState(reduce ? lines.length : 0)
  const [typed, setTyped] = useState(0)
  useEffect(() => {
    if (reduce || !inView || n >= lines.length) return
    const line = lines[n]
    if (typed < line.length) { const t = setTimeout(() => setTyped(typed + 2), 14); return () => clearTimeout(t) }
    const t = setTimeout(() => { setN(n + 1); setTyped(0) }, 260)
    return () => clearTimeout(t)
  }, [inView, n, typed, lines, reduce])
  return (
    <div ref={ref} className="terminal" role="log" aria-label="Sample sweep log">
      <div className="terminal-h"><span /><span /><span /><b>{title}</b><em>LIVE</em></div>
      <ol className="terminal-body">
        {lines.slice(0, n).map((l) => <li key={l}>{fmtLine(l)}</li>)}
        {n < lines.length && <li>{fmtLine(lines[n].slice(0, typed))}<i className="caret" aria-hidden="true" /></li>}
        {n >= lines.length && <li className="text-white/40">$ next sweep scheduled · Mon 06:00 ET<i className="caret" aria-hidden="true" /></li>}
      </ol>
    </div>
  )
}
function fmtLine(l: string) {
  const [t, ...rest] = l.split(' ▸ ')
  return <><span className="text-white/35">{t}</span>{rest.length ? <span className="text-survey-light"> ▸ </span> : null}<span>{rest.join(' ▸ ')}</span></>
}

/* ------------------------------------------------------------------ count-up */
export function CountUp({ to, prefix = '', suffix = '', decimals = 0, className = '' }: { to: number; prefix?: string; suffix?: string; decimals?: number; className?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [v, setV] = useState(reduce ? to : 0)
  useEffect(() => {
    if (!inView || reduce) return
    const c = animate(0, to, { duration: 1.4, ease: [0.2, 0.8, 0.2, 1], onUpdate: setV })
    return () => c.stop()
  }, [inView, to, reduce])
  return <span ref={ref} className={className}>{prefix}{v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>
}

/* ------------------------------------------------------------------ decode text */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#<>'
export function Scramble({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  const [out, setOut] = useState(reduce ? text : text.replace(/[^\s·]/g, ' '))
  useEffect(() => {
    if (reduce) return
    let frame = 0, raf = 0
    const total = 26
    const start = performance.now() + delay
    const tick = (now: number) => {
      if (now < start) { raf = requestAnimationFrame(tick); return }
      frame++
      const done = Math.floor((frame / total) * text.length)
      setOut(text.split('').map((ch, i) => (i < done || ch === ' ' || ch === '·' ? ch : GLYPHS[(i * 7 + frame) % GLYPHS.length])).join(''))
      if (frame < total) raf = requestAnimationFrame(tick)
      else setOut(text)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, delay, reduce])
  return <span className={className} aria-label={text}><span aria-hidden="true">{out}</span></span>
}

/* ------------------------------------------------------------------ blueprint background */
export function BlueprintField({ packets = true }: { packets?: boolean }) {
  const reduce = useReducedMotion()
  const v = Array.from({ length: 9 }, (_, i) => i)
  const h = Array.from({ length: 6 }, (_, i) => i)
  const dots = useMemo(() => [
    { top: '28.6%', dur: 7, delay: 0 }, { top: '57.2%', dur: 9, delay: 2.5 }, { top: '85.8%', dur: 8, delay: 5 }, { top: '14.3%', dur: 11, delay: 1.2 },
  ], [])
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
        {v.map((i) => (
          <motion.line key={`v${i}`} x1={(i + 1) * 120} x2={(i + 1) * 120} y1={0} y2={800} stroke="rgba(255,255,255,0.07)" strokeWidth="1"
            initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.1 + i * 0.05, ease: 'easeOut' }} />
        ))}
        {h.map((i) => (
          <motion.line key={`h${i}`} x1={0} x2={1200} y1={(i + 1) * 114.3} y2={(i + 1) * 114.3} stroke="rgba(255,255,255,0.07)" strokeWidth="1"
            initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.3 + i * 0.06, ease: 'easeOut' }} />
        ))}
      </svg>
      {packets && !reduce && dots.map((d, i) => <span key={i} className="packet" style={{ top: d.top, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }} />)}
      <div className="field-vignette" />
    </div>
  )
}

/* ------------------------------------------------------------------ inner page header */
export function PageHero({ index, eyebrow, title, text, children, aside }: { index: string; eyebrow: string; title: ReactNode; text?: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <BlueprintField />
      <div className={`relative mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-20 ${aside ? 'grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center' : ''}`}>
        <div>
          <p className="sys-label"><span className="sys-index">[ {index} ]</span> <Scramble text={eyebrow} /></p>
          <motion.h1 className="display mt-4 text-[2.6rem] sm:text-6xl lg:text-7xl max-w-4xl" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}>
            {title}
          </motion.h1>
          <motion.div className="dim-line mt-5 max-w-xl" initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, delay: 0.35, ease: 'easeInOut' }} aria-hidden="true" />
          {text && <motion.p className="mt-5 text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{text}</motion.p>}
          {children}
        </div>
        {aside}
      </div>
      <div className="coord-strip" aria-hidden="true"><span>N 37.65° · W 77.50°</span><span>GUNDY / SYS v2.6</span><span className="hidden sm:inline">STATUS · ONLINE<i className="status-dot" /></span></div>
    </section>
  )
}
