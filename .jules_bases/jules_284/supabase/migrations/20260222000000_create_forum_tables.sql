-- Create table for forum questions
create table if not exists public.foro_preguntas (
  id uuid not null default gen_random_uuid(),
  modulo_id uuid not null references public.modulos(id) on delete cascade,
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  titulo text not null,
  contenido text not null,
  votos integer not null default 0,
  created_at timestamptz not null default now(),
  respuestas_count integer not null default 0,
  constraint foro_preguntas_pkey primary key (id)
);

-- Create table for forum answers
create table if not exists public.foro_respuestas (
  id uuid not null default gen_random_uuid(),
  pregunta_id uuid not null references public.foro_preguntas(id) on delete cascade,
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  contenido text not null,
  votos integer not null default 0,
  es_correcta boolean not null default false,
  created_at timestamptz not null default now(),
  constraint foro_respuestas_pkey primary key (id)
);

-- Create table for forum votes
create table if not exists public.foro_votos (
  id uuid not null default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null,
  item_tipo text not null check (item_tipo in ('pregunta', 'respuesta')),
  tipo text not null check (tipo in ('up', 'down')),
  created_at timestamptz not null default now(),
  constraint foro_votos_pkey primary key (id),
  constraint foro_votos_unique_vote unique (usuario_id, item_id, item_tipo)
);

-- Add RLS policies
alter table public.foro_preguntas enable row level security;
alter table public.foro_respuestas enable row level security;
alter table public.foro_votos enable row level security;

-- Policies for foro_preguntas
create policy "Public questions are viewable by everyone"
  on public.foro_preguntas for select
  using ( true );

create policy "Authenticated users can insert questions"
  on public.foro_preguntas for insert
  with check ( auth.uid() = usuario_id );

-- Policies for foro_respuestas
create policy "Public answers are viewable by everyone"
  on public.foro_respuestas for select
  using ( true );

create policy "Authenticated users can insert answers"
  on public.foro_respuestas for insert
  with check ( auth.uid() = usuario_id );

-- Policies for foro_votos
create policy "Public votes are viewable by everyone"
  on public.foro_votos for select
  using ( true );

create policy "Authenticated users can insert votes"
  on public.foro_votos for insert
  with check ( auth.uid() = usuario_id );

-- Function to update vote counts
create or replace function public.update_foro_votes()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    if (NEW.item_tipo = 'pregunta') then
      update public.foro_preguntas
      set votos = votos + (case when NEW.tipo = 'up' then 1 else -1 end)
      where id = NEW.item_id;
    elsif (NEW.item_tipo = 'respuesta') then
      update public.foro_respuestas
      set votos = votos + (case when NEW.tipo = 'up' then 1 else -1 end)
      where id = NEW.item_id;
    end if;
  elsif (TG_OP = 'DELETE') then
    if (OLD.item_tipo = 'pregunta') then
      update public.foro_preguntas
      set votos = votos - (case when OLD.tipo = 'up' then 1 else -1 end)
      where id = OLD.item_id;
    elsif (OLD.item_tipo = 'respuesta') then
      update public.foro_respuestas
      set votos = votos - (case when OLD.tipo = 'up' then 1 else -1 end)
      where id = OLD.item_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger for votes
create trigger update_foro_votes_trigger
after insert or delete on public.foro_votos
for each row execute procedure public.update_foro_votes();

-- Function to update answer count
create or replace function public.update_foro_respuestas_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.foro_preguntas
    set respuestas_count = respuestas_count + 1
    where id = NEW.pregunta_id;
  elsif (TG_OP = 'DELETE') then
    update public.foro_preguntas
    set respuestas_count = respuestas_count - 1
    where id = OLD.pregunta_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger for answer count
create trigger update_foro_respuestas_count_trigger
after insert or delete on public.foro_respuestas
for each row execute procedure public.update_foro_respuestas_count();
