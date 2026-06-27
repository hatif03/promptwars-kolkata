-- Saathi initial schema

create extension if not exists "uuid-ossp";

create type exam_type as enum (
  'NEET', 'JEE', 'CUET', 'CAT', 'GATE', 'UPSC', 'BOARDS', 'OTHER'
);

create type language_pref as enum ('en', 'hi', 'hinglish');

create type mood_type as enum (
  'happy', 'calm', 'anxious', 'angry', 'sad', 'tired', 'overwhelmed'
);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Student',
  exam_type exam_type default 'NEET',
  exam_year integer,
  language_pref language_pref default 'hinglish',
  days_to_exam integer,
  trust_level integer not null default 1 check (trust_level between 1 and 5),
  nudge_enabled boolean not null default false,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mood check-ins
create table public.mood_checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mood mood_type not null,
  tags text[] default '{}',
  note text,
  created_at timestamptz not null default now()
);

create index mood_checkins_user_created on public.mood_checkins(user_id, created_at desc);

-- Journal entries
create table public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  ai_reflection text,
  themes text[] default '{}',
  sentiment_signals jsonb default '{}',
  micro_step text,
  invitation_question text,
  created_at timestamptz not null default now()
);

create index journal_entries_user_created on public.journal_entries(user_id, created_at desc);

-- Chat
create table public.chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text default 'Conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_session on public.chat_messages(session_id, created_at);

-- Weekly insights
create table public.weekly_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  summary text not null,
  patterns jsonb default '[]',
  evidence_quotes jsonb default '[]',
  invitation_question text,
  created_at timestamptz not null default now(),
  unique(user_id, week_start)
);

-- Exercise completions
create table public.exercise_completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id text not null,
  trigger_context text,
  helpful_rating integer check (helpful_rating between 1 and 5),
  created_at timestamptz not null default now()
);

create table public.coping_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id text not null,
  effectiveness_score numeric(3,2) default 0.5,
  use_count integer default 0,
  updated_at timestamptz not null default now(),
  unique(user_id, exercise_id)
);

-- Crisis events (minimal logging, no journal content)
create table public.crisis_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  severity text not null,
  source text not null,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Student'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger chat_sessions_updated before update on public.chat_sessions
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.mood_checkins enable row level security;
alter table public.journal_entries enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.weekly_insights enable row level security;
alter table public.exercise_completions enable row level security;
alter table public.coping_preferences enable row level security;
alter table public.crisis_events enable row level security;

create policy "Users manage own profile"
  on public.profiles for all using (auth.uid() = id);

create policy "Users manage own moods"
  on public.mood_checkins for all using (auth.uid() = user_id);

create policy "Users manage own journals"
  on public.journal_entries for all using (auth.uid() = user_id);

create policy "Users manage own chat sessions"
  on public.chat_sessions for all using (auth.uid() = user_id);

create policy "Users manage own chat messages"
  on public.chat_messages for all using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users manage own insights"
  on public.weekly_insights for all using (auth.uid() = user_id);

create policy "Users manage own exercise completions"
  on public.exercise_completions for all using (auth.uid() = user_id);

create policy "Users manage own coping preferences"
  on public.coping_preferences for all using (auth.uid() = user_id);

create policy "Users insert own crisis events"
  on public.crisis_events for insert with check (auth.uid() = user_id);

create policy "Users read own crisis events"
  on public.crisis_events for select using (auth.uid() = user_id);
