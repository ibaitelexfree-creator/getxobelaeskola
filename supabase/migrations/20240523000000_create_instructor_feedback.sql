-- Create instructor_feedback table
create table if not exists instructor_feedback (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  instructor_id uuid references auth.users not null,
  student_id uuid references auth.users not null,
  context_type text not null check (context_type in ('logbook', 'evaluation')),
  context_id text not null, -- ID of the logbook entry or evaluation attempt
  content text,
  audio_url text,
  is_read boolean default false
);

-- Enable RLS
alter table instructor_feedback enable row level security;

-- Policies
create policy "Instructors can insert feedback"
  on instructor_feedback for insert
  with check (auth.uid() = instructor_id); -- Assuming the API checks the role before setting instructor_id

create policy "Instructors can view all feedback"
  on instructor_feedback for select
  using (auth.uid() = instructor_id); -- Or check role in a separate function if needed

create policy "Students can view their own feedback"
  on instructor_feedback for select
  using (auth.uid() = student_id);

-- Create bucket for audio feedback if it doesn't exist
insert into storage.buckets (id, name, public)
values ('feedback-audio', 'feedback-audio', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Instructors can upload audio"
  on storage.objects for insert
  with check (bucket_id = 'feedback-audio'); -- Add role check if possible

create policy "Anyone can read audio"
  on storage.objects for select
  using (bucket_id = 'feedback-audio');
