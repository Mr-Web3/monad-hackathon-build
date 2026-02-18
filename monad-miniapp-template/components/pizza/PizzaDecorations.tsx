'use client'

import React from 'react'

/**
 * Ambient pizza-themed decorations scattered throughout the UI.
 * All elements are pointer-events-none and purely visual.
 */
const PizzaDecorations: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
    {/* ── Pepperoni dots ── */}
    <div
      className="absolute w-5 h-5 rounded-full pepperoni-float"
      style={{
        top: '8%',
        left: '6%',
        background: 'radial-gradient(circle at 35% 35%, hsl(8,78%,40%), hsl(8,78%,28%))',
        opacity: 0.2,
        animationDelay: '0s',
      }}
    />
    <div
      className="absolute w-7 h-7 rounded-full pepperoni-float"
      style={{
        top: '35%',
        right: '4%',
        background: 'radial-gradient(circle at 35% 35%, hsl(8,78%,38%), hsl(8,78%,26%))',
        opacity: 0.15,
        animationDelay: '1.2s',
      }}
    />
    <div
      className="absolute w-4 h-4 rounded-full pepperoni-float"
      style={{
        bottom: '25%',
        left: '3%',
        background: 'radial-gradient(circle at 35% 35%, hsl(8,78%,42%), hsl(8,78%,30%))',
        opacity: 0.18,
        animationDelay: '2.5s',
      }}
    />
    <div
      className="absolute w-6 h-6 rounded-full pepperoni-float"
      style={{
        top: '65%',
        right: '8%',
        background: 'radial-gradient(circle at 35% 35%, hsl(8,78%,36%), hsl(8,78%,25%))',
        opacity: 0.12,
        animationDelay: '3.8s',
      }}
    />
    <div
      className="absolute w-3 h-3 rounded-full pepperoni-float"
      style={{
        top: '18%',
        right: '20%',
        background: 'radial-gradient(circle at 35% 35%, hsl(8,78%,44%), hsl(8,78%,32%))',
        opacity: 0.14,
        animationDelay: '0.7s',
      }}
    />

    {/* ── Basil leaves (teardrop shapes) ── */}
    <div
      className="absolute w-3 h-5 pepperoni-float"
      style={{
        top: '28%',
        left: '10%',
        background: 'hsl(142,50%,35%)',
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(40deg)',
        opacity: 0.18,
        animationDelay: '1.8s',
      }}
    />
    <div
      className="absolute w-4 h-6 pepperoni-float"
      style={{
        top: '55%',
        right: '12%',
        background: 'hsl(142,50%,30%)',
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-25deg)',
        opacity: 0.14,
        animationDelay: '3.2s',
      }}
    />
    <div
      className="absolute w-2.5 h-4 pepperoni-float"
      style={{
        bottom: '15%',
        left: '15%',
        background: 'hsl(142,50%,38%)',
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(60deg)',
        opacity: 0.16,
        animationDelay: '0.4s',
      }}
    />

    {/* ── Cheese strands (thin golden lines) ── */}
    <div
      className="absolute w-px bg-gradient-to-b from-amber-400/25 via-amber-500/15 to-transparent"
      style={{ top: '20%', right: '16%', height: 80 }}
    />
    <div
      className="absolute w-px bg-gradient-to-b from-amber-400/20 via-amber-500/10 to-transparent"
      style={{ top: '50%', left: '7%', height: 60 }}
    />
    <div
      className="absolute w-px bg-gradient-to-b from-amber-400/18 to-transparent"
      style={{ top: '70%', right: '25%', height: 50 }}
    />

    {/* ── Steam wisps ── */}
    <div
      className="absolute w-8 h-8 rounded-full steam-particle"
      style={{
        bottom: '60%',
        left: '48%',
        background: 'radial-gradient(circle, hsl(38,20%,80%,0.08), transparent)',
        animationDelay: '0s',
      }}
    />
    <div
      className="absolute w-6 h-6 rounded-full steam-particle"
      style={{
        bottom: '58%',
        left: '52%',
        background: 'radial-gradient(circle, hsl(38,20%,80%,0.06), transparent)',
        animationDelay: '0.8s',
      }}
    />
  </div>
)

export default PizzaDecorations
