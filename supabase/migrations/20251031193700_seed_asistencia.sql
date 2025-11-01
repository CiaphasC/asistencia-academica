-- Seed enrollments and sample attendance

with estudiantes as (
  select id, email from public.personas where role = 'estudiante'
),
cursos_base as (
  select id, codigo from public.cursos
)
insert into public.matriculas (estudiante_id, curso_id, periodo_academico, estado)
select e.id, c.id, '2025-I', 'activo'
from estudiantes e
cross join lateral (
  select id
  from cursos_base
  where codigo in ('ISW-101', 'ISW-204')
  limit 2
) as c(id)
on conflict (estudiante_id, curso_id, periodo_academico) do nothing;

insert into public.asistencia (horario_id, estudiante_id, fecha, estado, hora_registro, observaciones)
select
  h.id,
  m.estudiante_id,
  date_trunc('day', now())::date - (row_number() over (partition by m.estudiante_id order by h.dia_semana))::int,
  (array['presente', 'ausente', 'tardanza'])[1 + (random() * 2)::int],
  now(),
  null
from public.matriculas m
join public.horarios h on h.curso_id = m.curso_id
where h.estado = 'activo'
limit 25
on conflict (horario_id, estudiante_id, fecha) do nothing;
