from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile

from app.core.settings import get_settings
from app.core.supabase_client import get_supabase_admin
from app.services.ingestion import ingest_document

router = APIRouter(prefix="/v1/documents", tags=["documents"])
settings = get_settings()


@router.post("/upload")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if file.content_type not in {"application/pdf"}:
        raise HTTPException(status_code=400, detail="Only PDF files are supported in MVP")

    file_bytes = await file.read()
    supabase = get_supabase_admin()

    doc_insert = (
        supabase.table("documents")
        .insert(
            {
                "filename": file.filename,
                "title": file.filename,
                "mime_type": file.content_type,
                "storage_path": "",
                "status": "processing",
            }
        )
        .execute()
    )

    document = (doc_insert.data or [None])[0]
    if not document:
        raise HTTPException(status_code=500, detail="Failed to create document row")

    document_id = document["id"]
    storage_path = f"{document_id}/{file.filename}"

    supabase.storage.from_(settings.supabase_storage_bucket).upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": file.content_type, "upsert": "true"},
    )

    supabase.table("documents").update({"storage_path": storage_path}).eq("id", document_id).execute()

    background_tasks.add_task(ingest_document, document_id, file_bytes, file.filename or "Untitled")
    return {"document_id": document_id, "status": "processing"}


@router.get("")
def list_documents():
    supabase = get_supabase_admin()
    resp = supabase.table("documents").select("*").order("created_at", desc=True).execute()
    return {"documents": resp.data or []}


@router.get("/{document_id}")
def get_document(document_id: str):
    supabase = get_supabase_admin()
    doc_resp = supabase.table("documents").select("*").eq("id", document_id).single().execute()
    if not doc_resp.data:
        raise HTTPException(status_code=404, detail="Document not found")

    chunks_resp = (
        supabase.table("document_chunks")
        .select("id", count="exact")
        .eq("document_id", document_id)
        .execute()
    )

    return {"document": doc_resp.data, "chunk_count": chunks_resp.count or 0}
