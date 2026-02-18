'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const PARTICLE_COUNT = 120
const SLICE_COUNT = 8
const SIZE = 400
const CX = SIZE / 2
const CY = SIZE / 2
const R = SIZE * 0.42

/** Fibonacci sphere point distribution for Morpho-style particle sphere */
function fibPoints(n: number) {
  const gr = (1 + Math.sqrt(5)) / 2
  return Array.from({ length: n }, (_, i) => {
    const theta = (2 * Math.PI * i) / gr
    const phi = Math.acos(1 - (2 * (i + 0.5)) / n)
    return {
      x: Math.cos(theta) * Math.sin(phi),
      y: Math.sin(theta) * Math.sin(phi),
      z: Math.cos(phi),
      size: 1 + Math.random() * 1.5,
      alpha: 0.15 + Math.random() * 0.5,
    }
  })
}

/** SVG arc path for one pizza slice */
function arcPath(i: number) {
  const a0 = (i * 360) / SLICE_COUNT - 90
  const a1 = ((i + 1) * 360) / SLICE_COUNT - 90
  const r0 = (a0 * Math.PI) / 180
  const r1 = (a1 * Math.PI) / 180
  return [
    `M ${CX} ${CY}`,
    `L ${CX + R * Math.cos(r0)} ${CY + R * Math.sin(r0)}`,
    `A ${R} ${R} 0 0 1 ${CX + R * Math.cos(r1)} ${CY + R * Math.sin(r1)}`,
    'Z',
  ].join(' ')
}

/** Mid-angle of a slice in radians */
function midRad(i: number) {
  const a0 = (i * 360) / SLICE_COUNT - 90
  const a1 = ((i + 1) * 360) / SLICE_COUNT - 90
  return (((a0 + a1) / 2) * Math.PI) / 180
}

