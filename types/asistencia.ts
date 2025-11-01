export interface Horario {
  id: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  estado: string
}

export interface CursoConHorarios {
  id: string
  nombre: string
  codigo: string
  horarios?: Horario[] | null
}

export interface SesionClase {
  id: string
  curso_id: string
  horario_id: string | null
  fecha_sesion: string
  hora_inicio: string
  hora_fin: string
  numero_sesion: number
  qr_token: string | null
  estado: string
}

export interface MatriculaConPersona {
  id: string
  estudiante_id: string
  curso_id: string
  estado: string
  personas: {
    id?: string
    nombre: string
    apellido: string
  } | null
}
