-- Run this in your Supabase SQL editor before starting the app.

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  base_resume text,          -- user's master resume text
  created_at timestamptz default now()
);

create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  job_title text not null,
  company text,
  job_description text not null,
  resume_used text,
  status text default 'applied'
    check (status in ('applied','interview','offer','rejected')),
  match_score integer,
  matched_skills text[],
  missing_skills text[],
  match_summary text,
  tailored_resume text,
  cover_letter text,
  applied_date date default current_date,
  next_action_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists skill_tags (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references applications(id) on delete cascade,
  skill text not null,
  type text check (type in ('matched','missing'))
);

-- Row Level Security
alter table applications enable row level security;
alter table profiles enable row level security;
alter table skill_tags enable row level security;

create policy "Own applications only"
  on applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Own profile only"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Own skill tags only"
  on skill_tags for all
  using (exists (select 1 from applications a where a.id = application_id and a.user_id = auth.uid()))
  with check (exists (select 1 from applications a where a.id = application_id and a.user_id = auth.uid()));

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger set_updated_at
before update on applications
for each row execute function update_updated_at();

-- Auto-create a profile row when a user signs up (applications.user_id references profiles)
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();