const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const particleBoxRef = useRef<HTMLDivElement>(null)
  const sliceRefs = useRef<(SVGGElement | null)[]>([])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const particles = useMemo(() => fibPoints(PARTICLE_COUNT), [])
  const slices = useMemo(
    () =>
      Array.from({ length: SLICE_COUNT }, (_, i) => {
        const m = midRad(i)
        return { path: arcPath(i), dx: Math.cos(m), dy: Math.sin(m), mid: m }
      }),
    [],
  )

  /* ── Motion values for wrapper elements (compressed timeline) ── */
  const titleOp = useTransform(scrollYProgress, [0, 0.12, 0.25], [1, 1, 0])
  const titleY = useTransform(scrollYProgress, [0.12, 0.25], [0, -50])
  const statsOp = useTransform(scrollYProgress, [0, 0.08, 0.2], [1, 1, 0])
  const indOp = useTransform(scrollYProgress, [0, 0.06], [1, 0])
  const pzScale = useTransform(scrollYProgress, [0, 0.15, 0.4, 0.65, 0.9], [1, 1.2, 3, 7, 15])
  const pzOp = useTransform(scrollYProgress, [0.6, 0.85], [1, 0])
  const pzRot = useTransform(scrollYProgress, [0, 0.6], [0, 12])

  /* ── Direct-DOM updates for particles + slices (performance) ── */
  useEffect(() => {
    const baseRadius = () => Math.min(window.innerWidth, window.innerHeight) * 0.32

    const unsub = scrollYProgress.on('change', (v) => {
      const bR = baseRadius()
      const expand = 1 + v * 8
      const pOp = Math.max(0, 1 - Math.max(0, v - 0.45) / 0.35)

      // Slow Y-axis rotation for the sphere
      const angle = v * Math.PI * 0.4
      const cA = Math.cos(angle)
      const sA = Math.sin(angle)

      // Update particles
      const box = particleBoxRef.current
      if (box) {
        const els = box.children as HTMLCollectionOf<HTMLElement>
        for (let i = 0; i < els.length && i < particles.length; i++) {
          const p = particles[i]
          const xr = p.x * cA + p.z * sA
          const zr = -p.x * sA + p.z * cA
          const persp = 1 / (1.6 - zr * 0.4)
          const px = xr * persp * bR * expand
          const py = p.y * persp * bR * expand
          els[i].style.transform = `translate(${px}px, ${py}px)`
          els[i].style.opacity = `${pOp * p.alpha * Math.max(0.15, (zr + 1) / 2)}`
        }
      }

      // Update slices — compressed timeline
      const sep = Math.max(0, (v - 0.25) / 0.45) * 220
      const sf = Math.max(0, 1 - Math.max(0, v - 0.55) / 0.3)

      slices.forEach((s, i) => {
        const el = sliceRefs.current[i]
        if (!el) return
        const rot = sep > 1 ? (i % 2 ? 1 : -1) * sep * 0.04 : 0
        el.style.transform = `translate(${s.dx * sep}px, ${s.dy * sep}px) rotate(${rot}deg)`
        el.style.opacity = `${sf}`
      })
    })

    return unsub
  }, [scrollYProgress, particles, slices])

  return (
    <div ref={containerRef} className="relative bg-black" style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(12,12,20,1) 0%, #000 70%)',
          }}
        />

        {/* Particle sphere */}
        <div
          ref={particleBoxRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: 'rgba(150,170,255,1)',
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </div>

        {/* Pizza — offset down to avoid text overlap */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingTop: '8vh' }}>
          <motion.div
            style={{ scale: pzScale, opacity: pzOp, rotate: pzRot }}
            className="will-change-transform"
          >
            <svg
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="drop-shadow-2xl"
            >
              <defs>
                <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="hsl(24,90%,55%)" stopOpacity="0.2" />
                  <stop offset="70%" stopColor="hsl(24,90%,55%)" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Warm glow behind pizza */}
              <circle cx={CX} cy={CY} r={R * 1.4} fill="url(#hero-glow)" />

              {/* Pizza slices */}
              {slices.map((s, i) => {
                const tR1 = R * 0.55
                const tR2 = R * 0.32
                const tX1 = CX + tR1 * Math.cos(s.mid)
                const tY1 = CY + tR1 * Math.sin(s.mid)
                const tX2 = CX + tR2 * Math.cos(s.mid + 0.25)
                const tY2 = CY + tR2 * Math.sin(s.mid + 0.25)

                return (
                  <g
                    key={i}
                    ref={(el) => {
                      sliceRefs.current[i] = el
                    }}
                    style={{
                      transformOrigin: `${CX}px ${CY}px`,
                      willChange: 'transform, opacity',
                    }}
                  >
                    {/* Sauce base */}
                    <path
                      d={s.path}
                      fill="hsl(8,78%,42%)"
                      stroke="hsl(38,72%,55%)"
                      strokeWidth="7"
                      strokeLinejoin="round"
                    />
                    {/* Cheese layer */}
                    <path
                      d={s.path}
                      fill="hsl(45,60%,78%)"
                      opacity="0.45"
                      style={{
                        clipPath: `circle(${R * 0.84}px at ${CX}px ${CY}px)`,
                      }}
                    />
                    {/* Pepperoni */}
                    <circle cx={tX1} cy={tY1} r="7" fill="hsl(8,78%,35%)" />
                    <circle cx={tX2} cy={tY2} r="5.5" fill="hsl(8,78%,38%)" />
                    {/* Basil */}
                    <circle
                      cx={tX1 + 10}
                      cy={tY1 - 5}
                      r="3.5"
                      fill="hsl(142,50%,40%)"
                    />
                  </g>
                )
              })}
            </svg>
          </motion.div>
        </div>

        {/* Title text */}
        <motion.div
          className="absolute inset-x-0 top-0 flex flex-col items-center pt-[12vh] md:pt-[14vh] pointer-events-none z-10"
          style={{ opacity: titleOp, y: titleY }}
        >
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight text-center leading-[1.1]">
            Don&apos;t eat the whole
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              pizza
            </span>{' '}
            at once.
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/50 text-center max-w-md mx-auto font-body">
            Slice large trades for better execution.
            <br />
            <span className="text-white/70">Powered by Monad parallel execution.</span>
          </p>
        </motion.div>

        {/* Bottom stats (Morpho-style) */}
        <motion.div
          className="absolute bottom-14 inset-x-0 px-6 pointer-events-none"
          style={{ opacity: statsOp }}
        >
          <div className="max-w-6xl mx-auto flex justify-between items-end">
            <div className="flex gap-10">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-white/55 mb-0.5">
                  Network
                </div>
                <div className="text-sm text-white/90 font-display font-medium">Monad Testnet</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-white/55 mb-0.5">
                  Strategy
                </div>
                <div className="text-sm text-white/90 font-display font-medium">VWAP Slicing</div>
              </div>
            </div>
            <span className="text-sm text-white/50 font-body">Scroll to explore</span>
          </div>
        </motion.div>

        {/* Scroll indicator dot */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
          style={{ opacity: indOp }}
        >
          <motion.div
            className="w-5 h-8 rounded-full border-2 border-white/35 flex items-start justify-center p-1"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-1 h-1.5 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default HeroSection
