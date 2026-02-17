/**
 * Chain config from env. Set NEXT_PUBLIC_RPC_URL and NEXT_PUBLIC_CHAIN_ID in .env
 */
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet-rpc.monad.xyz'
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '10143')

export const chain = {
  id: CHAIN_ID,
  name: CHAIN_ID === 10143 ? 'Monad Testnet' : CHAIN_ID === 143 ? 'Monad' : 'Unknown',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
} as const

export { RPC_URL, CHAIN_ID }
