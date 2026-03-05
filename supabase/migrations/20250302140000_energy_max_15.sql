-- Allow energy up to 15 (MAX_ENERGY) for Stars full restore and future balance
alter table public.players drop constraint if exists players_energy_check;
alter table public.players add constraint players_energy_check check (energy >= 0 and energy <= 15);
