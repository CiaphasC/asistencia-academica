import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { CursoConHorarios } from "@/types/asistencia"
import type { Evento } from "@/types/eventos"
import type { SolicitudValidacion } from "@/types/personas"

export async function fetchCursosActivos(): Promise<CursoConHorarios[]> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("cursos")
    .select("id, nombre, codigo, horarios(id, dia_semana, hora_inicio, hora_fin, estado)")
    .eq("estado", "activo")
    .order("nombre")

  if (error) {
    console.error("[queries] Error al obtener cursos:", error)
    return []
  }

  return (
    data?.map((curso) => ({
      id: curso.id,
      nombre: curso.nombre,
      codigo: curso.codigo,
      horarios: curso.horarios ?? [],
    })) ?? []
  )
}

export async function fetchEventosActivos(): Promise<Evento[]> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("eventos")
    .select("id, nombre, descripcion, tipo, fecha_inicio, fecha_fin, ubicacion, capacidad_maxima, organizador_id, estado, enlace_publico, personas(nombre, apellido)")
    .eq("estado", "activo")
    .order("fecha_inicio", { ascending: true })

  if (error) {
    console.error("[queries] Error al obtener eventos:", error)
    return []
  }

  return (
    data?.map((evento) => ({
      id: evento.id,
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      tipo: evento.tipo,
      fecha_inicio: evento.fecha_inicio,
      fecha_fin: evento.fecha_fin,
      ubicacion: evento.ubicacion,
      capacidad_maxima: evento.capacidad_maxima,
      organizador_id: evento.organizador_id,
      estado: evento.estado,
      enlace_publico: evento.enlace_publico,
      personas: evento.personas ?? null,
    })) ?? []
  )
}

export async function fetchSolicitudesPendientesAdmin(): Promise<{
  userRole: string | null
  solicitudes: SolicitudValidacion[]
}> {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { userRole: null, solicitudes: [] }
  }

  const { data: profile } = await supabase.from("auth_users").select("role, roles(name)").eq("id", user.id).maybeSingle()

  // @ts-ignore
  const role = profile?.roles?.name ?? profile?.role ?? null

  if (role !== "admin") {
    return { userRole: role, solicitudes: [] }
  }

  const { data, error } = await supabase
    .from("solicitudes_validacion")
    .select(
      "id, persona_id, tipo_solicitud, estado, motivo_rechazo, fecha_solicitud, fecha_resolucion, personas(id, nombre, apellido, email, cedula, role, roles(name))",
    )
    .eq("estado", "pendiente")
    .order("fecha_solicitud", { ascending: true })

  if (error) {
    console.error("[queries] Error al obtener solicitudes de validación:", error)
    return { userRole: role, solicitudes: [] }
  }

  const solicitudes: SolicitudValidacion[] =
    data?.map((item) => ({
      id: item.id,
      persona_id: item.persona_id,
      tipo_solicitud: item.tipo_solicitud,
      estado: item.estado,
      motivo_rechazo: item.motivo_rechazo,
      fecha_solicitud: item.fecha_solicitud,
      fecha_resolucion: item.fecha_resolucion ?? null,
      personas: {
        id: item.personas?.id,
        nombre: item.personas?.nombre ?? "",
        apellido: item.personas?.apellido ?? "",
        email: item.personas?.email ?? "",
        cedula: item.personas?.cedula ?? null,
        // @ts-ignore
        role: item.personas?.roles?.name ?? item.personas?.role,
      },
    })) ?? []

  return { userRole: role, solicitudes }
}
