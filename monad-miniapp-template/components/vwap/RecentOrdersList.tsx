'use client'

import Link from 'next/link'
import { useRecentOrders } from '@/src/hooks/useVWAPDemoReads'

function shortAddr(addr: string): string {
  if (!addr || addr.length < 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function shortOrderId(id: string): string {
  if (!id || id.length < 14) return id
  return `${id.slice(0, 10)}…${id.slice(-8)}`
}

export function RecentOrdersList() {
  const { orders, isLoading, error, refetch } = useRecentOrders()

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Recent orders</h2>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          {isLoading ? '…' : 'Refresh'}
        </button>
      </div>
      <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
        Last 10 OrderCreated events (no DB). Open an order to execute slices.
      </p>
      {error && (
        <p className="mb-2 rounded-lg bg-red-50 px-2 py-1.5 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
          {error.message}
        </p>
      )}
      {isLoading && orders.length === 0 ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-neutral-500">No recent orders in the last ~1k blocks.</p>
      ) : (
        <ul className="space-y-1.5">
          {orders.map((row) => (
            <li
              key={row.orderId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-100 bg-neutral-50/50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-800/50"
            >
              <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                {shortOrderId(row.orderId)} · {shortAddr(row.creator)} · {String(row.amount)}
              </span>
              <Link
                href={`/order/${encodeURIComponent(row.orderId)}`}
                className="rounded bg-neutral-900 px-2 py-1 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
