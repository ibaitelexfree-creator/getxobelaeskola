create table if not exists public.user_devices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  fcm_token text not null,
  platform text,
  last_active timestamp with time zone default now(),
  unique(user_id, fcm_token)
);

alter table public.user_devices enable row level security;

create policy "Users can view their own devices"
  on public.user_devices for select
  using (auth.uid() = user_id);

create policy "Users can insert their own devices"
  on public.user_devices for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own devices"
  on public.user_devices for update
  using (auth.uid() = user_id);

create policy "Users can delete their own devices"
  on public.user_devices for delete
  using (auth.uid() = user_id);
