-- Additional persona metadata & validation workflow

alter table public.personas
  add column if not exists validado boolean default false,
  add column if not exists fecha_validacion timestamptz,
  add column if not exists validado_por uuid references public.personas(id) on delete set null;

create table if not exists public.solicitudes_validacion (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid not null references public.personas(id) on delete cascade,
  tipo_solicitud text not null check (tipo_solicitud in ('profesor', 'estudiante', 'admin')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  motivo_rechazo text,
  solicitado_por uuid references public.personas(id) on delete set null,
  fecha_solicitud timestamptz not null default now(),
  fecha_resolucion timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_solicitudes_persona on public.solicitudes_validacion(persona_id);
create index if not exists idx_solicitudes_estado on public.solicitudes_validacion(estado);
create index if not exists idx_solicitudes_tipo on public.solicitudes_validacion(tipo_solicitud);

alter table public.personas enable row level security;

drop policy if exists "Users can view own profile" on public.personas;
drop policy if exists "Admins can view all profiles" on public.personas;
drop policy if exists "Users can update own profile" on public.personas;
drop policy if exists "Admins can update all profiles" on public.personas;
drop policy if exists "Users can insert own profile" on public.personas;

create policy "Users can view own profile"
  on public.personas
  for select
  using (auth.uid() = auth_id);

create policy "Admins can view personas"
  on public.personas
  for select
  using (
    exists (
      select 1
      from public.personas admin_p
      where admin_p.auth_id = auth.uid()
        and admin_p.role = 'admin'
    )
  );

create policy "Users can insert own profile"
  on public.personas
  for insert
  with check (auth.uid() = auth_id);

create policy "Users can update own profile"
  on public.personas
  for update
  using (auth.uid() = auth_id)
  with check (auth.uid() = auth_id);

create policy "Admins can manage personas"
  on public.personas
  for all
  using (
    exists (
      select 1
      from public.personas admin_p
      where admin_p.auth_id = auth.uid()
        and admin_p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.personas admin_p
      where admin_p.auth_id = auth.uid()
        and admin_p.role = 'admin'
    )
  );
