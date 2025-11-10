import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LBD Style Guide Service',
  description: 'A server-accessible representation of writing and speaking patterns for LLM conditioning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
