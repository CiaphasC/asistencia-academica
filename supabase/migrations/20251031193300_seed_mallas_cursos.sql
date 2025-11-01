-- Seed data for mallas and cursos (idempotent)

insert into public.mallas_curriculares (nombre, codigo, descripcion, nivel, duracion_semestres, creditos_totales, estado)
values
  ('Ingeniería de Software', 'ISW-001', 'Plan de estudios orientado al desarrollo de software', 'pregrado', 10, 180, 'activo'),
  ('Administración de Empresas', 'ADM-001', 'Gestión y administración de organizaciones', 'pregrado', 8, 160, 'activo')
on conflict (codigo) do update
set descripcion = excluded.descripcion,
    estado = excluded.estado;

insert into public.cursos (malla_id, nombre, codigo, descripcion, creditos, horas_semanales, semestre, tipo, docente_id, estado)
select
  m.id,
  c.nombre,
  c.codigo,
  c.descripcion,
  c.creditos,
  c.horas_semanales,
  c.semestre,
  c.tipo,
  p.id as docente_id,
  'activo'
from (
  values
    ('Ingeniería de Software', 'Programación I', 'ISW-101', 'Fundamentos de programación estructurada', 6, 6, 1, 'obligatorio', 'german.torres@example.com'),
    ('Ingeniería de Software', 'Bases de Datos', 'ISW-204', 'Modelado y administración de bases de datos', 5, 5, 3, 'obligatorio', 'lucia.paredes@example.com'),
    ('Administración de Empresas', 'Contabilidad General', 'ADM-110', 'Principios contables y estados financieros', 5, 4, 2, 'obligatorio', 'german.torres@example.com'),
    ('Administración de Empresas', 'Marketing Estratégico', 'ADM-205', 'Estrategias de marketing y posicionamiento', 4, 4, 4, 'electivo', 'lucia.paredes@example.com')
) as c(malla_nombre, nombre, codigo, descripcion, creditos, horas_semanales, semestre, tipo, docente_email)
join public.mallas_curriculares m on m.nombre = c.malla_nombre
left join public.personas p on lower(p.email) = lower(c.docente_email)
on conflict (codigo) do update
set descripcion = excluded.descripcion,
    docente_id = excluded.docente_id,
    estado = excluded.estado;
