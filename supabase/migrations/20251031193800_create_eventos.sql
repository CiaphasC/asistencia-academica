-- Eventos académicos y participantes

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  tipo text not null check (tipo in ('seminario', 'capacitacion', 'taller', 'conferencia', 'otro')),
  fecha_inicio timestamptz not null,
  fecha_fin timestamptz not null,
  ubicacion text,
  capacidad_maxima integer check (capacidad_maxima is null or capacidad_maxima > 0),
  organizador_id uuid references public.personas(id) on delete set null,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo', 'cancelado', 'finalizado')),
  enlace_publico text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.participantes_eventos (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  nombre text not null,
  email citext not null,
  telefono text,
  institucion text,
  asistio boolean not null default false,
  fecha_registro timestamptz not null default now(),
  unique (evento_id, email)
);

create index if not exists idx_eventos_estado on public.eventos(estado);
create index if not exists idx_eventos_organizador on public.eventos(organizador_id);
create index if not exists idx_participantes_evento on public.participantes_eventos(evento_id);

drop trigger if exists eventos_set_updated_at on public.eventos;
create trigger eventos_set_updated_at
  before update on public.eventos
  for each row
  execute function public.update_updated_at_column();

create or replace view public.evento_participantes as
select
  pe.id,
  pe.evento_id,
  pe.nombre,
  pe.email,
  pe.telefono,
  pe.institucion,
  pe.asistio,
  pe.fecha_registro
from public.participantes_eventos pe;
