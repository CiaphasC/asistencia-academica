-- Personas core schema
-- Run with Supabase default role (service role is not required here)

create extension if not exists "citext";

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.personas (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete set null,
  nombre text not null,
  apellido text not null,
  email citext not null unique,
  telefono text,
  cedula text not null unique,
  documento text generated always as (cedula) stored,
  tipo text not null check (tipo in ('estudiante', 'profesor', 'administrador')),
  role text not null check (role in ('estudiante', 'docente', 'admin')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'activo', 'inactivo', 'suspendido')),
  genero text,
  fecha_nacimiento date,
  direccion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_personas_tipo on public.personas(tipo);
create index if not exists idx_personas_estado on public.personas(estado);
create index if not exists idx_personas_auth_id on public.personas(auth_id);

drop trigger if exists personas_set_updated_at on public.personas;
create trigger personas_set_updated_at
  before update on public.personas
  for each row
  execute function public.update_updated_at_column();
