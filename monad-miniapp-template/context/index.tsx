'use client'

import { wagmiAdapter, projectId, networks, customRpcUrls } from '@/config'
import { createAppKit, type CreateAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('NEXT_PUBLIC_REOWN_PROJECT_ID is not set. Add it to .env (see .env.example).')
}

const metadata = {
  name: 'VWAP Demo',
  description: 'Farcaster miniapp with Reown AppKit',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
  icons: [],
}

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [...networks] as CreateAppKit['networks'],
  defaultNetwork: networks[0] as CreateAppKit['defaultNetwork'],
  customRpcUrls,
  metadata,
  features: {
    analytics: true,
  },
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider
