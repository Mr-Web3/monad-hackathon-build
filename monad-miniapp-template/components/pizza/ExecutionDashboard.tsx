'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PizzaSVG from './PizzaSVG'

interface ExecutionDashboardProps {
  tradeSize: number
  sliceCount: number
  onComplete: () => void
}

interface LogEntry {
  id: number
  message: string
  type: 'sequential' | 'parallel' | 'info'
}

const ExecutionDashboard: React.FC<ExecutionDashboardProps> = ({
  tradeSize,
  sliceCount,
  onComplete,
}) => {
  const [executedSlices, setExecutedSlices] = useState<number[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [ovenGlow, setOvenGlow] = useState(false)

  const remaining = sliceCount - executedSlices.length
  const sliceValue = tradeSize / sliceCount
  const priceImpactReduction =
    executedSlices.length > 0 ? ((executedSlices.length / sliceCount) * 65).toFixed(1) : '0.0'

  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), message, type }])
  }, [])

  const getNextSlice = useCallback(() => {
    for (let i = 0; i < sliceCount; i++) {
      if (!executedSlices.includes(i)) return i
    }
    return -1
  }, [executedSlices, sliceCount])

  const eatSlice = useCallback(() => {
    const next = getNextSlice()
    if (next === -1 || isExecuting) return

    setIsExecuting(true)
    addLog(`Executing slice ${next + 1}... ($${sliceValue.toFixed(0)})`, 'sequential')

    setTimeout(() => {
      const newExecuted = [...executedSlices, next]
      setExecutedSlices(newExecuted)
      addLog(
        `Slice ${next + 1} filled at $${(0.98 + Math.random() * 0.03).toFixed(4)}`,
        'sequential'
      )
      setIsExecuting(false)

      if (newExecuted.length >= sliceCount) {
        setTimeout(onComplete, 800)
      }
    }, 600)
  }, [executedSlices, getNextSlice, isExecuting, sliceCount, sliceValue, addLog, onComplete])

  const eatParallel = useCallback(() => {
    if (isExecuting) return

    const available: number[] = []
    for (let i = 0; i < sliceCount && available.length < 3; i++) {
      if (!executedSlices.includes(i)) available.push(i)
    }
    if (available.length === 0) return

    setIsExecuting(true)
    setOvenGlow(true)
    addLog(`Parallel execution: ${available.length} slices in same block...`, 'parallel')

    setTimeout(() => {
      const newExecuted = [...executedSlices, ...available]
      setExecutedSlices(newExecuted)
      addLog(`${available.length} slices delivered fresh in the same block`, 'parallel')
      setIsExecuting(false)
      setOvenGlow(false)

      if (newExecuted.length >= sliceCount) {
        setTimeout(onComplete, 800)
      }
    }, 400)
  }, [executedSlices, isExecuting, sliceCount, addLog, onComplete])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="font-display text-3xl font-bold text-foreground">Pizza Oven</h2>
        <p className="text-muted-foreground font-body mt-1">Execute your slices</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div
          className={`bg-card border border-border rounded-2xl p-6 flex flex-col items-center transition-shadow duration-500 ${ovenGlow ? 'oven-glow-intense' : ''}`}
        >
          <div className="relative">
            <PizzaSVG
              sliceCount={sliceCount}
              progress={0.4}
              executedSlices={executedSlices}
              size={250}
            />
            {ovenGlow && (
              <div className="absolute inset-0 bg-pizza-ember/10 rounded-full heat-shimmer" />
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 w-full text-center">
            <div>
              <div className="text-2xl font-display font-bold text-primary">{remaining}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-pizza-basil">
                {executedSlices.length}
              </div>
              <div className="text-xs text-muted-foreground">Executed</div>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-secondary">
                {priceImpactReduction}%
              </div>
              <div className="text-xs text-muted-foreground">Impact Reduction</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <motion.button
              onClick={eatSlice}
              disabled={remaining === 0 || isExecuting}
              className="flex-1 py-3 bg-card border border-border text-foreground rounded-xl font-display font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              whileHover={remaining > 0 ? { scale: 1.02 } : {}}
              whileTap={remaining > 0 ? { scale: 0.98 } : {}}
            >
              Eat Slice
            </motion.button>
            <motion.button
              onClick={eatParallel}
              disabled={remaining === 0 || isExecuting}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-display font-semibold disabled:opacity-40 disabled:cursor-not-allowed oven-glow"
              whileHover={remaining > 0 ? { scale: 1.02 } : {}}
              whileTap={remaining > 0 ? { scale: 0.98 } : {}}
            >
              Eat 3 at Once
            </motion.button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 h-64 overflow-y-auto">
            <div className="text-sm font-display font-semibold text-muted-foreground mb-2">
              Execution Feed
            </div>
            <AnimatePresence>
              {logs.length === 0 && (
                <p className="text-sm text-muted-foreground/50 font-body italic">
                  Waiting for execution...
                </p>
              )}
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-sm font-body py-1.5 border-b border-border/50 last:border-0 ${
                    log.type === 'parallel' ? 'text-pizza-ember font-medium' : 'text-foreground/80'
                  }`}
                >
                  {log.message}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Execution Progress</span>
              <span>{((executedSlices.length / sliceCount) * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-pizza-ember rounded-full"
                animate={{ width: `${(executedSlices.length / sliceCount) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ExecutionDashboard
