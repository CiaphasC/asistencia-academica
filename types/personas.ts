export interface Role {
  id: string
  name: string
  description?: string
}

export interface PersonaBasic {
  id?: string
  nombre: string
  apellido: string
  email: string
  cedula?: string | null
  role?: string // Deprecated
  role_id?: string
  roles?: Role
}

export interface SolicitudValidacion {
  id: string
  persona_id: string
  tipo_solicitud: string
  estado: string
  motivo_rechazo: string | null
  fecha_solicitud: string
  fecha_resolucion: string | null
  personas: PersonaBasic
}
