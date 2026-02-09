'use client'

import { useEffect, useState } from 'react'

import DocumentList from '@/components/DocumentList'
import UploadDropzone from '@/components/UploadDropzone'
import { fetchDocuments, uploadDocument } from '@/lib/api'
import { DocumentItem } from '@/lib/types'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const docs = await fetchDocuments()
      setDocuments(docs)
    } catch {
      setError('โหลดรายการเอกสารไม่สำเร็จ')
    }
  }

  useEffect(() => {
    void load()
    const timer = setInterval(() => {
      void load()
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const onUpload = async (file: File) => {
    setError(null)
    const optimistic: DocumentItem = {
      id: crypto.randomUUID(),
      filename: file.name,
      title: file.name,
      mime_type: file.type,
      storage_path: '',
      status: 'processing',
      page_count: null,
      created_at: new Date().toISOString(),
    }

    setDocuments((prev) => [optimistic, ...prev])

    try {
      await uploadDocument(file)
      await load()
    } catch {
      setError('อัปโหลดไม่สำเร็จ กรุณาลองใหม่')
      setDocuments((prev) => prev.filter((d) => d.id !== optimistic.id))
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-3 text-lg font-semibold">Upload documents</h2>
        <UploadDropzone onUpload={onUpload} />
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-3 text-lg font-semibold">Documents</h2>
        <DocumentList documents={documents} />
      </section>
    </div>
  )
}
