-- Create mallas curriculares (curriculum grids) table
CREATE TABLE IF NOT EXISTS mallas_curriculares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  nivel VARCHAR(50) NOT NULL,
  duracion_semestres INTEGER NOT NULL,
  creditos_totales INTEGER NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'en_revision')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cursos (courses) table
CREATE TABLE IF NOT EXISTS cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  malla_id UUID REFERENCES mallas_curriculares(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  creditos INTEGER NOT NULL,
  horas_semanales INTEGER NOT NULL,
  semestre INTEGER NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('obligatorio', 'electivo', 'practica')),
  prerequisitos TEXT[],
  profesor_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mallas_estado ON mallas_curriculares(estado);
CREATE INDEX IF NOT EXISTS idx_cursos_malla_id ON cursos(malla_id);
CREATE INDEX IF NOT EXISTS idx_cursos_semestre ON cursos(semestre);
CREATE INDEX IF NOT EXISTS idx_cursos_profesor_id ON cursos(profesor_id);

-- Create triggers
CREATE TRIGGER update_mallas_updated_at
  BEFORE UPDATE ON mallas_curriculares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cursos_updated_at
  BEFORE UPDATE ON cursos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
