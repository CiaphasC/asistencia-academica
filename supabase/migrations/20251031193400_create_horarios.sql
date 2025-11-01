-- Horarios académicos

create table if not exists public.horarios (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin time not null,
  aula text,
  modalidad text default 'presencial',
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (curso_id, dia_semana, hora_inicio, hora_fin)
);

create index if not exists idx_horarios_curso on public.horarios(curso_id);
create index if not exists idx_horarios_dia on public.horarios(dia_semana);
create index if not exists idx_horarios_estado on public.horarios(estado);

drop trigger if exists horarios_set_updated_at on public.horarios;
create trigger horarios_set_updated_at
  before update on public.horarios
  for each row
  execute function public.update_updated_at_column();
