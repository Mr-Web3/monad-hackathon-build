import { NextResponse } from 'next/server'

const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  // TODO: Add your own account association from the Coinbase Developer portal
  accountAssociation: {
    header: 'eyJmaWQiOjc4ODgwMCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGE0MzkzODY2RDM3ZEUxOTkxNjQ4MDMxNzc2QkI0NkFjNEYyMUNkMDEifQ',
    payload: 'eyJkb21haW4iOiJwaXp6YS1zbGljZS1naWx0LnZlcmNlbC5hcHAifQ',
    signature: '/6BlbtRZaQqZq2lha2a0x8gWvG/bdiIQESw/ZNM5ZCtn1+CNwJrAv3PNOULFI+/YZ6M7Cq/P8iEYu+kUYCcqmhs=',
  },
  baseBuilder: {
    allowedAddresses: ['0x1d0B2cfeBaBB59b3AF59ff77DeF5397Ce4Be9e77'],
  },
  miniapp: {
    version: '1',
    name: 'VWAP Demo',
    subtitle: 'Build on Monad',
    description: 'Farcaster miniapp with Reown AppKit',
    screenshotUrls: [`${ROOT_URL}/images/feed.png`],
    iconUrl: `${ROOT_URL}/images/icon.png`,
    splashImageUrl: `${ROOT_URL}/images/splash.png`,
    splashBackgroundColor: '#ffffff',
    imageUrl: `${ROOT_URL}/images/feed.png`,
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: 'developer-tools',
    tags: ['monad', 'farcaster', 'miniapp', 'template'],
    buttonTitle: 'Launch VWAP Demo',
    heroImageUrl: `${ROOT_URL}/images/feed.png`,
    tagline: 'Monad Hackathon',
    ogTitle: 'Monad Hackathon',
    ogDescription: 'Farcaster miniapp with Reown AppKit',
    ogImageUrl: `${ROOT_URL}/images/feed.png`,
    castShareUrl: ROOT_URL,
    noindex: false,
  },
} as const

export async function GET() {
  return NextResponse.json(minikitConfig)
}
