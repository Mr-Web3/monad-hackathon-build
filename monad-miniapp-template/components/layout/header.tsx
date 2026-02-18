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

const navLinks = [] as const

/* ────────────────────────────────────────────
   Inline SVG cheese shelf texture + drips
   ──────────────────────────────────────────── */
function CheeseShelfSVG() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
      viewBox="0 0 1200 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Base cheese gradient */}
        <linearGradient id="cheese-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(44, 82%, 68%)" />
          <stop offset="20%" stopColor="hsl(42, 78%, 60%)" />
          <stop offset="45%" stopColor="hsl(38, 74%, 52%)" />
          <stop offset="70%" stopColor="hsl(34, 70%, 44%)" />
          <stop offset="100%" stopColor="hsl(28, 64%, 34%)" />
        </linearGradient>

        {/* Glossy top highlight */}
        <linearGradient id="cheese-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,245,200,0.45)" />
          <stop offset="40%" stopColor="rgba(255,240,180,0.15)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>

        {/* Drip gradient */}
        <linearGradient id="drip-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(40, 76%, 52%)" />
          <stop offset="60%" stopColor="hsl(36, 70%, 44%)" />
          <stop offset="100%" stopColor="hsl(32, 66%, 38%)" />
        </linearGradient>

        {/* Specular highlight */}
        <radialGradient id="spec1" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stopColor="rgba(255,250,220,0.6)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Base cheese fill */}
      <rect x="0" y="0" width="1200" height="80" fill="url(#cheese-base)" />

      {/* Cheese bubbles — lighter spots */}
      <ellipse cx="90" cy="25" rx="18" ry="12" fill="hsl(46,84%,72%)" opacity="0.4" />
      <ellipse cx="200" cy="50" rx="22" ry="14" fill="hsl(45,82%,70%)" opacity="0.35" />
      <ellipse cx="340" cy="28" rx="14" ry="10" fill="hsl(47,86%,74%)" opacity="0.45" />
      <ellipse cx="440" cy="55" rx="20" ry="13" fill="hsl(44,80%,68%)" opacity="0.3" />
      <ellipse cx="560" cy="22" rx="16" ry="11" fill="hsl(46,84%,72%)" opacity="0.4" />
      <ellipse cx="680" cy="48" rx="24" ry="15" fill="hsl(45,80%,70%)" opacity="0.35" />
      <ellipse cx="780" cy="30" rx="13" ry="9" fill="hsl(48,86%,74%)" opacity="0.42" />
      <ellipse cx="890" cy="52" rx="19" ry="12" fill="hsl(44,78%,66%)" opacity="0.32" />
      <ellipse cx="980" cy="20" rx="16" ry="11" fill="hsl(46,84%,72%)" opacity="0.4" />
      <ellipse cx="1080" cy="45" rx="21" ry="14" fill="hsl(45,80%,68%)" opacity="0.36" />
      <ellipse cx="1160" cy="32" rx="12" ry="8" fill="hsl(47,86%,74%)" opacity="0.38" />

      {/* Smaller cheese bubbles */}
      <ellipse cx="150" cy="38" rx="8" ry="6" fill="hsl(48,88%,76%)" opacity="0.3" />
      <ellipse cx="500" cy="40" rx="10" ry="7" fill="hsl(48,88%,76%)" opacity="0.28" />
      <ellipse cx="720" cy="18" rx="9" ry="6" fill="hsl(48,88%,76%)" opacity="0.32" />
      <ellipse cx="1020" cy="60" rx="11" ry="7" fill="hsl(48,88%,76%)" opacity="0.26" />

      {/* Dark crust pockets */}
      <ellipse cx="130" cy="65" rx="10" ry="7" fill="hsl(24,58%,28%)" opacity="0.25" />
      <ellipse cx="370" cy="15" rx="8" ry="5" fill="hsl(22,54%,30%)" opacity="0.2" />
      <ellipse cx="600" cy="68" rx="12" ry="8" fill="hsl(26,60%,26%)" opacity="0.22" />
      <ellipse cx="850" cy="12" rx="7" ry="5" fill="hsl(20,50%,32%)" opacity="0.18" />
      <ellipse cx="1100" cy="62" rx="9" ry="6" fill="hsl(24,56%,28%)" opacity="0.2" />

      {/* Pepperoni spots */}
      <circle cx="180" cy="40" r="8" fill="hsl(8,72%,35%)" opacity="0.5" />
      <circle cx="420" cy="30" r="6" fill="hsl(8,70%,38%)" opacity="0.45" />
      <circle cx="650" cy="50" r="9" fill="hsl(8,74%,33%)" opacity="0.48" />
      <circle cx="920" cy="35" r="7" fill="hsl(8,68%,36%)" opacity="0.42" />
      <circle cx="1130" cy="42" r="6" fill="hsl(8,72%,38%)" opacity="0.4" />

      {/* Glossy top highlight */}
      <rect x="0" y="0" width="1200" height="35" fill="url(#cheese-gloss)" />

      {/* Specular shine spots */}
      <ellipse cx="300" cy="18" rx="40" ry="14" fill="url(#spec1)" opacity="0.5" />
      <ellipse cx="750" cy="15" rx="50" ry="16" fill="url(#spec1)" opacity="0.4" />
      <ellipse cx="1050" cy="20" rx="35" ry="12" fill="url(#spec1)" opacity="0.45" />

      {/* Bottom dark edge line */}
      <rect x="0" y="76" width="1200" height="4" fill="hsl(24,50%,18%)" opacity="0.6" />

      {/* Top warm edge highlight */}
      <rect x="60" y="0" width="1080" height="1" fill="hsl(48,90%,78%)" opacity="0.5" rx="1" />
    </svg>
  )
}

