'use client'

import { useAccount, useSwitchChain } from 'wagmi'
import { VWAP_DEMO_ADDRESS } from '@/src/contracts/vwapDemo'

const MONAD_TESTNET_CHAIN_ID = 10143
const DEFAULT_FAUCET_URL = 'https://faucet.monad.xyz'
const DEFAULT_EXPLORER_URL = 'https://testnet.monadscan.com'

const explorerBase =
  typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_EXPLORER_BASE_URL?.trim()
    ? process.env.NEXT_PUBLIC_EXPLORER_BASE_URL.replace(/\/$/, '')
    : DEFAULT_EXPLORER_URL

const faucetUrl =
  typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FAUCET_URL?.trim()
    ? process.env.NEXT_PUBLIC_FAUCET_URL
    : DEFAULT_FAUCET_URL

interface NetworkHelpersProps {
  /** Optional: show link for this tx hash (e.g. latest user tx). */
  latestTxHash?: `0x${string}` | string | null
  className?: string
}

export function NetworkHelpers({ latestTxHash, className = '' }: NetworkHelpersProps) {
  const { chainId, isConnected } = useAccount()
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain()
  const isOnMonadTestnet = chainId === MONAD_TESTNET_CHAIN_ID

  const handleSwitchNetwork = async () => {
    try {
      await switchChainAsync?.({ chainId: MONAD_TESTNET_CHAIN_ID })
    } catch (e) {
      console.error('Switch chain failed:', e)
    }
  }

  return (
    <section
      className={`rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 ${className}`}
    >
      <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Network &amp; helpers
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        {isConnected && !isOnMonadTestnet && (
          <button
            type="button"
            onClick={handleSwitchNetwork}
            disabled={isSwitchingChain}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {isSwitchingChain ? 'Switching…' : 'Switch to Monad Testnet'}
          </button>
        )}
        <a
          href={faucetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          Get faucet MON
        </a>
        <a
          href={`${explorerBase}/address/${VWAP_DEMO_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          View contract on Explorer
        </a>
        {latestTxHash && (
          <a
            href={`${explorerBase}/tx/${latestTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            View latest tx
          </a>
        )}
      </div>
    </section>
  )
}
