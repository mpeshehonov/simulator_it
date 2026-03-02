-- Players table for DevLife 8-bit
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  profession text not null check (profession in ('frontend', 'backend', 'qa', 'devops', 'uiux')),
  level int not null default 0 check (level >= 0 and level <= 5),
  exp int not null default 0,
  money int not null default 0,
  reputation int not null default 0,
  energy int not null default 10 check (energy >= 0 and energy <= 10),
  energy_updated_at timestamptz not null default now(),
  skills jsonb not null default '{}',
  last_interview_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.players enable row level security;

-- TODO: policies based on telegram_id from auth context

create index idx_players_telegram_id on public.players(telegram_id);
