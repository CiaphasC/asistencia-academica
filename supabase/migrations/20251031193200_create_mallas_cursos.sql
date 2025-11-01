-- Academic structure: mallas curriculares & cursos

create table if not exists public.mallas_curriculares (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  codigo text not null unique,
  descripcion text,
  nivel text not null,
  duracion_semestres integer not null check (duracion_semestres > 0),
  creditos_totales integer not null check (creditos_totales >= 0),
  estado text not null default 'activo' check (estado in ('activo', 'inactivo', 'en_revision')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cursos (
  id uuid primary key default gen_random_uuid(),
  malla_id uuid not null references public.mallas_curriculares(id) on delete cascade,
  nombre text not null,
  codigo text not null unique,
  descripcion text,
  creditos integer not null check (creditos > 0),
  horas_semanales integer not null check (horas_semanales > 0),
  semestre integer not null check (semestre > 0),
  tipo text not null check (tipo in ('obligatorio', 'electivo', 'practica')),
  docente_id uuid references public.personas(id) on delete set null,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cursos_malla_id on public.cursos(malla_id);
create index if not exists idx_cursos_semestre on public.cursos(semestre);
create index if not exists idx_cursos_docente on public.cursos(docente_id);
create index if not exists idx_cursos_estado on public.cursos(estado);

drop trigger if exists mallas_set_updated_at on public.mallas_curriculares;
create trigger mallas_set_updated_at
  before update on public.mallas_curriculares
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists cursos_set_updated_at on public.cursos;
create trigger cursos_set_updated_at
  before update on public.cursos
  for each row
  execute function public.update_updated_at_column();
