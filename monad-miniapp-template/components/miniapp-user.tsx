'use client'

import type { MiniAppContext } from '@/types'

/**
 * Displays the connected user's context when the app is opened as a mini app (Farcaster/Base).
 * User comes from sdk.context in the layout; wallet connection is Reown only.
 */
export function MiniAppUser({ user }: { user: MiniAppContext['user'] | undefined }) {
  if (!user) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
      {user.pfpUrl && (
        <img src={user.pfpUrl} alt="" width={32} height={32} className="rounded-full" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
          {user.displayName || user.username || `FID ${user.fid}`}
        </p>
        {user.username && (
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            @{user.username}
          </p>
        )}
      </div>
    </div>
  )
}
