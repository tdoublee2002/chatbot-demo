import logging
from io import BytesIO

from pypdf import PdfReader

from app.core.openai_client import embed_texts
from app.core.supabase_client import get_supabase_admin
from app.services.chunking import chunk_pages

logger = logging.getLogger(__name__)


def ingest_document(document_id: str, file_bytes: bytes, filename: str) -> None:
    supabase = get_supabase_admin()
    try:
        pages = extract_pdf_pages(file_bytes)
        chunks = chunk_pages(pages)

        if not chunks:
            raise ValueError("No text extracted from PDF")

        embeddings = embed_texts([chunk.content for chunk in chunks])
        rows = []
        for chunk, embedding in zip(chunks, embeddings, strict=True):
            rows.append(
                {
                    "document_id": document_id,
                    "chunk_index": chunk.chunk_index,
                    "page_start": chunk.page_start,
                    "page_end": chunk.page_end,
                    "content": chunk.content,
                    "embedding": embedding,
                }
            )

        supabase.table("document_chunks").insert(rows).execute()
        (
            supabase.table("documents")
            .update({"status": "ready", "page_count": len(pages), "title": filename})
            .eq("id", document_id)
            .execute()
        )
    except Exception:
        logger.exception("Ingestion failed for document_id=%s", document_id)
        supabase.table("documents").update({"status": "failed"}).eq("id", document_id).execute()


def extract_pdf_pages(file_bytes: bytes) -> list[tuple[int, str]]:
    reader = PdfReader(BytesIO(file_bytes))
    pages: list[tuple[int, str]] = []
    for index, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        pages.append((index, text))
    return pages
