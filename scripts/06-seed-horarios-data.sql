-- Insert sample horarios
INSERT INTO horarios (curso_id, profesor_id, aula, dia_semana, hora_inicio, hora_fin, periodo_academico, estado)
SELECT 
  c.id,
  c.profesor_id,
  'A-101',
  1,
  '08:00:00',
  '10:00:00',
  '2024-1',
  'activo'
FROM cursos c
WHERE c.codigo = 'PROG-101';

INSERT INTO horarios (curso_id, profesor_id, aula, dia_semana, hora_inicio, hora_fin, periodo_academico, estado)
SELECT 
  c.id,
  c.profesor_id,
  'A-102',
  1,
  '10:00:00',
  '12:00:00',
  '2024-1',
  'activo'
FROM cursos c
WHERE c.codigo = 'MAT-102';

INSERT INTO horarios (curso_id, profesor_id, aula, dia_semana, hora_inicio, hora_fin, periodo_academico, estado)
SELECT 
  c.id,
  c.profesor_id,
  'A-101',
  3,
  '08:00:00',
  '10:00:00',
  '2024-1',
  'activo'
FROM cursos c
WHERE c.codigo = 'PROG-201';

INSERT INTO horarios (curso_id, profesor_id, aula, dia_semana, hora_inicio, hora_fin, periodo_academico, estado)
SELECT 
  c.id,
  c.profesor_id,
  'LAB-201',
  3,
  '14:00:00',
  '16:00:00',
  '2024-1',
  'activo'
FROM cursos c
WHERE c.codigo = 'BD-201';

INSERT INTO horarios (curso_id, profesor_id, aula, dia_semana, hora_inicio, hora_fin, periodo_academico, estado)
SELECT 
  c.id,
  c.profesor_id,
  'B-101',
  2,
  '08:00:00',
  '10:00:00',
  '2024-1',
  'activo'
FROM cursos c
WHERE c.codigo = 'ADM-101';

INSERT INTO horarios (curso_id, profesor_id, aula, dia_semana, hora_inicio, hora_fin, periodo_academico, estado)
SELECT 
  c.id,
  c.profesor_id,
  'B-102',
  4,
  '10:00:00',
  '12:00:00',
  '2024-1',
  'activo'
FROM cursos c
WHERE c.codigo = 'CONT-101';
