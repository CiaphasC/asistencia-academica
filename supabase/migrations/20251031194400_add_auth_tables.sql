-- Auth profiles linked to Supabase Auth

create table if not exists public.auth_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  role text not null check (role in ('estudiante', 'docente', 'admin')),
  validado boolean not null default false,
  estado text not null default 'inactivo' check (estado in ('activo', 'inactivo', 'suspendido')),
  razon_rechazo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_auth_users_email on public.auth_users(email);
create index if not exists idx_auth_users_role on public.auth_users(role);

drop trigger if exists auth_users_set_updated_at on public.auth_users;
create trigger auth_users_set_updated_at
  before update on public.auth_users
  for each row
  execute function public.update_updated_at_column();

alter table public.auth_users enable row level security;

drop policy if exists "Users can view their own auth data" on public.auth_users;
drop policy if exists "Admins can view all auth data" on public.auth_users;
drop policy if exists "Admins can update auth data" on public.auth_users;
drop policy if exists "Users can insert auth data" on public.auth_users;
drop policy if exists "Service role auth full access" on public.auth_users;

create policy "Users select own auth row"
  on public.auth_users
  for select
  using (auth.uid() = id);

create policy "Users insert own auth row"
  on public.auth_users
  for insert
  with check (auth.uid() = id);

create policy "Users update own auth row"
  on public.auth_users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins manage auth users"
  on public.auth_users
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Service role auth full access"
  on public.auth_users
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
