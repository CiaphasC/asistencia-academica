-- Sample schedules for existing courses

insert into public.horarios (curso_id, dia_semana, hora_inicio, hora_fin, aula, modalidad, estado)
select
  c.id,
  s.dia_semana,
  s.hora_inicio::time,
  s.hora_fin::time,
  s.aula,
  s.modalidad,
  'activo'
from (
  values
    ('ISW-101', 1, '08:00', '10:00', 'Lab 201', 'presencial'),
    ('ISW-101', 3, '08:00', '10:00', 'Lab 201', 'presencial'),
    ('ISW-204', 2, '10:00', '12:00', 'Aula 305', 'presencial'),
    ('ADM-110', 4, '09:00', '11:00', 'Aula 110', 'presencial'),
    ('ADM-205', 5, '11:00', '13:00', 'Aula 210', 'presencial')
) as s(codigo, dia_semana, hora_inicio, hora_fin, aula, modalidad)
join public.cursos c on c.codigo = s.codigo
on conflict (curso_id, dia_semana, hora_inicio, hora_fin) do nothing;
