'use client'

import { useEffect, useMemo, useState } from 'react'

import { fetchDocuments, sendChat } from '@/lib/api'
import { Citation, DocumentItem } from '@/lib/types'
import CitationCard from './CitationCard'

interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}

export default function ChatUI() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [scope, setScope] = useState<string>('all')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void fetchDocuments().then(setDocuments).catch(() => setDocuments([]))
  }, [])

  const send = async () => {
    const text = message.trim()
    if (!text || loading) return
    setLoading(true)
    setMessage('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])

    try {
      const res = await sendChat({
        conversation_id: conversationId,
        message: text,
        document_id: scope === 'all' ? null : scope,
        top_k: 6,
      })

      setConversationId(res.conversation_id)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.answer, citations: res.citations }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'เกิดข้อผิดพลาดในการตอบคำถาม กรุณาลองใหม่อีกครั้ง' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const readyDocs = useMemo(() => documents.filter((d) => d.status === 'ready'), [documents])

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="flex items-center gap-2">
        <select
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        >
          <option value="all">All documents</option>
          {readyDocs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </div>

      <div className="min-h-[360px] space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        {messages.map((m, idx) => (
          <div key={`${m.role}-${idx}`} className="space-y-2">
            <div className={`max-w-[80%] rounded-xl p-3 text-sm ${m.role === 'user' ? 'ml-auto bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-100'}`}>
              {m.content}
            </div>
            {m.role === 'assistant' && m.citations && m.citations.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {m.citations.map((c) => (
                  <CitationCard key={c.chunk_id} citation={c} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
        <textarea
          className="min-h-24 w-full resize-none bg-transparent text-sm outline-none"
          placeholder="ถามคำถามจากเอกสาร..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void send()
            }
          }}
        />
        <div className="mt-2 flex justify-end">
          <button
            className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            onClick={() => void send()}
            disabled={loading}
          >
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
