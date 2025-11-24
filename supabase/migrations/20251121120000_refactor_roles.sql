-- Migration: Refactor roles into a separate table
-- Date: 2025-11-21

-- 1. Create roles table
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable RLS on roles
alter table public.roles enable row level security;

create policy "Roles are viewable by everyone" 
  on public.roles for select 
  using (true);

-- 3. Insert default roles
insert into public.roles (name, description) values
  ('admin', 'Administrador del sistema con acceso total'),
  ('docente', 'Profesor o docente encargado de cursos'),
  ('estudiante', 'Alumno registrado en el sistema')
on conflict (name) do nothing;

-- 4. Update public.auth_users
alter table public.auth_users add column if not exists role_id uuid references public.roles(id);

-- Migrate data for auth_users
do $$
begin
  update public.auth_users au
  set role_id = r.id
  from public.roles r
  where au.role = r.name;
end $$;

-- 5. Update public.personas
alter table public.personas add column if not exists role_id uuid references public.roles(id);

-- Migrate data for personas
do $$
begin
  update public.personas p
  set role_id = r.id
  from public.roles r
  where p.role = r.name;
end $$;

-- 6. Update is_admin function to use role_id
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.personas p
    join public.roles r on p.role_id = r.id
    where p.auth_id = auth.uid()
      and r.name = 'admin'
  );
$$;

-- 7. Make columns mandatory and drop old ones (CAUTION: This is a breaking change)
-- We will keep the old columns for now but make them nullable to avoid breaking existing code immediately,
-- but we should ideally drop them. Given the user request "seria mejor tener una tabla", I'll proceed with full refactor.

-- Update auth_users
alter table public.auth_users alter column role drop not null;
-- alter table public.auth_users drop column role; -- Uncomment to fully drop

-- Update personas
alter table public.personas alter column role drop not null;
-- alter table public.personas drop column role; -- Uncomment to fully drop

-- Add triggers to keep updated_at working for roles
create trigger roles_set_updated_at
  before update on public.roles
  for each row
  execute function public.update_updated_at_column();
