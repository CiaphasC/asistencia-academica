-- Insert sample matriculas (enrollments)
INSERT INTO matriculas (estudiante_id, curso_id, periodo_academico, estado)
SELECT 
  e.id,
  c.id,
  '2024-1',
  'activo'
FROM personas e
CROSS JOIN cursos c
WHERE e.tipo = 'estudiante' 
  AND e.documento IN ('EST001', 'EST002', 'EST003', 'EST004')
  AND c.codigo IN ('PROG-101', 'MAT-102', 'PROG-201');

-- Insert sample asistencia records
INSERT INTO asistencia (horario_id, estudiante_id, fecha, estado, hora_registro)
SELECT 
  h.id,
  m.estudiante_id,
  CURRENT_DATE - INTERVAL '7 days',
  'presente',
  CURRENT_TIMESTAMP - INTERVAL '7 days'
FROM horarios h
JOIN matriculas m ON h.curso_id = m.curso_id
WHERE h.periodo_academico = '2024-1'
LIMIT 20;

INSERT INTO asistencia (horario_id, estudiante_id, fecha, estado, hora_registro)
SELECT 
  h.id,
  m.estudiante_id,
  CURRENT_DATE - INTERVAL '5 days',
  CASE 
    WHEN random() < 0.8 THEN 'presente'
    WHEN random() < 0.9 THEN 'tardanza'
    ELSE 'ausente'
  END,
  CURRENT_TIMESTAMP - INTERVAL '5 days'
FROM horarios h
JOIN matriculas m ON h.curso_id = m.curso_id
WHERE h.periodo_academico = '2024-1'
LIMIT 20;

INSERT INTO asistencia (horario_id, estudiante_id, fecha, estado, hora_registro)
SELECT 
  h.id,
  m.estudiante_id,
  CURRENT_DATE - INTERVAL '3 days',
  CASE 
    WHEN random() < 0.85 THEN 'presente'
    WHEN random() < 0.95 THEN 'tardanza'
    ELSE 'ausente'
  END,
  CURRENT_TIMESTAMP - INTERVAL '3 days'
FROM horarios h
JOIN matriculas m ON h.curso_id = m.curso_id
WHERE h.periodo_academico = '2024-1'
LIMIT 20;
