-- Enable vector extension
create extension if not exists vector;

-- Create table
create table if not exists semantic_cache (
  id uuid primary key default gen_random_uuid(),
  query_text text not null,
  query_embedding vector(1536) not null,
  response_text text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Index
create index if not exists semantic_cache_embedding_idx
on semantic_cache
using hnsw (query_embedding vector_cosine_ops);

-- RLS
alter table semantic_cache enable row level security;

-- Function to match
create or replace function match_cached_response (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  response_text text,
  similarity float,
  metadata jsonb
)
language plpgsql
as $$
begin
  return query
  select
    semantic_cache.id,
    semantic_cache.response_text,
    1 - (semantic_cache.query_embedding <=> match_cached_response.query_embedding) as similarity,
    semantic_cache.metadata
  from semantic_cache
  where 1 - (semantic_cache.query_embedding <=> match_cached_response.query_embedding) > match_threshold
  order by semantic_cache.query_embedding <=> match_cached_response.query_embedding
  limit match_count;
end;
$$;
