import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LBD Style Guide Service',
  description: 'A server-accessible representation of writing and speaking patterns for LLM conditioning',
}

// Import globals CSS as a side effect
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
