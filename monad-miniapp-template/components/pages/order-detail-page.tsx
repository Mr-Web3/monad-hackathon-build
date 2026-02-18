'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProgressBar } from '@/components/vwap'
import { ContractLiveFeed } from '@/src/components/LiveFeed'
import { NetworkHelpers } from '@/src/components/NetworkHelpers'
import {
  useOrder,
  useSliceExecuted,
  useSliceSize,
  useExecutedMask,
} from '@/src/hooks/useVWAPDemoReads'
import { useExecuteSlice, getWriteErrorMessage } from '@/src/hooks/useVWAPDemoWrites'

interface OrderDetailPageProps {
  orderId: string
}

function safeSliceCount(n: number | bigint | undefined | null): number {
  const v = Number(n)
  return Number.isFinite(v) && v >= 0 ? v : 0
}

function SliceCell({
  orderId,
  index,
  orderActive,
  onExecute,
  isExecutingIndex,
}: {
  orderId: string
  index: number
  orderActive: boolean
  onExecute: (index: number) => void
  isExecutingIndex: number | null
}) {
  const { executed, isLoading: loadingExecuted } = useSliceExecuted(orderId, index)
  const { amount, isLoading: loadingAmount } = useSliceSize(orderId, index)
  const canExecute = orderActive && executed === false && !loadingExecuted
  const busy = isExecutingIndex === index

  return (
    <div
      className={`rounded-lg border border-border p-3 text-center ${
        executed
          ? 'bg-primary/10 border-primary/30'
          : 'bg-card'
      }`}
    >
      <div className="text-xs font-medium text-muted-foreground">
        Slice {index + 1}
      </div>
      <div className="mt-0.5 font-mono text-sm text-foreground">
        {loadingAmount ? '…' : amount != null ? String(amount) : '—'}
        {!loadingAmount && amount !== undefined && amount === BigInt(0) && (
          <span className="ml-1 text-xs text-amber-500" title="sliceId may not match contract">(sliceId calc mismatch?)</span>
        )}
      </div>
      {executed ? (
        <span className="mt-2 inline-block text-xs font-medium text-primary">
          Done
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onExecute(index)}
          disabled={!canExecute || busy}
          className="mt-2 w-full rounded bg-primary py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {busy ? 'Executing…' : 'Execute'}
        </button>
      )}
    </div>
  )
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const [executingIndex, setExecutingIndex] = useState<number | null>(null)
  const [executeAllRemaining, setExecuteAllRemaining] = useState(false)

  const { order, isLoading: orderLoading, isError: orderError, refetch: refetchOrder } = useOrder(orderId)
  const { executeSlice, isPending: writePending, isConfirming: writeConfirming, isSuccess: writeSuccess, error: writeError, reset: resetWrite, txHash: lastTxHash } = useExecuteSlice()

  const numSlices = order != null ? safeSliceCount(order.numSlices) : 0
  const { firstUnexecutedIndex, refetch: refetchMask } = useExecutedMask(orderId)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleExecute = (sliceIndex: number) => {
    setExecutingIndex(sliceIndex)
    resetWrite()
    executeSlice(orderId, sliceIndex)
  }

  useEffect(() => {
    if (!writeSuccess || executingIndex === null) return
    setExecutingIndex(null)
    void refetchOrder()
    void refetchMask()
    if (executeAllRemaining && order?.active) {
      Promise.all([refetchOrder(), refetchMask()]).then(() => setRefreshKey((k) => k + 1))
    }
  }, [writeSuccess, executingIndex, refetchOrder, refetchMask, executeAllRemaining, order?.active])

  useEffect(() => {
    if (refreshKey === 0 || !executeAllRemaining || !order?.active) return
    const next = firstUnexecutedIndex(numSlices)
    if (next != null) {
      handleExecute(next)
    } else {
      setExecuteAllRemaining(false)
    }
    setRefreshKey(0)
  }, [refreshKey, executeAllRemaining, order?.active, numSlices, firstUnexecutedIndex])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              ← Back
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-foreground sm:text-3xl font-display">
            Order detail
          </h1>
          <p className="break-all font-mono text-sm text-muted-foreground">
            {orderId}
          </p>

          <NetworkHelpers latestTxHash={lastTxHash} className="mb-4" />

          {orderError && (
            <p className="rounded-lg bg-destructive/15 border border-border p-3 text-sm text-destructive">
              Failed to load order. Check the order ID and network (Monad Testnet).
            </p>
          )}

          {writeError && (
            <p className="rounded-lg bg-destructive/15 border border-border p-3 text-sm text-destructive">
              {getWriteErrorMessage(writeError)}
            </p>
          )}

          {orderLoading ? (
            <p className="text-muted-foreground">Loading order…</p>
          ) : order ? (
            <>
              <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Creator
                  </span>
                  <p className="break-all font-mono text-sm text-card-foreground">
                    {order.creator}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Total amount
                  </span>
                  <p className="font-mono text-sm text-card-foreground">
                    {String(order.totalAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Slices
                  </span>
                  <p className="font-mono text-sm text-card-foreground">
                    {safeSliceCount(order.numSlices)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Executed
                  </span>
                  <p className="font-mono text-sm text-card-foreground">
                    {safeSliceCount(order.executedSlices)} / {safeSliceCount(order.numSlices)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Active
                  </span>
                  <p className="text-sm text-card-foreground">
                    {order.active ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Start time
                  </span>
                  <p className="font-mono text-sm text-card-foreground">
                    {order.startTime != null ? String(order.startTime) : '—'}
                  </p>
                </div>
              </div>

              <ProgressBar
                value={safeSliceCount(order.executedSlices)}
                max={numSlices}
                label="Slices executed"
              />

              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: numSlices }, (_, i) => (
                  <SliceCell
                    key={i}
                    orderId={orderId}
                    index={i}
                    orderActive={order.active}
                    onExecute={handleExecute}
                    isExecutingIndex={executingIndex}
                  />
                ))}
              </div>

              {order.active && (() => {
            const next = firstUnexecutedIndex(numSlices)
            const busy = writePending || writeConfirming || executingIndex !== null
                return (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => { if (next != null) handleExecute(next) }}
                      disabled={busy || next == null}
                      className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 transition-colors"
                    >
                      {next == null ? 'All slices executed' : busy ? 'Executing…' : `Execute next (slice ${next + 1})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (next == null) return
                        setExecuteAllRemaining(true)
                        handleExecute(next)
                      }}
                      disabled={busy || next == null}
                      className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 transition-colors"
                    >
                      Execute all remaining
                    </button>
                  </div>
                )
              })()}
            </>
          ) : null}

          <ContractLiveFeed filterOrderId={orderId} maxHeight="10rem" />
        </div>
      </div>
    </div>
  )
}
