create table if not exists public.mission_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  mission_id text not null,
  current_step_id text,
  history jsonb default '[]'::jsonb,
  score numeric default 0,
  status text default 'started', -- 'started', 'completed', 'failed'
  updated_at timestamptz default now(),
  unique(user_id, mission_id)
);

-- Enable RLS
alter table public.mission_progress enable row level security;

-- Policies
create policy "Users can view their own progress"
  on public.mission_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.mission_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.mission_progress for update
  using (auth.uid() = user_id);
