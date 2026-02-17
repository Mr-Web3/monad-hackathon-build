'use client'

import ContextProvider from '@/context'

export function Providers({
  children,
  cookies,
}: {
  children: React.ReactNode
  cookies: string | null
}) {
  return <ContextProvider cookies={cookies}>{children}</ContextProvider>
}
