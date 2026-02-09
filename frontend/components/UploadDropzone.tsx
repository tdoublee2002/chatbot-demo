'use client'

import { UploadCloud } from 'lucide-react'
import { useCallback, useState } from 'react'

interface UploadDropzoneProps {
  onUpload: (file: File) => Promise<void>
}

export default function UploadDropzone({ onUpload }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) return
      setUploading(true)
      try {
        await onUpload(file)
      } finally {
        setUploading(false)
      }
    },
    [onUpload],
  )

  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 transition ${
        dragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-zinc-700 bg-zinc-900/70'
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        void handleFile(e.dataTransfer.files.item(0))
      }}
    >
      <UploadCloud className="h-8 w-8 text-indigo-300" />
      <div className="text-center">
        <p className="font-medium">Drag & drop PDF here</p>
        <p className="text-sm text-zinc-400">หรือคลิกเพื่อเลือกไฟล์</p>
      </div>
      <input
        type="file"
        className="hidden"
        accept="application/pdf"
        onChange={(e) => void handleFile(e.target.files?.item(0) ?? null)}
      />
      {uploading && <p className="text-xs text-indigo-200">Uploading...</p>}
    </label>
  )
}
