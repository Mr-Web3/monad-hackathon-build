'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getWriteErrorMessage } from '@/src/hooks/useVWAPDemoWrites'

interface OrderCreateCardProps {
  createOrder: (totalAmount: number | bigint, numSlices: number) => void
  isPending?: boolean
  isConfirming?: boolean
  orderIdFromReceipt?: `0x${string}` | null
  txHash?: `0x${string}` | null
  error?: Error | null
  onReset?: () => void
}

export function OrderCreateCard({
  createOrder,
  isPending,
  isConfirming,
  orderIdFromReceipt,
  txHash,
  error,
  onReset,
}: OrderCreateCardProps) {
  const [totalAmount, setTotalAmount] = useState('1000')
  const [numSlices, setNumSlices] = useState('12')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(totalAmount, 10)
    const slices = Math.min(20, Math.max(1, parseInt(numSlices, 10) || 1))
    if (amount > 0) createOrder(amount, slices)
  }

  const busy = isPending || isConfirming
  const success = !!orderIdFromReceipt

  const handleCopyOrderId = async () => {
    if (!orderIdFromReceipt) return
    await navigator.clipboard.writeText(orderIdFromReceipt)
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Create order</h2>

      {success ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">Order created</p>
          <div className="break-all rounded-lg bg-neutral-100 px-3 py-2 font-mono text-sm text-neutral-900 dark:bg-neutral-800 dark:text-white">
            {orderIdFromReceipt}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              Copy ID
            </button>
            <Link
              href={`/order/${encodeURIComponent(orderIdFromReceipt)}`}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Open order →
            </Link>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                Create another
              </button>
            )}
          </div>
          {txHash && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Tx:{' '}
              <span className="font-mono">
                {txHash.slice(0, 10)}…{txHash.slice(-8)}
              </span>
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="totalAmount"
              className="mb-1 block text-sm font-medium text-neutral-600 dark:text-neutral-400"
            >
              Total amount
            </label>
            <input
              id="totalAmount"
              type="number"
              min={1}
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
            />
          </div>
          <div>
            <label
              htmlFor="numSlices"
              className="mb-1 block text-sm font-medium text-neutral-600 dark:text-neutral-400"
            >
              Slices (1–20)
            </label>
            <input
              id="numSlices"
              type="number"
              min={1}
              max={20}
              value={numSlices}
              onChange={(e) => setNumSlices(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
              {getWriteErrorMessage(error)}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isPending ? 'Confirm in wallet…' : isConfirming ? 'Confirming…' : 'Create order'}
          </button>
        </form>
      )}
    </section>
  )
}
