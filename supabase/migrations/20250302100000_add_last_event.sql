-- Последнее событие игрока (для отображения при входе)
alter table public.players
  add column if not exists last_event jsonb default null;

comment on column public.players.last_event is 'Last game event { title, description } for display on load';
