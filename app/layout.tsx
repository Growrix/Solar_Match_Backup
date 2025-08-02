import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SolarMatch Australia - Smarter Solar Starts Here',
  description: 'Australia\'s trusted platform for solar quotes, rebate calculations, and connecting with verified solar installers. Get your free solar estimate today.',
  keywords: 'solar panels Australia, solar rebates, solar installers, solar quotes, renewable energy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}