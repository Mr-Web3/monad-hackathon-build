'use client'

import React from 'react'

interface PizzaSVGProps {
  sliceCount: number
  progress: number
  executedSlices?: number[]
  size?: number
}

const PizzaSVG: React.FC<PizzaSVGProps> = ({
  sliceCount,
  progress,
  executedSlices = [],
  size = 300,
}) => {
  const center = size / 2
  const radius = size * 0.42
  const crustWidth = size * 0.06

  const slices = Array.from({ length: sliceCount }, (_, i) => {
    const startAngle = (i * 360) / sliceCount - 90
    const endAngle = ((i + 1) * 360) / sliceCount - 90
    const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180)

    const separation = progress * (size * 0.15)
    const offsetX = Math.cos(midAngle) * separation
    const offsetY = Math.sin(midAngle) * separation

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)

    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

    const isExecuted = executedSlices.includes(i)

    const toppingAngle = midAngle
    const toppingR = radius * 0.55
    const toppingX = center + toppingR * Math.cos(toppingAngle)
    const toppingY = center + toppingR * Math.sin(toppingAngle)

    const toppingR2 = radius * 0.3
    const toppingX2 = center + toppingR2 * Math.cos(toppingAngle + 0.2)
    const toppingY2 = center + toppingR2 * Math.sin(toppingAngle + 0.2)

    return (
      <g
        key={i}
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease',
          opacity: isExecuted ? 0.15 : 1,
        }}
      >
        <path
          d={path}
          fill="hsl(8 78% 42%)"
          stroke="hsl(38 72% 55%)"
          strokeWidth={crustWidth}
          strokeLinejoin="round"
        />
        <path
          d={path}
          fill="hsl(45 60% 78%)"
          opacity={0.6}
          style={{ clipPath: `circle(${radius * 0.85}px at ${center}px ${center}px)` }}
        />
        <circle cx={toppingX} cy={toppingY} r={size * 0.03} fill="hsl(8 78% 35%)" />
        <circle cx={toppingX2} cy={toppingY2} r={size * 0.025} fill="hsl(8 78% 38%)" />
        <circle
          cx={toppingX + size * 0.04}
          cy={toppingY - size * 0.02}
          r={size * 0.015}
          fill="hsl(142 50% 40%)"
        />

        {progress > 0.05 && (
          <line
            x1={center}
            y1={center}
            x2={x1}
            y2={y1}
            stroke="hsl(20 10% 8%)"
            strokeWidth={1 + progress * 2}
            opacity={progress}
          />
        )}
      </g>
    )
  })

  const cheeseStretch =
    progress > 0.1 && progress < 0.8
      ? Array.from({ length: sliceCount }, (_, i) => {
          const angle1 = ((i * 360) / sliceCount - 90) * (Math.PI / 180)
          const midAngle =
            (((i * 360) / sliceCount + ((i + 1) * 360) / sliceCount) / 2 - 90) * (Math.PI / 180)
          const stretchR = radius * 0.3
          return (
            <line
              key={`cheese-${i}`}
              x1={center + stretchR * Math.cos(angle1)}
              y1={center + stretchR * Math.sin(angle1)}
              x2={center + stretchR * Math.cos(midAngle) + progress * 8}
              y2={center + stretchR * Math.sin(midAngle) + progress * 8}
              stroke="hsl(45 80% 75%)"
              strokeWidth={2 - progress * 1.5}
              opacity={0.6 * (1 - progress)}
              strokeLinecap="round"
            />
          )
        })
      : null

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl">
      <defs>
        <filter id="pizza-glow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <radialGradient id="pizza-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(24 90% 55%)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={center} cy={center} r={radius * 1.3} fill="url(#pizza-shadow)" />

      {cheeseStretch}
      {slices}

      {progress < 0.1 && <circle cx={center} cy={center} r={size * 0.02} fill="hsl(8 78% 45%)" />}
    </svg>
  )
}

export default PizzaSVG
