import { Citation } from '@/lib/types'

export default function CitationCard({ citation }: { citation: Citation }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <p className="text-sm font-medium">{citation.doc_title}</p>
      <p className="text-xs text-zinc-400">
        chunk: {citation.chunk_id} • page: {citation.page_start ?? '-'}
        {citation.page_end && citation.page_end !== citation.page_start ? `-${citation.page_end}` : ''}
      </p>
      <p className="mt-2 text-sm text-zinc-300">{citation.snippet}</p>
    </div>
  )
}
