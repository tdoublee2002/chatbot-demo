from typing import Any

from app.core.supabase_client import get_supabase_admin


def search_chunks(
    query_embedding: list[float],
    top_k: int,
    document_id: str | None = None,
) -> list[dict[str, Any]]:
    supabase = get_supabase_admin()
    payload = {
        "query_embedding": query_embedding,
        "match_count": top_k,
        "filter_document_id": document_id,
    }

    rpc_result = supabase.rpc("match_document_chunks", payload).execute()
    rows = rpc_result.data or []
    if not rows:
        return []

    doc_ids = list({row["document_id"] for row in rows})
    docs_resp = (
        supabase.table("documents")
        .select("id,title")
        .in_("id", doc_ids)
        .execute()
    )
    title_map = {doc["id"]: doc.get("title") or doc.get("id") for doc in (docs_resp.data or [])}

    for row in rows:
        row["doc_title"] = title_map.get(row["document_id"], "Untitled")

    return rows
