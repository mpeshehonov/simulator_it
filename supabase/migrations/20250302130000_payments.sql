-- Payments log for Telegram Stars (idempotency + audit)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null,
  product_type text not null check (product_type in ('energy_boost', 'full_restore')),
  amount_stars int not null check (amount_stars > 0),
  telegram_payment_charge_id text unique,
  created_at timestamptz not null default now()
);

create index idx_payments_telegram_id on public.payments(telegram_id);
create index idx_payments_charge_id on public.payments(telegram_payment_charge_id) where telegram_payment_charge_id is not null;

alter table public.payments enable row level security;

-- API uses service role; no user-facing RLS policies for now
