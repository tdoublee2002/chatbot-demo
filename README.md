# Agentic RAG MVP (Next.js + FastAPI + Supabase)

MVP full-stack สำหรับอัปโหลดเอกสาร PDF และถามตอบแบบ RAG โดยตอบจากเอกสารเท่านั้น พร้อม citation.

## Features
1. Upload เอกสาร PDF ไป Supabase Storage และประมวลผล chunk + embedding เก็บใน Supabase Postgres
2. Chat RAG โดยค้นหา chunk ด้วย pgvector similarity search และแสดง citations (doc title/page/chunk/snippet)

## Stack
- Frontend: Next.js 15, TypeScript, Tailwind
- Backend: FastAPI, pydantic v2, httpx, python-multipart
- DB/Storage: Supabase Postgres + Storage
- Vector search: pgvector (`vector(1536)` + RPC `match_document_chunks`)
- LLM/Embeddings: OpenAI API

## Project structure
- `backend/` FastAPI API + ingestion + retrieval + SQL schema
- `frontend/` Next.js app (`/documents`, `/chat`)
- `docker-compose.yml` local dev services

## Prerequisites
- OpenAI API key
- Supabase project (Cloud)

## Supabase setup
1. สร้าง bucket ชื่อ `docs` ใน Storage
2. เปิด SQL Editor และรัน `backend/app/db/schema.sql`
3. เก็บค่า:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Environment
### Backend
```bash
cp backend/.env.example backend/.env
```
ใส่ค่า OpenAI + Supabase

### Frontend
```bash
cp frontend/.env.example frontend/.env.local
```

## Run (docker compose)
```bash
docker compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Run manually
### Backend
```bash
cd backend
pip install -e .
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Test flow
1. เปิด `/documents` แล้ว upload PDF text-based
2. ดู status เปลี่ยน `processing -> ready`
3. เปิด `/chat` แล้วถามคำถามเกี่ยวกับเอกสาร
4. ระบบต้องตอบพร้อม Sources (citations)
5. ถ้าไม่มีข้อมูล ระบบจะตอบว่าไม่พบในเอกสารและแนะนำให้อัปโหลด/ระบุเอกสารเพิ่ม

## TODO ต่อได้
- Auth + user_id multi-tenant
- OCR pipeline สำหรับ scanned PDF
- Streaming chat (`/v1/chat/stream`)
