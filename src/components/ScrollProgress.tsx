import { motion, useScroll, useSpring } from 'framer-motion'

/** Thin top-of-page progress bar styled as a survey tape with tick marks. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  return (
    <div className="fixed top-0 left-0 right-0 z-[70] h-[6px] pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(20,23,28,0.25) 1px, transparent 1px)',
          backgroundSize: '24px 6px',
        }}
      />
      <motion.div className="absolute inset-y-0 left-0 w-full origin-left bg-survey" style={{ scaleX }} />
    </div>
  )
}
