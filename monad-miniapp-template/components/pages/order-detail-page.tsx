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
      className={`rounded-lg border p-3 text-center ${
        executed
          ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30'
          : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
      }`}
    >
      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Slice {index + 1}
      </div>
      <div className="mt-0.5 font-mono text-sm text-neutral-900 dark:text-white">
        {loadingAmount ? '…' : amount != null ? String(amount) : '—'}
      </div>
      {executed ? (
        <span className="mt-2 inline-block text-xs font-medium text-green-700 dark:text-green-400">
          Done
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onExecute(index)}
          disabled={!canExecute || busy}
          className="mt-2 w-full rounded bg-neutral-900 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
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

  const numSlices = order != null ? Number(order.numSlices) : 0
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
    const next = firstUnexecutedIndex(Number(order.numSlices))
    if (next != null) {
      handleExecute(next)
    } else {
      setExecuteAllRemaining(false)
    }
    setRefreshKey(0)
  }, [refreshKey, executeAllRemaining, order?.active, numSlices, firstUnexecutedIndex])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          ← Back
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
        Order detail
      </h1>
      <p className="break-all font-mono text-sm text-neutral-500 dark:text-neutral-400">
        {orderId}
      </p>

      <NetworkHelpers latestTxHash={lastTxHash} className="mb-4" />

      {orderError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
          Failed to load order. Check the order ID and network (Monad Testnet).
        </p>
      )}

      {writeError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
          {getWriteErrorMessage(writeError)}
        </p>
      )}

      {orderLoading ? (
        <p className="text-neutral-500">Loading order…</p>
      ) : order ? (
        <>
          <div className="grid gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-2">
            <div>
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Creator
              </span>
              <p className="break-all font-mono text-sm text-neutral-900 dark:text-white">
                {order.creator}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Total amount
              </span>
              <p className="font-mono text-sm text-neutral-900 dark:text-white">
                {String(order.totalAmount)}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Slices
              </span>
              <p className="font-mono text-sm text-neutral-900 dark:text-white">
                {order.numSlices}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Executed
              </span>
              <p className="font-mono text-sm text-neutral-900 dark:text-white">
                {order.executedSlices} / {order.numSlices}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Active
              </span>
              <p className="text-sm text-neutral-900 dark:text-white">
                {order.active ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Start time
              </span>
              <p className="font-mono text-sm text-neutral-900 dark:text-white">
                {order.startTime != null ? String(order.startTime) : '—'}
              </p>
            </div>
          </div>

          <ProgressBar
            value={Number(order.executedSlices)}
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
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
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
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
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
  )
}
