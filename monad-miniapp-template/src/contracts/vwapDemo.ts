/**
 * VWAPDemo contract — single source of truth: address + ABI from deployedContracts.
 */

import deployedContracts from "@/contracts/deployedContracts"

const MONAD_TESTNET_CHAIN_ID = 10143
const vwap = deployedContracts[MONAD_TESTNET_CHAIN_ID]?.VWAPDemo

const defaultAddress = vwap?.address ?? "0xBbf65AA24Ba6826A0872E3122bD74731e22b63f8"

/** Contract address (env override or from deployedContracts). */
export const VWAP_DEMO_ADDRESS =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_VWAP_DEMO_ADDRESS?.trim()) ||
  defaultAddress

/** Contract ABI from deployedContracts. */
export const VWAP_DEMO_ABI = vwap?.abi ?? []

/** Order struct returned by getOrder() / orders(). */
export type Order = {
  creator: `0x${string}`
  totalAmount: bigint
  numSlices: number
  executedSlices: number
  startTime: bigint
  active: boolean
}

/** Cast a raw getOrder/orders tuple to Order. numSlices/executedSlices may come as number or bigint from ABI. */
export function toOrder(raw: readonly [string, bigint, number | bigint, number | bigint, bigint, boolean]): Order {
  return {
    creator: raw[0] as `0x${string}`,
    totalAmount: raw[1],
    numSlices: Number(raw[2]),
    executedSlices: Number(raw[3]),
    startTime: raw[4],
    active: raw[5],
  }
}
