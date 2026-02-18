'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeroSection,
  TradeConfig,
  InfoSections,
  EmberParticles,
  PizzaDecorations,
} from '@/components/pizza'
import { Header } from '@/components/layout/header'

export function HomePage() {
  const [showTrade, setShowTrade] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)
  const tradeRef = useRef<HTMLDivElement>(null)

  const handleStartTrading = useCallback(() => {
    setShowTrade(true)
  }, [])

  // Once trade section renders, scroll to it
  useEffect(() => {
    if (showTrade && tradeRef.current) {
      // Small delay to let AnimatePresence mount the element
      const t = setTimeout(() => {
        tradeRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return () => clearTimeout(t)
    }
  }, [showTrade])

  return (
    <div className="bg-black">
      {/* Fixed navigation — becomes pizza shelf after hero */}
      <Header />

      {/* Scroll-driven hero (300vh → sticky 100vh viewport) */}
      <HeroSection />

      {/* ═══════════════════════════════════════════
          INFO SECTION — scroll stops here until button is clicked
          ═══════════════════════════════════════════ */}
      <div
        ref={infoRef}
        className="relative bg-black min-h-screen flex flex-col items-center justify-center px-6 py-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full max-w-2xl"
        >
          <InfoSections />
        </motion.div>

        {/* Trade CTA button — unlocks the trade page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <button
            type="button"
            onClick={handleStartTrading}
            className={`relative px-12 py-4 rounded-2xl font-display font-bold text-lg text-white tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 ${
              showTrade ? 'opacity-50 pointer-events-none' : ''
            }`}
            style={{
              background: 'linear-gradient(135deg, hsl(8,78%,52%) 0%, hsl(24,90%,50%) 100%)',
              boxShadow:
                '0 0 20px hsl(24,90%,55%,0.3), 0 0 40px hsl(8,78%,52%,0.15), 0 4px 16px rgba(0,0,0,0.3)',
            }}
          >
            Start Trading
          </button>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════
          TRADE PAGE — only appears after button click
          ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {showTrade && (
          <motion.div
            ref={tradeRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative bg-background min-h-screen overflow-hidden"
          >
            {/* Gradient bridge from black → warm app background */}
            <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-black via-black/60 to-transparent pointer-events-none z-0" />

            {/* Ambient pizza decorations */}
            <PizzaDecorations />

            {/* Ember particles */}
            <EmberParticles count={10} />

            {/* Oven glow ambience on the sides */}
            <div
              className="absolute top-[30%] left-0 w-40 h-80 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at left, hsl(24,90%,55%,0.06), transparent 70%)',
              }}
            />
            <div
              className="absolute top-[50%] right-0 w-40 h-80 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at right, hsl(8,78%,52%,0.05), transparent 70%)',
              }}
            />

            <main className="relative z-10 max-w-2xl mx-auto px-6 pt-28 pb-16">
              {/* Trade configuration */}
              <motion.div
                id="trade"
                className="scroll-mt-24"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <TradeConfig onBake={() => {}} />
              </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 text-center py-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground font-body">
                Built for the Monad ecosystem
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
