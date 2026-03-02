-- Ограничение на отдых: кулдаун между нажатиями
alter table public.players
  add column if not exists last_rest_at timestamptz default null;

comment on column public.players.last_rest_at is 'When the player last used the Rest action (for cooldown)';
