from typing import Any


def build_citations(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    citations: list[dict[str, Any]] = []
    for row in rows:
        snippet = row["content"][:240].strip()
        citations.append(
            {
                "document_id": row["document_id"],
                "doc_title": row.get("doc_title") or "Untitled",
                "chunk_id": row["chunk_id"],
                "page_start": row.get("page_start"),
                "page_end": row.get("page_end"),
                "snippet": snippet,
            }
        )
    return citations


def build_context(rows: list[dict[str, Any]]) -> str:
    if not rows:
        return ""

    blocks = []
    for row in rows:
        page = (
            f"หน้า {row.get('page_start')}"
            if row.get("page_start") == row.get("page_end")
            else f"หน้า {row.get('page_start')}-{row.get('page_end')}"
        )
        blocks.append(
            f"[chunk_id={row['chunk_id']}] [doc={row.get('doc_title', 'Untitled')}] [page={page}]\n{row['content']}"
        )

    return "\n\n".join(blocks)
