-- Enrollment & attendance base tables

create table if not exists public.matriculas (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references public.personas(id) on delete cascade,
  curso_id uuid not null references public.cursos(id) on delete cascade,
  periodo_academico text not null,
  estado text not null default 'activo' check (estado in ('activo', 'retirado', 'completado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (estudiante_id, curso_id, periodo_academico)
);

create table if not exists public.asistencia (
  id uuid primary key default gen_random_uuid(),
  horario_id uuid not null references public.horarios(id) on delete cascade,
  estudiante_id uuid not null references public.personas(id) on delete cascade,
  fecha date not null,
  estado text not null check (estado in ('presente', 'ausente', 'tardanza', 'justificado')),
  hora_registro timestamptz default now(),
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (horario_id, estudiante_id, fecha)
);

create index if not exists idx_matriculas_estudiante on public.matriculas(estudiante_id);
create index if not exists idx_matriculas_curso on public.matriculas(curso_id);
create index if not exists idx_matriculas_estado on public.matriculas(estado);

create index if not exists idx_asistencia_horario on public.asistencia(horario_id);
create index if not exists idx_asistencia_estudiante on public.asistencia(estudiante_id);
create index if not exists idx_asistencia_fecha on public.asistencia(fecha);
create index if not exists idx_asistencia_estado on public.asistencia(estado);

drop trigger if exists matriculas_set_updated_at on public.matriculas;
create trigger matriculas_set_updated_at
  before update on public.matriculas
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists asistencia_set_updated_at on public.asistencia;
create trigger asistencia_set_updated_at
  before update on public.asistencia
  for each row
  execute function public.update_updated_at_column();

create or replace view public.asistencia_estadisticas as
select
  p.id as estudiante_id,
  p.nombre,
  p.apellido,
  c.id as curso_id,
  c.nombre as curso_nombre,
  c.codigo as curso_codigo,
  count(a.id) as total_clases,
  count(a.id) filter (where a.estado = 'presente') as presentes,
  count(a.id) filter (where a.estado = 'ausente') as ausentes,
  count(a.id) filter (where a.estado = 'tardanza') as tardanzas,
  count(a.id) filter (where a.estado = 'justificado') as justificados,
  coalesce(
    round(
      (count(a.id) filter (where a.estado = 'presente')::numeric / nullif(count(a.id), 0)) * 100,
      2
    ),
    0
  ) as porcentaje_asistencia
from public.personas p
join public.matriculas m on m.estudiante_id = p.id
join public.cursos c on c.id = m.curso_id
left join public.horarios h on h.curso_id = c.id
left join public.asistencia a on a.horario_id = h.id and a.estudiante_id = p.id
where p.role = 'estudiante'
group by p.id, p.nombre, p.apellido, c.id, c.nombre, c.codigo;
