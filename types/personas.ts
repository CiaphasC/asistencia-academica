export interface PersonaBasic {
  id?: string
  nombre: string
  apellido: string
  email: string
  cedula?: string | null
  role?: string
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
