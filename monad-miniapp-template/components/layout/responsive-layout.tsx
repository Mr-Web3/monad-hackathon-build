'use client'

import { useAccount } from 'wagmi'
import { useMiniAppContext } from '@/hooks/use-miniapp-context'
import { MiniAppUser } from '@/components/miniapp-user'
import { SafeAreaContainer } from '@/components/safe-area-container'
import { BottomNav } from './bottom-nav'

function shortenAddress(address: string): string {
  if (address.length < 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function MiniAppWalletAddress() {
  const { address, isConnected } = useAccount()
  if (!isConnected || !address) return null
  return (
    <div
      className="shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
      title={address}
    >
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Wallet</p>
      <p
        className="truncate font-mono text-sm text-neutral-900 dark:text-white"
        style={{ maxWidth: '8.5rem' }}
      >
        {shortenAddress(address)}
      </p>
    </div>
  )
}

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const { isInMiniApp, context, isLoading } = useMiniAppContext()
  const insets = context?.client?.safeAreaInsets

  if (isLoading) {
    return (
      <SafeAreaContainer insets={insets}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
          <p className="text-muted-foreground font-body">Loading...</p>
        </div>
      </SafeAreaContainer>
    )
  }

  // Desktop / non-miniapp: no forced background so the landing hero (bg-black) works
  if (!isInMiniApp || !context) {
    return (
      <SafeAreaContainer insets={insets}>
        <div className="min-h-screen">{children}</div>
      </SafeAreaContainer>
    )
  }

  // Farcaster miniapp
  return (
    <SafeAreaContainer insets={insets}>
      <main
        className="min-h-screen w-full max-w-5xl mx-auto px-4 pt-4 pb-24"
        style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-stretch gap-3">
          <div className="min-w-0 flex-1">
            <MiniAppUser user={context.user} />
          </div>
          <MiniAppWalletAddress />
        </div>
        <div className="pt-3">{children}</div>
      </main>
      <BottomNav />
    </SafeAreaContainer>
  )
}
