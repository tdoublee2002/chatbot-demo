create extension if not exists vector;

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  title text not null,
  mime_type text not null,
  storage_path text not null,
  status text not null check (status in ('uploaded','processing','ready','failed')),
  page_count int null,
  created_at timestamptz not null default now()
);

create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  chunk_index int not null,
  page_start int null,
  page_end int null,
  content text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_document_chunks_document_id_chunk_idx
  on document_chunks(document_id, chunk_index);

create index if not exists idx_document_chunks_embedding_ivfflat
  on document_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function match_document_chunks(
  query_embedding vector(1536),
  match_count int,
  filter_document_id uuid default null
)
returns table (
  chunk_id uuid,
  document_id uuid,
  content text,
  page_start int,
  page_end int,
  similarity float
)
language sql
as $$
  select
    dc.id as chunk_id,
    dc.document_id,
    dc.content,
    dc.page_start,
    dc.page_end,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where (filter_document_id is null or dc.document_id = filter_document_id)
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;
