import './globals.css'
import Link from 'next/link'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <header className="border-b border-zinc-800 bg-zinc-950/80">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <h1 className="text-lg font-semibold">Agentic RAG MVP</h1>
            <div className="flex gap-4 text-sm text-zinc-300">
              <Link href="/documents" className="hover:text-white">
                Documents
              </Link>
              <Link href="/chat" className="hover:text-white">
                Chat
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl p-4">{children}</main>
      </body>
    </html>
  )
}
