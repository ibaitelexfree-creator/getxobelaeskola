-- Create regatta_matches table
create table regatta_matches (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  host_id uuid references auth.users(id),
  status text check (status in ('waiting', 'racing', 'finished')) default 'waiting',
  config jsonb default '{}',
  created_at timestamptz default now()
);

-- Enable RLS
alter table regatta_matches enable row level security;

-- Policies for regatta_matches
create policy "Matches are viewable by everyone"
  on regatta_matches for select
  using (true);

create policy "Authenticated users can create matches"
  on regatta_matches for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "Hosts can update their matches"
  on regatta_matches for update
  using (auth.uid() = host_id);


-- Create regatta_participants table
create table regatta_participants (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references regatta_matches(id) on delete cascade,
  user_id uuid references auth.users(id),
  username text,
  score int default 0,
  joined_at timestamptz default now(),
  finished_at timestamptz,
  unique(match_id, user_id)
);

-- Enable RLS
alter table regatta_participants enable row level security;

-- Policies for regatta_participants
create policy "Participants are viewable by everyone"
  on regatta_participants for select
  using (true);

create policy "Authenticated users can join matches"
  on regatta_participants for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own participant record"
  on regatta_participants for update
  using (auth.uid() = user_id);
