from typing import Sequence

from openai import OpenAI

from app.core.settings import get_settings

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)


def embed_texts(texts: Sequence[str]) -> list[list[float]]:
    response = client.embeddings.create(model=settings.openai_embedding_model, input=list(texts))
    return [item.embedding for item in response.data]


def chat_with_context(message: str, context: str) -> str:
    system_prompt = (
        "คุณเป็นผู้ช่วยที่ตอบจาก context เท่านั้น ห้ามเดาหรือเติมข้อมูลเองเด็ดขาด. "
        "ถ้าไม่พบคำตอบใน context ให้ตอบชัดเจนว่าไม่พบในเอกสารที่มี และแนะนำให้ผู้ใช้อัปโหลดเอกสารเพิ่มหรือระบุเอกสารให้ชัดเจน."
    )

    completion = client.chat.completions.create(
        model=settings.openai_chat_model,
        temperature=0,
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"คำถามผู้ใช้:\n{message}\n\nContext:\n{context}",
            },
        ],
    )
    return completion.choices[0].message.content or "ไม่พบข้อมูลในเอกสารที่มี"
