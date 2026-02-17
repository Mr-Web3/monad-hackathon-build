import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'
import { monadTestnet } from 'viem/chains'
import { cookieStorage, createStorage, http } from 'wagmi'

export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID

if (!projectId && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_REOWN_PROJECT_ID is not set. Add it to .env (see .env.example).')
}

// Use public RPC; Reown Cloud may use Alchemy for Monad testnet and return 500, so we force our RPC everywhere
const monadRpc = process.env.NEXT_PUBLIC_RPC_URL?.trim() || 'https://testnet-rpc.monad.xyz'

// Override chain so only our RPC is used (no Alchemy/Reown Cloud fallback from chain definition)
const monadTestnetWithOurRpc = {
  ...monadTestnet,
  rpcUrls: {
    ...monadTestnet.rpcUrls,
    default: { http: [monadRpc] },
  },
} as const

export const networks = [monadTestnetWithOurRpc] as const

const MONAD_CAIP = 'eip155:10143' as const

export const customRpcUrls: Record<string, { url: string }[]> = {
  [MONAD_CAIP]: [{ url: monadRpc }],
}

export const wagmiAdapter = new WagmiAdapter({
  projectId: projectId ?? '',
  networks: [...networks],
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [monadTestnet.id]: http(monadRpc),
  },
  customRpcUrls,
  connectors: [farcasterMiniApp()],
})

export const config = wagmiAdapter.wagmiConfig
