# Frontend (Next.js 15)

## Setup
1. Copy env:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```

App runs on `http://localhost:3000`.

## Pages
- `/documents`: upload PDF + document list + status polling.
- `/chat`: ask questions with scope selector (all docs or single doc), answer and source citations.

## UX notes
- Enter = send, Shift+Enter = newline.
- Minimal dark UI with Tailwind.
