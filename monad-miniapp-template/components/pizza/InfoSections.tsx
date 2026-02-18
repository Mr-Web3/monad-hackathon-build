'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const InfoSections: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="max-w-2xl mx-auto mt-12"
    >
      <Tabs defaultValue="how" className="w-full">
        <TabsList className="w-full bg-card cheese-card">
          <TabsTrigger
            value="how"
            className="flex-1 font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            How Slicing Works
          </TabsTrigger>
          <TabsTrigger
            value="monad"
            className="flex-1 font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Why Monad
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex-1 font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="how" className="mt-4">
          <div className="bg-card cheese-card rounded-2xl p-6">
            <h3 className="font-display text-xl font-bold text-foreground mb-4">
              VWAP-Style Trade Slicing
            </h3>
            <div className="space-y-4 font-body text-foreground/80">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-xl">
                  P
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-1">
                    Large trades move markets
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    A single large order pushes the price against you, increasing slippage and
                    reducing execution quality.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 text-xl">
                  S
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-1">
                    Slicing reduces impact
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    By splitting into smaller slices, each piece has minimal market impact. This is
                    the VWAP (Volume Weighted Average Price) strategy.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-pizza-ember/10 flex items-center justify-center shrink-0 text-xl">
                  M
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-1">
                    Parallel = faster execution
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Monad&apos;s parallel execution lets multiple slices execute in the same block,
                    giving you speed without sacrificing quality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monad" className="mt-4">
          <div className="bg-card cheese-card rounded-2xl p-6">
            <h3 className="font-display text-xl font-bold text-foreground mb-4">Why Monad?</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: 'P',
                  title: 'Parallel Execution',
                  desc: 'Execute multiple transactions simultaneously in the same block',
                },
                {
                  icon: 'F',
                  title: 'Near-Instant Finality',
                  desc: 'Sub-second finality for lightning-fast trade confirmations',
                },
                {
                  icon: 'L',
                  title: 'Low Fees',
                  desc: 'Minimal gas costs make slicing economically viable at any size',
                },
                {
                  icon: 'H',
                  title: 'High-Frequency Ready',
                  desc: 'Built from the ground up for high-throughput trading applications',
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  className="bg-muted rounded-xl p-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-2xl mb-2 font-display font-bold text-primary">
                    {item.icon}
                  </div>
                  <h4 className="font-display font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="bg-card cheese-card rounded-2xl p-6">
            <h3 className="font-display text-xl font-bold text-foreground mb-4">
              Execution Analytics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-2xl font-display font-bold text-primary">~65%</div>
                <div className="text-xs text-muted-foreground mt-1">Avg Impact Reduction</div>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-2xl font-display font-bold text-secondary">3x</div>
                <div className="text-xs text-muted-foreground mt-1">Faster with Parallel</div>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-2xl font-display font-bold text-pizza-basil">$0.01</div>
                <div className="text-xs text-muted-foreground mt-1">Avg Gas per Slice</div>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-2xl font-display font-bold text-pizza-ember">400ms</div>
                <div className="text-xs text-muted-foreground mt-1">Avg Finality</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4 italic font-body">
              * Simulated data for demonstration purposes
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

export default InfoSections
