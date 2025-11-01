export interface OrganizadorPersona {
  nombre: string
  apellido: string
}

export interface Evento {
  id: string
  nombre: string
  descripcion: string | null
  tipo: string
  fecha_inicio: string
  fecha_fin: string
  ubicacion: string | null
  capacidad_maxima: number | null
  organizador_id: string | null
  estado: string
  enlace_publico: string
  personas?: OrganizadorPersona | null
}
