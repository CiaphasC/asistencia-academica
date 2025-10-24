-- Create asistencia table
CREATE TABLE IF NOT EXISTS asistencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horario_id UUID REFERENCES horarios(id) ON DELETE CASCADE,
  estudiante_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('presente', 'ausente', 'tardanza', 'justificado')),
  hora_registro TIMESTAMP WITH TIME ZONE,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(horario_id, estudiante_id, fecha)
);

-- Create matriculas table (student enrollments)
CREATE TABLE IF NOT EXISTS matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  periodo_academico VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'retirado', 'completado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(estudiante_id, curso_id, periodo_academico)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_asistencia_horario_id ON asistencia(horario_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_estudiante_id ON asistencia(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_fecha ON asistencia(fecha);
CREATE INDEX IF NOT EXISTS idx_asistencia_estado ON asistencia(estado);
CREATE INDEX IF NOT EXISTS idx_matriculas_estudiante_id ON matriculas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_curso_id ON matriculas(curso_id);

-- Create triggers
CREATE TRIGGER update_asistencia_updated_at
  BEFORE UPDATE ON asistencia
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matriculas_updated_at
  BEFORE UPDATE ON matriculas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for attendance statistics
CREATE OR REPLACE VIEW asistencia_estadisticas AS
SELECT 
  e.id as estudiante_id,
  e.nombre,
  e.apellido,
  c.id as curso_id,
  c.nombre as curso_nombre,
  c.codigo as curso_codigo,
  COUNT(*) as total_clases,
  COUNT(*) FILTER (WHERE a.estado = 'presente') as presentes,
  COUNT(*) FILTER (WHERE a.estado = 'ausente') as ausentes,
  COUNT(*) FILTER (WHERE a.estado = 'tardanza') as tardanzas,
  COUNT(*) FILTER (WHERE a.estado = 'justificado') as justificados,
  ROUND(
    (COUNT(*) FILTER (WHERE a.estado = 'presente')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as porcentaje_asistencia
FROM personas e
JOIN matriculas m ON e.id = m.estudiante_id
JOIN cursos c ON m.curso_id = c.id
LEFT JOIN horarios h ON c.id = h.curso_id
LEFT JOIN asistencia a ON h.id = a.horario_id AND e.id = a.estudiante_id
WHERE e.tipo = 'estudiante'
GROUP BY e.id, e.nombre, e.apellido, c.id, c.nombre, c.codigo;
