from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.openai_client import chat_with_context, embed_texts
from app.core.supabase_client import get_supabase_admin
from app.services.citations import build_citations, build_context
from app.services.retrieval import search_chunks

router = APIRouter(prefix="/v1/chat", tags=["chat"])


class ChatRequest(BaseModel):
    conversation_id: str | None = None
    message: str = Field(min_length=1)
    document_id: str | None = None
    top_k: int = Field(default=6, ge=1, le=20)


class Citation(BaseModel):
    document_id: str
    doc_title: str
    chunk_id: str
    page_start: int | None
    page_end: int | None
    snippet: str


class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    citations: list[Citation]


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest):
    supabase = get_supabase_admin()

    conversation_id = payload.conversation_id
    if conversation_id is None:
        conv = supabase.table("conversations").insert({}).execute()
        conversation_id = conv.data[0]["id"]

    supabase.table("messages").insert(
        {
            "conversation_id": conversation_id,
            "role": "user",
            "content": payload.message,
        }
    ).execute()

    query_embedding = embed_texts([payload.message])[0]
    rows = search_chunks(query_embedding, payload.top_k, payload.document_id)

    if not rows:
        answer = "ไม่พบข้อมูลที่เกี่ยวข้องในเอกสารที่มีอยู่ตอนนี้ กรุณาอัปโหลดเอกสารเพิ่มหรือระบุเอกสารที่ต้องการค้นหา"
        citations: list[dict] = []
    else:
        context = build_context(rows)
        answer = chat_with_context(payload.message, context)
        citations = build_citations(rows)

    supabase.table("messages").insert(
        {
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": answer,
        }
    ).execute()

    return ChatResponse(conversation_id=conversation_id, answer=answer, citations=citations)