/* Thick SVG cheese drips hanging from the bottom of the shelf */
function CheeseShelfDrips() {
  const drips = [
    { x: 80,  w: 12, h: 45, delay: '0s',   dur: '5.5s' },
    { x: 190, w: 8,  h: 30, delay: '1.2s', dur: '6.2s' },
    { x: 340, w: 14, h: 55, delay: '0.5s', dur: '5.0s' },
    { x: 520, w: 10, h: 38, delay: '2.0s', dur: '6.8s' },
    { x: 680, w: 13, h: 50, delay: '0.8s', dur: '5.3s' },
    { x: 850, w: 9,  h: 32, delay: '1.8s', dur: '6.5s' },
    { x: 1020, w: 11, h: 42, delay: '0.3s', dur: '5.8s' },
    { x: 1140, w: 8,  h: 28, delay: '2.5s', dur: '7.0s' },
  ]

  return (
    <svg
      className="absolute left-0 right-0 pointer-events-none"
      style={{ top: '100%', height: 70, width: '100%' }}
      preserveAspectRatio="none"
      viewBox="0 0 1200 70"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="drip-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(40, 76%, 52%)" />
          <stop offset="50%" stopColor="hsl(36, 70%, 44%)" />
          <stop offset="100%" stopColor="hsl(32, 66%, 38%)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="drip-spec" cx="30%" cy="20%" r="50%">
          <stop offset="0%" stopColor="rgba(255,245,200,0.5)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      {drips.map((d, i) => {
        const bx = d.w * 0.55
        return (
          <g key={i}>
            {/* Drip body — organic teardrop shape */}
            <path
              d={`M ${d.x - d.w / 2} 0 
                  Q ${d.x - d.w / 2} ${d.h * 0.5}, ${d.x - bx / 2} ${d.h * 0.7} 
                  Q ${d.x} ${d.h + 4}, ${d.x + bx / 2} ${d.h * 0.7} 
                  Q ${d.x + d.w / 2} ${d.h * 0.5}, ${d.x + d.w / 2} 0 Z`}
              fill="url(#drip-g)"
              style={{
                transformOrigin: `${d.x}px 0px`,
                animation: `cheese-drip-slow ${d.dur} ease-in-out ${d.delay} infinite`,
              }}
            />
            {/* Gloss spot on drip */}
            <ellipse
              cx={d.x - d.w * 0.15}
              cy={d.h * 0.25}
              rx={d.w * 0.2}
              ry={d.h * 0.15}
              fill="url(#drip-spec)"
              opacity="0.6"
            />
          </g>
        )
      })}
    </svg>
  )
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [pastHero, setPastHero] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { address, isConnected, chainId } = useAccount()
  const { data: balance } = useBalance({ address })
  const { disconnect } = useDisconnect()
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain()
  const isOnMonadTestnet = chainId === MONAD_TESTNET_CHAIN_ID

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80)
      setPastHero(window.scrollY > window.innerHeight * 2)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      : null

  const isShelf = pastHero

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
      style={{ overflow: isShelf ? 'visible' : undefined }}
    >
      {/* ═══ Default state: subtle defined dark bar ═══ */}
      {!isShelf && (
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            scrolled
              ? 'bg-black/80 backdrop-blur-xl border-b border-white/[0.08]'
              : 'bg-white/[0.04] backdrop-blur-sm border-b border-white/[0.06]'
          }`}
        />
      )}

      {/* ═══ Pizza shelf state: thick 3D HD cheese bar ═══ */}
      {isShelf && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            transform: 'perspective(800px) rotateX(1.8deg)',
            transformOrigin: 'center bottom',
            boxShadow:
              '0 4px 8px rgba(0,0,0,0.3), 0 8px 24px -2px rgba(0,0,0,0.4), 0 16px 48px -4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,245,200,0.3), inset 0 -2px 4px rgba(0,0,0,0.3)',
            borderBottom: '2px solid hsl(24,50%,20%)',
          }}
        >
          {/* SVG cheese texture */}
          <CheeseShelfSVG />

          {/* Thick cheese drips hanging from bar */}
          <CheeseShelfDrips />
        </div>
      )}

      {/* ═══ NAV CONTENT ═══ */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 relative z-20">
        {/* Logo — scrolls back to top (restarts hero) */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span
            className={`font-display font-bold text-xl tracking-tight text-white ${
              isShelf ? 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]' : ''
            }`}
          >
            PizzaSlice
          </span>
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-[13px] font-medium transition-colors duration-200 ${
                isShelf
                  ? 'text-white/95 hover:text-white font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Wallet section */}
        <div className="shrink-0 flex items-center gap-3">
          {isConnected && address ? (
            <>
              {/* Inline balance display */}
              {balanceDisplay && (
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    isShelf
                      ? 'text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]'
                      : 'text-white/50'
                  }`}
                >
                  {balanceDisplay}
                </span>
              )}

              {/* Address dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    isShelf
                      ? 'bg-black/40 backdrop-blur-sm border border-white/15 text-white hover:bg-black/50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
                      : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
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
                  <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-white/10 bg-neutral-900/95 backdrop-blur-xl py-1 shadow-xl">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5"
                    >
                      {copied ? 'Copied!' : 'Copy address'}
                    </button>
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
                        className="w-full px-3 py-2 text-left text-sm font-medium text-amber-400 hover:bg-amber-950/30 disabled:opacity-50"
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
                      className="w-full px-3 py-2 text-left text-sm font-medium text-red-400 hover:bg-red-950/30"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <AppKitButton label="Connect wallet" />
          )}
        </div>
      </div>
    </header>
  )
}
