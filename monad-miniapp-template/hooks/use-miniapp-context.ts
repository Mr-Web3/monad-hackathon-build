'use client'

import sdk from '@farcaster/miniapp-sdk'
import { useEffect, useState } from 'react'
import type { MiniAppContext } from '@/types'

export function useMiniAppContext() {
  const [isInMiniApp, setIsInMiniApp] = useState(false)
  const [context, setContext] = useState<MiniAppContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const inMiniApp = await sdk.isInMiniApp()
        if (cancelled) return
        setIsInMiniApp(inMiniApp)

        if (inMiniApp) {
          const ctx = await sdk.context
          if (cancelled) return
          setContext(ctx as MiniAppContext)
        }
      } catch (err) {
        if (!cancelled) console.error('Mini app context error:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return {
    isInMiniApp,
    context,
    user: context?.user,
    client: context?.client,
    features: context?.features,
    isLoading,
  }
}
