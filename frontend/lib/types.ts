export type DocumentStatus = 'uploaded' | 'processing' | 'ready' | 'failed'

export interface DocumentItem {
  id: string
  filename: string
  title: string
  mime_type: string
  storage_path: string
  status: DocumentStatus
  page_count: number | null
  created_at: string
}

export interface Citation {
  document_id: string
  doc_title: string
  chunk_id: string
  page_start: number | null
  page_end: number | null
  snippet: string
}

export interface ChatResponse {
  conversation_id: string
  answer: string
  citations: Citation[]
}
