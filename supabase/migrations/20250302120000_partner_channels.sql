-- Партнёрские каналы для задания «Подписка на каналы»
create table if not exists public.partner_channels (
  id text primary key,
  name text not null,
  url text not null,
  exp_reward int not null default 8,
  sort_order int not null default 0
);

-- Подписки игроков (какой канал уже «подтверждён» — награда выдана)
create table if not exists public.player_channel_subscriptions (
  player_id uuid not null references public.players(id) on delete cascade,
  channel_id text not null references public.partner_channels(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (player_id, channel_id)
);

create index idx_player_channel_subscriptions_player on public.player_channel_subscriptions(player_id);

-- Сид каналов (можно управлять через админку позже)
insert into public.partner_channels (id, name, url, exp_reward, sort_order) values
  ('devlife', 'DevLife', 'https://t.me/devlife_ch', 8, 0),
  ('frontend_ru', 'Frontend на русском', 'https://t.me/frontend_ru', 8, 1),
  ('js_ru', 'JavaScript', 'https://t.me/javascript_ru', 8, 2)
on conflict (id) do nothing;

-- RLS
alter table public.partner_channels enable row level security;
alter table public.player_channel_subscriptions enable row level security;

-- Все могут читать каналы
create policy "partner_channels_select" on public.partner_channels for select using (true);

-- Игрок видит только свои подписки (политики по auth позже)
create policy "player_channel_subscriptions_all" on public.player_channel_subscriptions for all using (true);
