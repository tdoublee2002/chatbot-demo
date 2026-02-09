import { ChatResponse, DocumentItem } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'

export async function uploadDocument(file: File): Promise<{ document_id: string; status: string }> {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${API_BASE_URL}/v1/documents/upload`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    throw new Error('Upload failed')
  }

  return res.json()
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE_URL}/v1/documents`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to load documents')
  }
  const data = await res.json()
  return data.documents
}

export async function sendChat(payload: {
  conversation_id: string | null
  message: string
  document_id: string | null
  top_k: number
}): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error('Chat request failed')
  }

  return res.json()
}
