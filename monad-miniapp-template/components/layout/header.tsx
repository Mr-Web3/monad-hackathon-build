'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAccount, useBalance, useDisconnect, useSwitchChain } from 'wagmi'
import { formatUnits } from 'viem'
import { AppKitButton } from '@reown/appkit/react'

const MONAD_TESTNET_CHAIN_ID = 10143
const MONAD_RPC_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_RPC_URL?.trim()) ||
  'https://testnet-rpc.monad.xyz'

function shortenAddress(address: string): string {
  if (address.length < 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { address, isConnected, chainId } = useAccount()
  const { data: balance } = useBalance({ address })
  const { disconnect } = useDisconnect()
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain()
  const isOnMonadTestnet = chainId === MONAD_TESTNET_CHAIN_ID

  useEffect(() => {
    if (!dropdownOpen) return
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [dropdownOpen])

  const handleCopy = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const balanceFormatted =
    balance?.value != null && balance?.decimals != null
      ? formatUnits(balance.value, balance.decimals)
      : null
  const balanceDisplay =
    balanceFormatted != null
      ? `${Number(balanceFormatted).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${balance?.symbol ?? 'MON'}`
      : '—'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-neutral-800 dark:bg-neutral-950/95 dark:supports-[backdrop-filter]:bg-neutral-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-white">
          VWAP Demo
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/about"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            About
          </Link>
          {isConnected && address ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                title={address}
              >
                {shortenAddress(address)}
                <svg
                  className="h-4 w-4 shrink-0 opacity-60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  >
                    {copied ? 'Copied!' : 'Copy address'}
                  </button>
                  <div className="border-t border-neutral-100 px-3 py-2 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                    Balance: {balanceDisplay}
                  </div>
                  {!isOnMonadTestnet && (
                    <button
                      type="button"
                      disabled={isSwitchingChain}
                      onClick={async () => {
                        try {
                          await switchChainAsync?.({
                            chainId: MONAD_TESTNET_CHAIN_ID,
                            addEthereumChainParameter: {
                              chainName: 'Monad Testnet',
                              nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
                              rpcUrls: [MONAD_RPC_URL],
                              blockExplorerUrls: ['https://testnet.monadexplorer.com'],
                            },
                          })
                          setDropdownOpen(false)
                        } catch (e) {
                          console.error('Switch chain failed:', e)
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-sm font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/30 disabled:opacity-50"
                    >
                      {isSwitchingChain ? 'Switching…' : 'Switch to Monad Testnet'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      disconnect()
                      setDropdownOpen(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <AppKitButton label="Connect wallet" />
          )}
        </nav>
      </div>
    </header>
  )
}
