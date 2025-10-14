import './global.css'
import type { Metadata } from 'next'
import { baseUrl } from './sitemap'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Ivana — Welcome to my world',
    template: '%s · Ivana',
  },
  description:
    'Explore my cozy world to discover my projects, skills, and story.',
  openGraph: {
    title: 'Ivana — Playable Portfolio',
    description:
      'Explore my cozy world to discover my projects, skills, and story.',
    url: baseUrl,
    siteName: 'Ivana — Playable Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* Fonts & colors are defined in globals.css */}
      <body className="antialiased">
        {/* Minimal shell — no template navbar/footer */}
        <main className="min-h-dvh">{children}</main>
      </body>
    </html>
  )
}
