from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_chat import router as chat_router
from app.api.routes_docs import router as docs_router
from app.core.settings import get_settings

settings = get_settings()
app = FastAPI(title="Agentic RAG Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(docs_router)
app.include_router(chat_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
