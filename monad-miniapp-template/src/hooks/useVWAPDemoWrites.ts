"use client"

import { useCallback, useEffect, useState } from "react"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { decodeEventLog, type Log } from "viem"
import { VWAP_DEMO_ADDRESS, VWAP_DEMO_ABI } from "@/src/contracts/vwapDemo"
import { parseOrderId } from "@/src/hooks/useVWAPDemoReads"

const MONAD_TESTNET_CHAIN_ID = 10143

const ORDER_CREATED_EVENT = "OrderCreated"

function getOrderIdFromReceipt(logs: Log[]): `0x${string}` | null {
  for (const log of logs) {
    try {
      const decoded = decodeEventLog({
        abi: VWAP_DEMO_ABI,
        data: log.data,
        topics: log.topics,
      }) as { eventName: string; args?: { orderId?: `0x${string}` } }
      if (decoded.eventName === ORDER_CREATED_EVENT && decoded.args?.orderId) {
        return decoded.args.orderId
      }
    } catch {
      continue
    }
  }
  return null
}

/** User-friendly message for known contract errors */
export function getWriteErrorMessage(error: unknown): string {
  if (!error) return "Transaction failed"
  const msg = error instanceof Error ? error.message : String(error)
  if (msg.includes("InvalidSlices") || msg.includes("InvalidSlice")) return "Invalid slice count or index."
  if (msg.includes("Max20Slices")) return "Maximum 20 slices allowed."
  if (msg.includes("OrderNotActive")) return "Order is no longer active."
  if (msg.includes("SliceAlreadyExecuted")) return "This slice was already executed."
  if (msg.includes("NotCreator")) return "Only the order creator can perform this action."
  if (msg.includes("User rejected") || msg.includes("user rejected")) return "Transaction was rejected."
  return msg.length > 80 ? `${msg.slice(0, 77)}…` : msg
}

export function useCreateOrder(): {
  createOrder: (totalAmount: bigint | number, numSlices: number) => void
  isPending: boolean
  isConfirming: boolean
  orderIdFromReceipt: `0x${string}` | null
  txHash: `0x${string}` | null
  error: Error | null
  reset: () => void
} {
  const [orderIdFromReceipt, setOrderIdFromReceipt] = useState<`0x${string}` | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract()

  const { data: receipt, isLoading: isConfirming, isSuccess: receiptSuccess } = useWaitForTransactionReceipt({
    hash: hash ?? undefined,
    query: { enabled: !!hash },
  })

  const createOrder = useCallback(
    (totalAmount: bigint | number, numSlices: number) => {
      const amount = typeof totalAmount === "bigint" ? totalAmount : BigInt(totalAmount)
      setOrderIdFromReceipt(null)
      setTxHash(null)
      writeContract({
        address: VWAP_DEMO_ADDRESS as `0x${string}`,
        abi: VWAP_DEMO_ABI,
        functionName: "createOrder",
        args: [amount, numSlices],
        chainId: MONAD_TESTNET_CHAIN_ID,
      })
    },
    [writeContract]
  )

  useEffect(() => {
    if (!hash) return
    setTxHash(hash)
  }, [hash])

  useEffect(() => {
    if (receipt?.logs && receiptSuccess) {
      const orderId = getOrderIdFromReceipt(receipt.logs as Log[])
      if (orderId) setOrderIdFromReceipt(orderId)
    }
  }, [receipt?.logs, receiptSuccess])

  const reset = useCallback(() => {
    setOrderIdFromReceipt(null)
    setTxHash(null)
    resetWrite()
  }, [resetWrite])

  return {
    createOrder,
    isPending,
    isConfirming,
    orderIdFromReceipt,
    txHash,
    error: writeError ?? null,
    reset,
  }
}

export function useExecuteSlice(): {
  executeSlice: (orderId: string | `0x${string}`, sliceIndex: number) => void
  isPending: boolean
  isConfirming: boolean
  txHash: `0x${string}` | null
  isSuccess: boolean
  error: Error | null
  reset: () => void
} {
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: hash ?? undefined,
    query: { enabled: !!hash },
  })

  const executeSlice = useCallback(
    (orderId: string | `0x${string}`, sliceIndex: number) => {
      const parsed = parseOrderId(orderId)
      if (!parsed) return
      setTxHash(null)
      writeContract({
        address: VWAP_DEMO_ADDRESS as `0x${string}`,
        abi: VWAP_DEMO_ABI,
        functionName: "executeSlice",
        args: [parsed, sliceIndex],
        chainId: MONAD_TESTNET_CHAIN_ID,
      })
    },
    [writeContract]
  )

  useEffect(() => {
    if (hash) setTxHash(hash)
  }, [hash])

  const reset = useCallback(() => {
    setTxHash(null)
    resetWrite()
  }, [resetWrite])

  return {
    executeSlice,
    isPending,
    isConfirming,
    txHash,
    isSuccess,
    error: writeError ?? null,
    reset,
  }
}
