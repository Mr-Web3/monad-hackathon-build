'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from '@/components/ui/slider'
import { useAccount } from 'wagmi'
import { AppKitButton } from '@reown/appkit/react'
import SliceEffect from './SliceEffect'
import CheeseDrips from './CheeseDrips'

interface TradeConfigProps {
  onBake: (tradeSize: number, sliceCount: number) => void
}

const TradeConfig: React.FC<TradeConfigProps> = ({ onBake }) => {
  const [tradeSize, setTradeSize] = useState(1000)
  const [sliceCount, setSliceCount] = useState(5)
  const [slicing, setSlicing] = useState(false)
  const { address, isConnected } = useAccount()

  const priceImpact = {
    single: (tradeSize / 10000) * 2.5,
    sliced: ((tradeSize / 10000) * 2.5) / Math.sqrt(sliceCount),
    reduction: 0,
  }
  priceImpact.reduction =
    ((priceImpact.single - priceImpact.sliced) / priceImpact.single) * 100

  const handleBake = () => {
    setSlicing(true)
    setTimeout(() => {
      setSlicing(false)
      onBake(tradeSize, sliceCount)
    }, 500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-lg mx-auto"
    >
      {!isConnected ? (
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="oven-breathe rounded-xl p-[2px]">
              <AppKitButton label="Connect Wallet" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-3 font-body">
            Start slicing your trades.
          </p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Start Slicing</h2>
            <p className="text-muted-foreground font-body mt-2 max-w-md mx-auto">
              Configure your trade, choose your slices, and execute with Monad&apos;s parallel speed.
            </p>
          </div>

          {/* Main config card — cheese-themed */}
          <div className="relative cheese-card bg-card rounded-2xl p-6 space-y-6 overflow-hidden">
            {/* Slice effect overlay */}
            <SliceEffect active={slicing} />

            {/* Subtle cheese drips on this card */}
            <CheeseDrips variant="mozzarella" />

            {/* Trade pair indicator */}
            <div className="flex items-center justify-between bg-muted rounded-xl p-4 relative">
              {/* Oven glow behind */}
              <div
                className="absolute inset-0 rounded-xl opacity-30"
                style={{
                  background:
                    'radial-gradient(ellipse at center, hsl(24,90%,55%,0.15), transparent 70%)',
                }}
              />
              <div className="text-left relative">
                <span className="text-sm text-muted-foreground">Selling</span>
                <div className="font-display font-bold text-xl text-foreground">MON</div>
              </div>
              {/* Animated slicer arrow */}
              <div className="relative">
                <motion.div
                  className="text-2xl text-secondary"
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  &rarr;
                </motion.div>
              </div>
              <div className="text-right relative">
                <span className="text-sm text-muted-foreground">Buying</span>
                <div className="font-display font-bold text-xl text-foreground">USDC</div>
              </div>
            </div>

            {/* Trade size slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Trade Size</label>
                <span className="text-sm font-display font-bold text-secondary">
                  ${tradeSize.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[tradeSize]}
                onValueChange={([v]) => setTradeSize(v)}
                min={100}
                max={50000}
                step={100}
                className="[&_[role=slider]]:bg-secondary [&_[role=slider]]:border-secondary [&_.bg-primary]:bg-secondary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$100</span>
                <span>$50,000</span>
              </div>
            </div>

            {/* Slice count — pepperoni-style buttons */}
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-sm font-medium text-foreground">Number of Slices</label>
                <span className="text-sm font-display font-bold text-primary">
                  {sliceCount} slices
                </span>
              </div>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6, 8].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSliceCount(n)}
                    className={`flex-1 py-2.5 rounded-full text-sm font-display font-semibold transition-all duration-200 ${
                      sliceCount === n
                        ? 'bg-primary text-primary-foreground oven-breathe'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                    style={
                      sliceCount === n
                        ? undefined
                        : {
                            background:
                              'radial-gradient(circle at 40% 40%, hsl(20,12%,22%), hsl(20,8%,18%))',
                          }
                    }
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Price impact comparison */}
            <div className="bg-muted rounded-xl p-4 relative">
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background:
                    'linear-gradient(135deg, hsl(24,90%,55%,0.04), transparent 50%, hsl(142,50%,45%,0.04))',
                }}
              />
              <div className="relative">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Estimated Price Impact</span>
                  <span className="text-sm font-display font-bold text-pizza-basil">
                    -{priceImpact.reduction.toFixed(0)}% reduction
                  </span>
                </div>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">Without slicing</div>
                    <div className="h-3 rounded-full bg-primary/20 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        animate={{ width: `${Math.min(priceImpact.single * 20, 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="text-xs text-primary mt-1">
                      {priceImpact.single.toFixed(2)}%
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">
                      With {sliceCount} slices
                    </div>
                    <div className="h-3 rounded-full bg-pizza-basil/20 overflow-hidden">
                      <motion.div
                        className="h-full bg-pizza-basil rounded-full"
                        animate={{ width: `${Math.min(priceImpact.sliced * 20, 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="text-xs text-pizza-basil mt-1">
                      {priceImpact.sliced.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BAKE PIZZA button — full oven glow treatment */}
          <div className="relative">
            {/* Oven glow backdrop */}
            <div
              className="absolute -inset-4 rounded-2xl oven-breathe opacity-60"
              style={{ zIndex: 0 }}
            />
            <motion.button
              onClick={handleBake}
              className="relative z-10 w-full py-4 bg-primary text-primary-foreground rounded-xl font-display font-bold text-lg overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                boxShadow:
                  '0 0 30px 8px hsl(24 90% 55% / 0.3), 0 0 60px 15px hsl(8 78% 52% / 0.15), inset 0 1px 0 hsl(45 80% 75% / 0.2)',
              }}
            >
              {/* Heat shimmer over button */}
              <div className="absolute inset-0 heat-shimmer opacity-20 bg-gradient-to-t from-transparent via-white/10 to-transparent pointer-events-none" />

              <AnimatePresence mode="wait">
                {slicing ? (
                  <motion.span
                    key="slicing"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="relative z-10"
                  >
                    Slicing...
                  </motion.span>
                ) : (
                  <motion.span
                    key="bake"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10"
                  >
                    Bake Pizza
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default TradeConfig
