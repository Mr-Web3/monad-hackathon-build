/**
 * Public client for reading chain data (e.g. getLogs). Uses NEXT_PUBLIC_RPC_URL.
 */
import { createPublicClient, http } from 'viem'
import { monadTestnet } from 'viem/chains'
import { RPC_URL } from './chain'

const chain = { ...monadTestnet, rpcUrls: { default: { http: [RPC_URL] } } } as const

let _client: ReturnType<typeof createPublicClient> | null = null

export function getPublicClient() {
  if (!_client) {
    _client = createPublicClient({ chain, transport: http(RPC_URL) })
  }
  return _client
}
