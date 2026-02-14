import './globals.css'

export const metadata = {
  title: 'The Idea Refinery',
  description: 'AI agents debate and validate your startup ideas',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
