'use client'

import { useRef, useState, useCallback } from 'react'
import { useWatchContractEvent } from 'wagmi'
import { decodeEventLog, type Log } from 'viem'
import { VWAP_DEMO_ADDRESS, VWAP_DEMO_ABI } from '@/src/contracts/vwapDemo'

const MONAD_TESTNET_CHAIN_ID = 10143
const MAX_ENTRIES = 25

function shortAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function shortOrderId(orderId: string): string {
  if (!orderId || orderId.length < 14) return orderId
  return `${orderId.slice(0, 10)}…${orderId.slice(-8)}`
}

export type LiveFeedEntry =
  | {
      id: string
      type: 'OrderCreated'
      orderId: string
      orderIdShort: string
      creatorShort: string
      amount: string
      slices: number
      time: string
    }
  | {
      id: string
      type: 'SliceExecuted'
      orderId: string
      orderIdShort: string
      sliceIndex: number
      amount: string
      executorShort: string
      time: string
    }

interface ContractLiveFeedProps {
  /** When set, only show events for this orderId (e.g. on /order/[id] page). */
  filterOrderId?: string | null
  maxHeight?: string
  className?: string
}

export function ContractLiveFeed({
  filterOrderId,
  maxHeight = '12rem',
  className = '',
}: ContractLiveFeedProps) {
  const [entries, setEntries] = useState<LiveFeedEntry[]>([])
  const seenRef = useRef<Set<string>>(new Set())

  const addEntry = useCallback((entry: LiveFeedEntry) => {
    const key = entry.id
    if (seenRef.current.has(key)) return
    seenRef.current.add(key)
    setEntries((prev) => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES)
      if (next.length >= MAX_ENTRIES) {
        const dropped = prev[prev.length - 1]
        if (dropped && 'id' in dropped) seenRef.current.delete(dropped.id)
      }
      return next
    })
  }, [])

  const handleOrderCreated = useCallback(
    (logs: Log[]) => {
      for (const log of logs) {
        try {
          const decoded = decodeEventLog({
            abi: VWAP_DEMO_ABI,
            data: log.data,
            topics: log.topics,
          }) as {
            eventName: string
            args?: { orderId?: `0x${string}`; creator?: string; amount?: bigint; slices?: number }
          }
          if (decoded.eventName !== 'OrderCreated' || !decoded.args?.orderId) continue
          const { orderId, creator = '', amount = BigInt(0), slices = 0 } = decoded.args
          const orderIdStr = orderId
          if (
            filterOrderId != null &&
            filterOrderId !== '' &&
            normalizeOrderId(orderIdStr) !== normalizeOrderId(filterOrderId)
          )
            continue
          const id = `OrderCreated-${log.transactionHash}-${log.logIndex ?? 0}`
          addEntry({
            id,
            type: 'OrderCreated',
            orderId: orderIdStr,
            orderIdShort: shortOrderId(orderIdStr),
            creatorShort: shortAddress(creator),
            amount: String(amount),
            slices,
            time: new Date().toLocaleTimeString(),
          })
        } catch {
          // skip unparseable
        }
      }
    },
    [filterOrderId, addEntry]
  )

  const handleSliceExecuted = useCallback(
    (logs: Log[]) => {
      for (const log of logs) {
        try {
          const decoded = decodeEventLog({
            abi: VWAP_DEMO_ABI,
            data: log.data,
            topics: log.topics,
          }) as {
            eventName: string
            args?: {
              orderId?: `0x${string}`
              sliceIndex?: number
              amount?: bigint
              executor?: string
            }
          }
          if (decoded.eventName !== 'SliceExecuted' || !decoded.args?.orderId) continue
          const { orderId, sliceIndex = 0, amount = BigInt(0), executor = '' } = decoded.args
          const orderIdStr = orderId
          if (
            filterOrderId != null &&
            filterOrderId !== '' &&
            normalizeOrderId(orderIdStr) !== normalizeOrderId(filterOrderId)
          )
            continue
          const id = `SliceExecuted-${log.transactionHash}-${log.logIndex ?? 0}`
          addEntry({
            id,
            type: 'SliceExecuted',
            orderId: orderIdStr,
            orderIdShort: shortOrderId(orderIdStr),
            sliceIndex,
            amount: String(amount),
            executorShort: shortAddress(executor),
            time: new Date().toLocaleTimeString(),
          })
        } catch {
          // skip unparseable
        }
      }
    },
    [filterOrderId, addEntry]
  )

  useWatchContractEvent({
    address: VWAP_DEMO_ADDRESS as `0x${string}`,
    abi: VWAP_DEMO_ABI,
    eventName: 'OrderCreated',
    chainId: MONAD_TESTNET_CHAIN_ID,
    onLogs: handleOrderCreated,
  })

  useWatchContractEvent({
    address: VWAP_DEMO_ADDRESS as `0x${string}`,
    abi: VWAP_DEMO_ABI,
    eventName: 'SliceExecuted',
    chainId: MONAD_TESTNET_CHAIN_ID,
    onLogs: handleSliceExecuted,
  })

  return (
    <section
      className={`rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
    >
      <h2 className="border-b border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 dark:border-neutral-800 dark:text-neutral-300">
        Live feed
        {filterOrderId ? ' (this order)' : ''}
      </h2>
      <div
        className="overflow-y-auto p-2 font-mono text-xs text-neutral-600 dark:text-neutral-400"
        style={{ maxHeight }}
      >
        {entries.length === 0 ? (
          <p className="p-2 text-neutral-400">Watching for OrderCreated & SliceExecuted…</p>
        ) : (
          <ul className="space-y-1">
            {entries.map((ev) => (
              <li key={ev.id} className="rounded bg-neutral-50 px-2 py-1 dark:bg-neutral-800/50">
                <span className="text-neutral-400">{ev.time}</span>{' '}
                {ev.type === 'OrderCreated'
                  ? `OrderCreated ${ev.orderIdShort} by ${ev.creatorShort} amount=${ev.amount} slices=${ev.slices}`
                  : `SliceExecuted ${ev.orderIdShort} slice=${ev.sliceIndex} amount=${ev.amount} by ${ev.executorShort}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function normalizeOrderId(id: string): string {
  const h = id.startsWith('0x') ? id.slice(2).toLowerCase() : id.toLowerCase()
  return h.padStart(64, '0').slice(0, 64)
}
