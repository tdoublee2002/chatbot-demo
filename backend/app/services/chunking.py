from dataclasses import dataclass


@dataclass
class TextChunk:
    chunk_index: int
    content: str
    page_start: int | None
    page_end: int | None


def chunk_pages(
    pages: list[tuple[int, str]],
    target_chars: int = 2600,
    overlap_chars: int = 250,
) -> list[TextChunk]:
    chunks: list[TextChunk] = []
    buffer = ""
    page_start: int | None = None
    page_end: int | None = None

    for page_num, text in pages:
        clean = " ".join(text.split())
        if not clean:
            continue

        if page_start is None:
            page_start = page_num

        if len(buffer) + len(clean) + 1 <= target_chars:
            buffer = f"{buffer} {clean}".strip()
            page_end = page_num
            continue

        if buffer:
            chunks.append(
                TextChunk(
                    chunk_index=len(chunks),
                    content=buffer,
                    page_start=page_start,
                    page_end=page_end,
                )
            )

        overlap = buffer[-overlap_chars:] if buffer else ""
        buffer = f"{overlap} {clean}".strip()
        page_start = page_num if not overlap else (page_end or page_num)
        page_end = page_num

    if buffer:
        chunks.append(
            TextChunk(
                chunk_index=len(chunks),
                content=buffer,
                page_start=page_start,
                page_end=page_end,
            )
        )

    return chunks
