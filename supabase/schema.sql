-- Nuestro Mundial 2026 — ejecutar en SQL Editor de Supabase

-- ========== Usuarios (perfil público ligado a auth.users) ==========

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) >= 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profiles_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ========== Torneo (admin / resultados) ==========

create table if not exists bracket_assignments (
  match_id text primary key,
  home_team_code text,
  away_team_code text,
  updated_at timestamptz not null default now()
);

create table if not exists match_results (
  match_id text primary key,
  home_score int not null check (home_score >= 0),
  away_score int not null check (away_score >= 0),
  winner_code text,
  loser_code text,
  finished_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table bracket_assignments enable row level security;
alter table match_results enable row level security;

-- Lectura pública de partidos (anon + authenticated)
drop policy if exists "bracket_read_all" on bracket_assignments;
create policy "bracket_read_all"
  on bracket_assignments for select
  to anon, authenticated
  using (true);

drop policy if exists "results_read_all" on match_results;
create policy "results_read_all"
  on match_results for select
  to anon, authenticated
  using (true);

-- Escritura torneo: solo usuarios autenticados (ajusta a rol admin en producción)
drop policy if exists "bracket_write_auth" on bracket_assignments;
create policy "bracket_write_auth"
  on bracket_assignments for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "results_write_auth" on match_results;
create policy "results_write_auth"
  on match_results for all
  to authenticated
  using (true)
  with check (true);
