-- Seed class sessions and attendance flags

with base_sesiones as (
  select
    h.curso_id,
    h.id as horario_id,
    generate_series(date_trunc('week', now())::date, date_trunc('week', now())::date + interval '21 days', interval '7 days')::date as fecha,
    h.hora_inicio,
    h.hora_fin
  from public.horarios h
  where h.estado = 'activo'
)
insert into public.sesiones_clase (curso_id, horario_id, fecha_sesion, hora_inicio, hora_fin, numero_sesion, estado)
select
  bs.curso_id,
  bs.horario_id,
  bs.fecha,
  bs.hora_inicio,
  bs.hora_fin,
  row_number() over (partition by bs.curso_id order by bs.fecha) as numero_sesion,
  case when bs.fecha = date_trunc('day', now())::date then 'en_curso' else 'programada' end
from base_sesiones bs
on conflict (curso_id, fecha_sesion, hora_inicio) do nothing;

insert into public.asistencias (sesion_id, estudiante_id, asistio, fecha_registro)
select
  sc.id,
  m.estudiante_id,
  (random() > 0.15),
  now()
from public.sesiones_clase sc
join public.matriculas m on m.curso_id = sc.curso_id
where sc.fecha_sesion <= date_trunc('day', now())::date
on conflict (sesion_id, estudiante_id) do nothing;
