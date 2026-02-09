# Backend (FastAPI)

## Setup
1. Copy env:
   ```bash
   cp .env.example .env
   ```
2. Fill `.env` values (OpenAI + Supabase).
3. Install dependencies:
   ```bash
   pip install -e .
   ```
4. Run API:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Supabase setup
1. Create a bucket named `docs` (or your `SUPABASE_STORAGE_BUCKET`) in **Storage**.
2. Enable `pgvector` and create tables/function:
   - Open SQL Editor on Supabase.
   - Run `app/db/schema.sql`.
3. For MVP, use service role key in backend only (never expose to frontend).

## API endpoints
- `POST /v1/documents/upload`
- `GET /v1/documents`
- `GET /v1/documents/{document_id}`
- `POST /v1/chat`
- `GET /health`

## Flow
1. Upload PDF -> stored in Supabase storage.
2. Background ingestion extracts text page-by-page, chunks, embeds, and saves to `document_chunks`.
3. Chat endpoint embeds query, retrieves top chunks with `match_document_chunks`, asks OpenAI with strict grounded prompt, and returns citations.

## Notes
- PDF image scan/OCR is not included in this MVP.
- If retrieval returns no chunks, the API replies with "ไม่พบข้อมูลในเอกสาร" style answer.
