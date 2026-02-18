'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeroSection,
  InfoSections,
  EmberParticles,
  PizzaDecorations,
  TradeConfig,
} from '@/components/pizza'
import { Header } from '@/components/layout/header'
import { OrderViewerCard, RecentOrdersList } from '@/components/vwap'
import { ContractLiveFeed } from '@/src/components/LiveFeed'
import { NetworkHelpers } from '@/src/components/NetworkHelpers'
import { useCreateOrder } from '@/src/hooks/useVWAPDemoWrites'

export function HomePage() {
  const [showTrade, setShowTrade] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)
  const tradeRef = useRef<HTMLDivElement>(null)

  const { createOrder, isPending, isConfirming, orderIdFromReceipt, txHash, error, reset } =
    useCreateOrder()

  const handleCreateOrder = useCallback(
    (totalAmount: number | bigint, numSlices: number) => {
      createOrder(totalAmount, numSlices)
    },
    [createOrder]
  )

  const handleStartTrading = useCallback(() => {
    setShowTrade(true)
  }, [])

  useEffect(() => {
    if (showTrade && tradeRef.current) {
      const t = setTimeout(() => {
        tradeRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return () => clearTimeout(t)
    }
  }, [showTrade])

  return (
    <div className="bg-black">
      <Header />
      <HeroSection />

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

      <AnimatePresence>
        {showTrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative bg-background min-h-screen overflow-hidden"
          >
            <div ref={tradeRef} className="absolute top-0 left-0 right-0 h-1" aria-hidden />
            <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-black via-black/60 to-transparent pointer-events-none z-0" />
            <PizzaDecorations />
            <EmberParticles count={10} />
            <div
              className="absolute top-[30%] left-0 w-40 h-80 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at left, hsl(24,90%,55%,0.06), transparent 70%)',
              }}
            />
            <div
              className="absolute top-[50%] right-0 w-40 h-80 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at right, hsl(8,78%,52%,0.05), transparent 70%)',
              }}
            />

            <main className="relative z-10 max-w-2xl mx-auto px-6 pt-28 pb-16 space-y-6">
              <NetworkHelpers latestTxHash={txHash} className="mt-2" />

              <TradeConfig
                createOrder={handleCreateOrder}
                isPending={isPending}
                isConfirming={isConfirming}
                orderIdFromReceipt={orderIdFromReceipt}
                txHash={txHash}
                error={error}
                onReset={reset}
              />

              <OrderViewerCard />

              <RecentOrdersList />
              <ContractLiveFeed maxHeight="14rem" />
            </main>

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
