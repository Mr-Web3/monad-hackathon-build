"use client"

import { useCallback, useEffect, useState } from "react"
import { useReadContract } from "wagmi"
import { keccak256, encodePacked, padHex, type Hex } from "viem"
import {
  VWAP_DEMO_ADDRESS,
  VWAP_DEMO_ABI,
  toOrder,
  type Order,
} from "@/src/contracts/vwapDemo"

const MONAD_TESTNET_CHAIN_ID = 10143

/**
 * Parse a hex string to a bytes32 value (32 bytes = 64 hex chars).
 * Left-pads with zeros if shorter; truncates to 32 bytes if longer.
 */
export function parseOrderId(value: string | undefined | null): `0x${string}` | null {
  if (value == null || value === "") return null
  let hex = (value.startsWith("0x") ? value : `0x${value}`) as Hex
  if (hex.length > 66) hex = `0x${hex.slice(2, 66)}` as Hex
  if (hex.length < 66) hex = padHex(hex, { size: 32, dir: "left" })
  return hex
}

/**
 * Compute sliceId = keccak256(encodePacked(orderId, sliceIndex)) for sliceSizes lookup.
 */
export function getSliceId(orderId: `0x${string}`, sliceIndex: number): `0x${string}` {
  return keccak256(encodePacked(["bytes32", "uint8"], [orderId, sliceIndex]))
}

/**
 * Read a single order by orderId. Returns parsed Order and loading/error state.
 */
export function useOrder(orderId: string | `0x${string}` | undefined | null): {
  order: Order | undefined
  raw: readonly [string, bigint, number, number, bigint, boolean] | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
} {
  const parsed = parseOrderId(orderId ?? undefined)
  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: VWAP_DEMO_ADDRESS as `0x${string}`,
    abi: VWAP_DEMO_ABI,
    functionName: "getOrder",
    args: parsed ? [parsed] : undefined,
    chainId: MONAD_TESTNET_CHAIN_ID,
    query: {
      enabled: parsed != null,
      refetchInterval: parsed != null ? 2000 : false,
    },
  })

  const raw = data as readonly [string, bigint, number | bigint, number | bigint, bigint, boolean] | undefined
  const order = raw != null ? toOrder(raw) : undefined

  return {
    order,
    raw: raw as readonly [string, bigint, number, number, bigint, boolean] | undefined,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  }
}

/** One row for "recent orders" list (from OrderCreated events). */
export type RecentOrderRow = {
  orderId: `0x${string}`
  creator: string
  amount: bigint
}

const RECENT_ORDERS_LIMIT = 10
/** Many RPCs (e.g. Alchemy) limit eth_getLogs to 1000 blocks. Use 999 so fromBlock..toBlock (inclusive) = 1000 blocks. */
const RECENT_ORDERS_BLOCK_RANGE = 999

/**
 * Fetch recent OrderCreated events via getLogs (no DB). Returns last N orderIds with creator and amount.
 */
export function useRecentOrders(): {
  orders: RecentOrderRow[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
} {
  const [orders, setOrders] = useState<RecentOrderRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLogs = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const { getPublicClient } = await import("@/lib/publicClient")
      const client = getPublicClient()
      const blockNumber = await client.getBlockNumber()
      const fromBlock = blockNumber - BigInt(RECENT_ORDERS_BLOCK_RANGE)
      // Use numeric toBlock so range is exactly ≤1000 (Alchemy eth_getLogs limit)
      const toBlock = blockNumber
      const logs = await client.getContractEvents({
        address: VWAP_DEMO_ADDRESS as `0x${string}`,
        abi: VWAP_DEMO_ABI,
        eventName: "OrderCreated",
        fromBlock: fromBlock < BigInt(0) ? BigInt(0) : fromBlock,
        toBlock,
      })
      type OrderCreatedArgs = { orderId: `0x${string}`; creator?: string; amount?: bigint }
      const rows: RecentOrderRow[] = logs
        .map((e) => e.args as OrderCreatedArgs)
        .filter((args): args is OrderCreatedArgs & { orderId: `0x${string}` } => !!args?.orderId)
        .map((args) => ({
          orderId: args.orderId,
          creator: args.creator ?? "",
          amount: args.amount ?? BigInt(0),
        }))
      setOrders(rows.slice(-RECENT_ORDERS_LIMIT).reverse())
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return { orders, isLoading, error: error ?? null, refetch: fetchLogs }
}

/**
 * Read whether a slice has been executed. orderId can be hex string or bytes32.
 */
export function useSliceExecuted(
  orderId: string | `0x${string}` | undefined | null,
  sliceIndex: number | undefined
): {
  executed: boolean | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
} {
  const parsed = parseOrderId(orderId ?? undefined)
  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: VWAP_DEMO_ADDRESS as `0x${string}`,
    abi: VWAP_DEMO_ABI,
    functionName: "isSliceExecuted",
    args:
      parsed != null && sliceIndex !== undefined
        ? [parsed, sliceIndex]
        : undefined,
    chainId: MONAD_TESTNET_CHAIN_ID,
    query: {
      enabled: parsed != null && sliceIndex !== undefined,
    },
  })

  return {
    executed: data as boolean | undefined,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  }
}

/**
 * Read the executed-slices bitmask for an order (bit i = 1 means slice i executed).
 * Use to compute first unexecuted slice without N separate hooks.
 */
export function useExecutedMask(
  orderId: string | `0x${string}` | undefined | null
): {
  mask: bigint | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
  firstUnexecutedIndex: (numSlices: number) => number | null
} {
  const parsed = parseOrderId(orderId ?? undefined)
  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: VWAP_DEMO_ADDRESS as `0x${string}`,
    abi: VWAP_DEMO_ABI,
    functionName: "getExecutedMask",
    args: parsed ? [parsed] : undefined,
    chainId: MONAD_TESTNET_CHAIN_ID,
    query: {
      enabled: parsed != null,
      refetchInterval: parsed != null ? 2000 : false,
    },
  })

  const mask = data as bigint | undefined

  const firstUnexecutedIndex = useCallback(
    (numSlices: number): number | null => {
      if (mask == null || numSlices <= 0) return null
      for (let i = 0; i < numSlices; i++) {
        if ((mask & (BigInt(1) << BigInt(i))) === BigInt(0)) return i
      }
      return null
    },
    [mask]
  )

  return {
    mask,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
    firstUnexecutedIndex,
  }
}

/**
 * Read the precomputed slice size (amount) for (orderId, sliceIndex).
 * Uses sliceId = keccak256(encodePacked(orderId, sliceIndex)) and calls sliceSizes(sliceId).
 */
export function useSliceSize(
  orderId: string | `0x${string}` | undefined | null,
  sliceIndex: number | undefined
): {
  amount: bigint | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
} {
  const parsed = parseOrderId(orderId ?? undefined)
  const sliceId =
    parsed != null && sliceIndex !== undefined ? getSliceId(parsed, sliceIndex) : undefined

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: VWAP_DEMO_ADDRESS as `0x${string}`,
    abi: VWAP_DEMO_ABI,
    functionName: "sliceSizes",
    args: sliceId != null ? [sliceId] : undefined,
    chainId: MONAD_TESTNET_CHAIN_ID,
    query: {
      enabled: sliceId != null,
    },
  })

  return {
    amount: data as bigint | undefined,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  }
}
