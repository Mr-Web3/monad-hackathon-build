'use client'

import React from 'react'

interface SliceEffectProps {
  active: boolean
}

/**
 * A diagonal pizza-cutter slash that flashes across its parent.
 * Parent must have `position: relative` and `overflow: hidden`.
 */
const SliceEffect: React.FC<SliceEffectProps> = ({ active }) => {
  if (!active) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Main slash line */}
      <div
        className="absolute top-1/2 left-0 w-[200%] slice-flash"
        style={{
          height: 3,
          marginTop: -1.5,
          background:
            'linear-gradient(90deg, transparent 0%, hsl(38,72%,55%) 30%, hsl(45,80%,85%) 50%, hsl(38,72%,55%) 70%, transparent 100%)',
          filter: 'blur(0.5px)',
          transformOrigin: 'center',
        }}
      />
      {/* Glow trail */}
      <div
        className="absolute top-1/2 left-0 w-[200%] slice-flash"
        style={{
          height: 20,
          marginTop: -10,
          background:
            'linear-gradient(90deg, transparent 0%, hsl(24,90%,55%,0.15) 35%, hsl(24,90%,55%,0.3) 50%, hsl(24,90%,55%,0.15) 65%, transparent 100%)',
          filter: 'blur(4px)',
          transformOrigin: 'center',
          animationDelay: '0.02s',
        }}
      />
    </div>
  )
}

export default SliceEffect
