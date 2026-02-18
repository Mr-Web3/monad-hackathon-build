'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CompletionStateProps {
  tradeSize: number
  sliceCount: number
  onReset: () => void
}

const CompletionState: React.FC<CompletionStateProps> = ({ tradeSize, sliceCount, onReset }) => {
  const [windowHeight, setWindowHeight] = useState(0)

  useEffect(() => {
    setWindowHeight(window.innerHeight)
  }, [])

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2 + Math.random() * 2,
        color: [
          'hsl(38 72% 55%)',
          'hsl(8 78% 52%)',
          'hsl(45 80% 75%)',
          'hsl(142 50% 45%)',
          'hsl(24 90% 55%)',
        ][Math.floor(Math.random() * 5)],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 360,
      })),
    []
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative max-w-lg mx-auto text-center"
    >
      {windowHeight > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiPieces.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-sm"
              style={{
                left: `${p.left}%`,
                top: '-20px',
                width: p.size,
                height: p.size * 0.6,
                backgroundColor: p.color,
                rotate: p.rotation,
              }}
              animate={{
                y: [0, windowHeight + 100],
                rotate: [p.rotation, p.rotation + 720],
                opacity: [1, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeIn',
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0.8, rotateX: 30 }}
        animate={{ scale: 1, rotateX: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="bg-card border border-border rounded-2xl p-10 mb-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="text-6xl mb-4"
        >
          Order Filled!
        </motion.div>
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">Order Filled!</h2>
        <p className="text-muted-foreground font-body mb-6">Order filled with minimal slippage.</p>

        <div className="grid grid-cols-3 gap-4 bg-muted rounded-xl p-4 mb-6">
          <div>
            <div className="text-lg font-display font-bold text-foreground">
              ${tradeSize.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Trade</div>
          </div>
          <div>
            <div className="text-lg font-display font-bold text-pizza-basil">{sliceCount}</div>
            <div className="text-xs text-muted-foreground">Slices</div>
          </div>
          <div>
            <div className="text-lg font-display font-bold text-secondary">~65%</div>
            <div className="text-xs text-muted-foreground">Impact Reduction</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-display font-semibold hover:bg-primary/90 transition-colors"
          >
            Bake Another
          </button>
          <button className="flex-1 py-3 bg-muted text-muted-foreground rounded-xl font-display font-semibold hover:bg-muted/80 transition-colors">
            View on Explorer
          </button>
        </div>
      </motion.div>

      <p className="text-sm text-muted-foreground font-body italic">
        Fresh execution straight from the oven.
      </p>
    </motion.div>
  )
}

export default CompletionState
