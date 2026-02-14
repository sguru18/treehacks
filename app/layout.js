import './globals.css'

export const metadata = {
  title: 'The Idea Refinery',
  description: 'AI agents debate and validate your startup ideas with real-time research',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
