-- Seed events and participants

with organizer as (
  select id from public.personas where email = 'carolina.mendoza@example.com' limit 1
)
insert into public.eventos (nombre, descripcion, tipo, fecha_inicio, fecha_fin, ubicacion, capacidad_maxima, organizador_id, estado, enlace_publico)
select
  e.nombre,
  e.descripcion,
  e.tipo,
  e.fecha_inicio,
  e.fecha_fin,
  e.ubicacion,
  e.capacidad_maxima,
  o.id,
  e.estado,
  e.enlace_publico
from organizer o
cross join (
  values
    ('Seminario de Transformación Digital', 'Buenas prácticas para la digitalización educativa', 'seminario', now() + interval '15 days', now() + interval '15 days 2 hours', 'Auditorio Principal', 120, 'activo', 'evento-transformacion-digital'),
    ('Taller de Liderazgo', 'Sesión práctica para líderes estudiantiles', 'taller', now() + interval '25 days', now() + interval '25 days 4 hours', 'Sala 3B', 50, 'activo', 'evento-liderazgo'),
    ('Capacitación en Analítica', 'Uso de datos para la toma de decisiones', 'capacitacion', now() + interval '35 days', now() + interval '35 days 3 hours', 'Laboratorio de Datos', 40, 'activo', 'evento-analitica')
) as e(nombre, descripcion, tipo, fecha_inicio, fecha_fin, ubicacion, capacidad_maxima, estado, enlace_publico)
on conflict (enlace_publico) do update
set descripcion = excluded.descripcion,
    estado = excluded.estado;

insert into public.participantes_eventos (evento_id, nombre, email, telefono, institucion, asistio)
select
  ev.id,
  p.nombre,
  p.email,
  '+593' || (floor(random() * 9000000) + 1000000)::text,
  'Universidad Nacional',
  false
from public.personas p
join public.eventos ev on ev.nombre = 'Seminario de Transformación Digital'
where p.role = 'estudiante'
limit 10
on conflict (evento_id, email) do nothing;
