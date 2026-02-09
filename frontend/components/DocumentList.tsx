import { DocumentItem } from '@/lib/types'

const statusClass: Record<string, string> = {
  uploaded: 'bg-slate-500/30 text-slate-200',
  processing: 'bg-amber-500/30 text-amber-200',
  ready: 'bg-emerald-500/30 text-emerald-200',
  failed: 'bg-red-500/30 text-red-200',
}

export default function DocumentList({ documents }: { documents: DocumentItem[] }) {
  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{doc.title}</p>
              <p className="text-xs text-zinc-400">{doc.filename}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs ${statusClass[doc.status]}`}>{doc.status}</span>
          </div>
        </div>
      ))}
      {documents.length === 0 && <p className="text-sm text-zinc-400">No documents yet.</p>}
    </div>
  )
}
