-- Create horarios table
CREATE TABLE IF NOT EXISTS horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  profesor_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  aula VARCHAR(50) NOT NULL,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  periodo_academico VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_horarios_curso_id ON horarios(curso_id);
CREATE INDEX IF NOT EXISTS idx_horarios_profesor_id ON horarios(profesor_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia_semana ON horarios(dia_semana);
CREATE INDEX IF NOT EXISTS idx_horarios_periodo ON horarios(periodo_academico);

-- Create trigger
CREATE TRIGGER update_horarios_updated_at
  BEFORE UPDATE ON horarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to check schedule conflicts
CREATE OR REPLACE FUNCTION check_horario_conflict(
  p_profesor_id UUID,
  p_aula VARCHAR,
  p_dia_semana INTEGER,
  p_hora_inicio TIME,
  p_hora_fin TIME,
  p_horario_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM horarios
  WHERE estado = 'activo'
    AND dia_semana = p_dia_semana
    AND (
      (profesor_id = p_profesor_id) OR (aula = p_aula)
    )
    AND (
      (p_hora_inicio >= hora_inicio AND p_hora_inicio < hora_fin) OR
      (p_hora_fin > hora_inicio AND p_hora_fin <= hora_fin) OR
      (p_hora_inicio <= hora_inicio AND p_hora_fin >= hora_fin)
    )
    AND (p_horario_id IS NULL OR id != p_horario_id);
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;
