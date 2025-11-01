"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { CursoConHorarios, MatriculaConPersona, SesionClase } from "@/types/asistencia"

export interface AsistenciasMap {
  [estudianteId: string]: boolean
}

interface UseAsistenciaState {
  selectedCursoId: string
  setSelectedCursoId: (id: string) => void
  cursos: CursoConHorarios[]
  sesiones: SesionClase[]
  selectedSesionId: string
  setSelectedSesionId: (id: string) => void
  matriculas: MatriculaConPersona[]
  asistencias: AsistenciasMap
  toggleAsistencia: (estudianteId: string) => void
  guardarAsistencias: () => Promise<void>
  cargando: boolean
  guardando: boolean
  recargandoSesiones: boolean
  recargandoMatriculas: boolean
  refrescarSesiones: () => Promise<void>
  refrescarMatriculas: () => Promise<void>
  refrescarAsistencias: () => Promise<void>
  sesionActual: SesionClase | undefined
}

export function useAsistencia(initialCursos: CursoConHorarios[]): UseAsistenciaState {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [cursos] = useState<CursoConHorarios[]>(initialCursos)
  const [selectedCursoId, setSelectedCursoId] = useState<string>(initialCursos[0]?.id ?? "")
  const [sesiones, setSesiones] = useState<SesionClase[]>([])
  const [recargandoSesiones, setRecargandoSesiones] = useState(false)
  const [selectedSesionId, setSelectedSesionId] = useState<string>("")
  const [matriculas, setMatriculas] = useState<MatriculaConPersona[]>([])
  const [recargandoMatriculas, setRecargandoMatriculas] = useState(false)
  const [asistencias, setAsistencias] = useState<AsistenciasMap>({})
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(false)

  const sesionActual = useMemo(
    () => sesiones.find((sesion) => sesion.id === selectedSesionId),
    [sesiones, selectedSesionId],
  )

  const cargarSesiones = useCallback(
    async (cursoId: string) => {
      if (!cursoId) {
        setSesiones([])
        setSelectedSesionId("")
        return
      }

      setRecargandoSesiones(true)

      const { data, error } = await supabase
        .from("sesiones_clase")
        .select("*")
        .eq("curso_id", cursoId)
        .order("fecha_sesion", { ascending: true })

      if (error) {
        console.error("[useAsistencia] Error al cargar sesiones:", error)
        setSesiones([])
        setSelectedSesionId("")
      } else {
        setSesiones(data as SesionClase[])
        if (data && data.length > 0) {
          setSelectedSesionId(data[0].id)
        } else {
          setSelectedSesionId("")
        }
      }

      setRecargandoSesiones(false)
    },
    [supabase],
  )

  const cargarMatriculas = useCallback(
    async (cursoId: string) => {
      if (!cursoId) {
        setMatriculas([])
        return
      }

      setRecargandoMatriculas(true)

      const { data, error } = await supabase
        .from("matriculas")
        .select("id, estudiante_id, curso_id, estado, personas(id, nombre, apellido)")
        .eq("curso_id", cursoId)
        .eq("estado", "activo")
        .order("created_at", { ascending: true })

      if (error) {
        console.error("[useAsistencia] Error al cargar matriculas:", error)
        setMatriculas([])
      } else {
        setMatriculas((data as MatriculaConPersona[]) ?? [])
      }

      setRecargandoMatriculas(false)
    },
    [supabase],
  )

  const cargarAsistencias = useCallback(
    async (sesionId: string) => {
      if (!sesionId) {
        setAsistencias({})
        return
      }

      const { data, error } = await supabase
        .from("asistencias")
        .select("estudiante_id, asistio")
        .eq("sesion_id", sesionId)

      if (error) {
        console.error("[useAsistencia] Error al cargar asistencias:", error)
        setAsistencias({})
      } else {
        const map: AsistenciasMap = {}
        data?.forEach((registro) => {
          map[registro.estudiante_id] = Boolean(registro.asistio)
        })
        setAsistencias(map)
      }
    },
    [supabase],
  )

  useEffect(() => {
    setCargando(true)
    Promise.all([cargarSesiones(selectedCursoId), cargarMatriculas(selectedCursoId)]).finally(() => {
      setCargando(false)
    })
  }, [selectedCursoId, cargarSesiones, cargarMatriculas])

  useEffect(() => {
    if (selectedSesionId) {
      cargarAsistencias(selectedSesionId)
    } else {
      setAsistencias({})
    }
  }, [selectedSesionId, cargarAsistencias])

  const toggleAsistencia = useCallback((estudianteId: string) => {
    setAsistencias((prev) => ({
      ...prev,
      [estudianteId]: !prev[estudianteId],
    }))
  }, [])

  const guardarAsistencias = useCallback(async () => {
    if (!selectedSesionId) {
      return
    }

    setGuardando(true)
    try {
      const registros = matriculas.map((matricula) => ({
        sesion_id: selectedSesionId,
        estudiante_id: matricula.estudiante_id,
        asistio: asistencias[matricula.estudiante_id] ?? false,
        fecha_registro: new Date().toISOString(),
      }))

      const { error } = await supabase.from("asistencias").upsert(registros, {
        onConflict: "sesion_id,estudiante_id",
      })

      if (error) {
        throw error
      }
    } finally {
      setGuardando(false)
    }
  }, [selectedSesionId, matriculas, asistencias, supabase])

  const refrescarSesiones = useCallback(async () => {
    await cargarSesiones(selectedCursoId)
  }, [cargarSesiones, selectedCursoId])

  const refrescarMatriculas = useCallback(async () => {
    await cargarMatriculas(selectedCursoId)
  }, [cargarMatriculas, selectedCursoId])

  const refrescarAsistencias = useCallback(async () => {
    await cargarAsistencias(selectedSesionId)
  }, [cargarAsistencias, selectedSesionId])

  return {
    cursos,
    selectedCursoId,
    setSelectedCursoId,
    sesiones,
    selectedSesionId,
    setSelectedSesionId,
    matriculas,
    asistencias,
    toggleAsistencia,
    guardarAsistencias,
    cargando,
    guardando,
    recargandoSesiones,
    recargandoMatriculas,
    refrescarSesiones,
    refrescarMatriculas,
    refrescarAsistencias,
    sesionActual,
  }
}
