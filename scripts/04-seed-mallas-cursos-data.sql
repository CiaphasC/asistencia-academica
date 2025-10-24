-- Insert sample mallas curriculares
INSERT INTO mallas_curriculares (nombre, codigo, descripcion, nivel, duracion_semestres, creditos_totales, estado) VALUES
('Ingeniería en Sistemas', 'ING-SIS-2024', 'Programa de ingeniería enfocado en desarrollo de software y sistemas computacionales', 'Pregrado', 10, 240, 'activo'),
('Administración de Empresas', 'ADM-EMP-2024', 'Programa de administración con énfasis en gestión empresarial', 'Pregrado', 8, 200, 'activo'),
('Psicología Clínica', 'PSI-CLI-2024', 'Programa de psicología con especialización en clínica', 'Pregrado', 10, 220, 'activo');

-- Insert sample cursos for Ingeniería en Sistemas
INSERT INTO cursos (malla_id, nombre, codigo, descripcion, creditos, horas_semanales, semestre, tipo, profesor_id, estado)
SELECT 
  m.id,
  'Programación I',
  'PROG-101',
  'Introducción a la programación con Python',
  4,
  6,
  1,
  'obligatorio',
  p.id,
  'activo'
FROM mallas_curriculares m
CROSS JOIN personas p
WHERE m.codigo = 'ING-SIS-2024' AND p.documento = 'PROF001';

INSERT INTO cursos (malla_id, nombre, codigo, descripcion, creditos, horas_semanales, semestre, tipo, profesor_id, estado)
SELECT 
  m.id,
  'Matemáticas Discretas',
  'MAT-102',
  'Fundamentos matemáticos para ciencias de la computación',
  4,
  6,
  1,
  'obligatorio',
  p.id,
  'activo'
FROM mallas_curriculares m
CROSS JOIN personas p
WHERE m.codigo = 'ING-SIS-2024' AND p.documento = 'PROF002';

INSERT INTO cursos (malla_id, nombre, codigo, descripcion, creditos, horas_semanales, semestre, tipo, profesor_id, estado)
SELECT 
  m.id,
  'Estructuras de Datos',
  'PROG-201',
  'Estructuras de datos fundamentales y algoritmos',
  4,
  6,
  2,
  'obligatorio',
  p.id,
  'activo'
FROM mallas_curriculares m
CROSS JOIN personas p
WHERE m.codigo = 'ING-SIS-2024' AND p.documento = 'PROF001';

INSERT INTO cursos (malla_id, nombre, codigo, descripcion, creditos, horas_semanales, semestre, tipo, profesor_id, estado)
SELECT 
  m.id,
  'Base de Datos',
  'BD-201',
  'Diseño y gestión de bases de datos relacionales',
  4,
  6,
  3,
  'obligatorio',
  p.id,
  'activo'
FROM mallas_curriculares m
CROSS JOIN personas p
WHERE m.codigo = 'ING-SIS-2024' AND p.documento = 'PROF003';

-- Insert sample cursos for Administración de Empresas
INSERT INTO cursos (malla_id, nombre, codigo, descripcion, creditos, horas_semanales, semestre, tipo, profesor_id, estado)
SELECT 
  m.id,
  'Fundamentos de Administración',
  'ADM-101',
  'Principios básicos de la administración empresarial',
  3,
  4,
  1,
  'obligatorio',
  p.id,
  'activo'
FROM mallas_curriculares m
CROSS JOIN personas p
WHERE m.codigo = 'ADM-EMP-2024' AND p.documento = 'PROF004';

INSERT INTO cursos (malla_id, nombre, codigo, descripcion, creditos, horas_semanales, semestre, tipo, profesor_id, estado)
SELECT 
  m.id,
  'Contabilidad General',
  'CONT-101',
  'Introducción a la contabilidad financiera',
  3,
  4,
  1,
  'obligatorio',
  p.id,
  'activo'
FROM mallas_curriculares m
CROSS JOIN personas p
WHERE m.codigo = 'ADM-EMP-2024' AND p.documento = 'PROF002';
