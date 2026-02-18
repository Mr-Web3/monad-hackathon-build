'use client'

import React, { useMemo } from 'react'

interface CheeseDripsProps {
  /** Which edge to drip from */
  edge?: 'bottom' | 'top'
  /** Cheese color variant */
  variant?: 'golden' | 'mozzarella'
  /** Subtle mode — smaller, more refined drips */
  subtle?: boolean
  className?: string
}

const DRIP_PROFILES = [
  { pct: 6, w: 6, h: 14, anim: 'cheese-drip-slow', dur: '4.5s', delay: '0s' },
  { pct: 14, w: 4, h: 9, anim: 'cheese-drip-fast', dur: '3.8s', delay: '0.6s' },
  { pct: 23, w: 7, h: 18, anim: 'cheese-drip-wobble', dur: '5.2s', delay: '1.2s' },
  { pct: 33, w: 3, h: 7, anim: 'cheese-drip-slow', dur: '5.6s', delay: '1.8s' },
  { pct: 42, w: 5, h: 13, anim: 'cheese-drip-fast', dur: '4.0s', delay: '0.3s' },
  { pct: 52, w: 8, h: 20, anim: 'cheese-drip-wobble', dur: '5.0s', delay: '1.5s' },
  { pct: 61, w: 4, h: 8, anim: 'cheese-drip-slow', dur: '4.8s', delay: '0.9s' },
  { pct: 70, w: 6, h: 16, anim: 'cheese-drip-fast', dur: '4.2s', delay: '2.0s' },
  { pct: 79, w: 5, h: 11, anim: 'cheese-drip-wobble', dur: '4.4s', delay: '0.4s' },
  { pct: 87, w: 7, h: 19, anim: 'cheese-drip-slow', dur: '5.4s', delay: '1.1s' },
  { pct: 93, w: 4, h: 10, anim: 'cheese-drip-fast', dur: '3.9s', delay: '1.6s' },
]

const COLORS = {
  golden: {
    main: 'hsl(40, 75%, 52%)',
    tip: 'hsl(36, 68%, 44%)',
    glisten: 'hsl(48, 90%, 72%)',
    glow: 'hsl(38, 70%, 50%, 0.3)',
  },
  mozzarella: {
    main: 'hsl(48, 55%, 80%)',
    tip: 'hsl(44, 45%, 68%)',
    glisten: 'hsl(50, 85%, 90%)',
    glow: 'hsl(48, 55%, 80%, 0.2)',
  },
}

const CheeseDrips: React.FC<CheeseDripsProps> = ({
  edge = 'bottom',
  variant = 'golden',
  subtle = false,
  className = '',
}) => {
  const colors = COLORS[variant]
  const isTop = edge === 'top'
  const scale = subtle ? 0.6 : 1

  const drips = useMemo(
    () =>
      DRIP_PROFILES.map((d, i) => ({
        ...d,
        w: Math.round(d.w * scale),
        h: Math.round(d.h * scale),
        glistenDelay: `${i * 0.9}s`,
      })),
    [scale],
  )

  return (
    <div
      className={`absolute left-0 right-0 pointer-events-none z-10 ${
        isTop ? 'bottom-full rotate-180' : 'top-full'
      } ${className}`}
      style={{ height: subtle ? 24 : 32 }}
    >
      {drips.map((d, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${d.pct}%`,
            top: 0,
            width: d.w,
            height: d.h,
            transformOrigin: 'top center',
            animationName: d.anim,
            animationDuration: d.dur,
            animationDelay: d.delay,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            filter: 'blur(0.3px)',
          }}
        >
          {/* Drip body with glossy gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${colors.main} 0%, ${colors.tip} 85%, transparent 100%)`,
              borderRadius: '35% 35% 50% 50%',
              boxShadow: `0 2px 6px ${colors.glow}`,
            }}
          />
          {/* Glisten highlight — subtle reflective spot */}
          <div
            className="absolute rounded-full"
            style={{
              top: '18%',
              left: '22%',
              width: '22%',
              height: '28%',
              background: `radial-gradient(circle, ${colors.glisten}, transparent 70%)`,
              animationName: 'cheese-glisten',
              animationDuration: '3.2s',
              animationDelay: d.glistenDelay,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              opacity: 0.4,
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default CheeseDrips
