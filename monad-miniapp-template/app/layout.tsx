import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'

import { ResponsiveLayout } from '@/components/layout'
import { Providers } from '@/components/providers'
import { minikitConfig } from '@/app/.well-known/farcaster.json/route'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
    other: {
      'base:app_id': '697972c89266edba958ff3e2', // TODO: Replace with your app ID from Coinbase Developer portal
      'fc:frame': JSON.stringify({
        version: minikitConfig.miniapp.version,
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        button: {
          title: minikitConfig.miniapp.buttonTitle,
          action: {
            name: `Launch ${minikitConfig.miniapp.name}`,
            type: 'launch_frame',
          },
        },
      }),
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersObj = await headers()
  const cookieString = headersObj.get('cookie')

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers cookies={cookieString}>
          <ResponsiveLayout>{children}</ResponsiveLayout>
        </Providers>
      </body>
    </html>
  )
}
