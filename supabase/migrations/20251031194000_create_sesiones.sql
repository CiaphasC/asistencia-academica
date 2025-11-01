-- Sesiones de clase y asistencias por sesión

create table if not exists public.sesiones_clase (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  horario_id uuid references public.horarios(id) on delete set null,
  fecha_sesion date not null,
  hora_inicio time not null,
  hora_fin time not null,
  numero_sesion integer not null default 1,
  estado text not null default 'programada' check (estado in ('programada', 'en_curso', 'finalizada', 'cancelada')),
  qr_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (curso_id, fecha_sesion, hora_inicio)
);

create table if not exists public.asistencias (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid not null references public.sesiones_clase(id) on delete cascade,
  estudiante_id uuid not null references public.personas(id) on delete cascade,
  asistio boolean not null default false,
  fecha_registro timestamptz not null default now(),
  unique (sesion_id, estudiante_id)
);

create index if not exists idx_sesiones_curso on public.sesiones_clase(curso_id);
create index if not exists idx_sesiones_horario on public.sesiones_clase(horario_id);
create index if not exists idx_sesiones_estado on public.sesiones_clase(estado);

create index if not exists idx_asistencias_sesion on public.asistencias(sesion_id);
create index if not exists idx_asistencias_estudiante on public.asistencias(estudiante_id);

drop trigger if exists sesiones_set_updated_at on public.sesiones_clase;
create trigger sesiones_set_updated_at
  before update on public.sesiones_clase
  for each row
  execute function public.update_updated_at_column();
