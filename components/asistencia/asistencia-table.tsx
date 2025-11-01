"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, Clock, FileText } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface AsistenciaTableProps {
  cursoId: string
  fecha: string
}

interface Estudiante {
  id: string
  nombre: string
  apellido: string
  documento: string
}

interface AsistenciaRecord {
  id?: string
  estudiante_id: string
  estado: "presente" | "ausente" | "tardanza" | "justificado"
  observaciones?: string
}

export function AsistenciaTable({ cursoId, fecha }: AsistenciaTableProps) {
  const [estudiantes, setEstudiantes] = React.useState<Estudiante[]>([])
  const [asistencias, setAsistencias] = React.useState<Map<string, AsistenciaRecord>>(new Map())
  const [horarioId, setHorarioId] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    if (cursoId && fecha) {
      loadData()
    }
  }, [cursoId, fecha])

  const loadData = async () => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    // Get horario for this course and date
    const dayOfWeek = new Date(fecha).getDay()
    const { data: horarios } = await supabase
      .from("horarios")
      .select("*")
      .eq("curso_id", cursoId)
      .eq("dia_semana", dayOfWeek)
      .eq("estado", "activo")
      .limit(1)

    if (!horarios || horarios.length === 0) {
      setEstudiantes([])
      setIsLoading(false)
      return
    }

    const horario = horarios[0]
    setHorarioId(horario.id)

    // Get enrolled students
    const { data: matriculas } = await supabase
      .from("matriculas")
      .select("estudiante_id, personas(id, nombre, apellido, documento)")
      .eq("curso_id", cursoId)
      .eq("estado", "activo")

    const estudiantesData =
      matriculas?.map((m: any) => ({
        id: m.personas.id,
        nombre: m.personas.nombre,
        apellido: m.personas.apellido,
        documento: m.personas.documento,
      })) || []

    setEstudiantes(estudiantesData)

    // Get existing attendance records
    const { data: asistenciaData } = await supabase
      .from("asistencia")
      .select("*")
      .eq("horario_id", horario.id)
      .eq("fecha", fecha)

    const asistenciaMap = new Map<string, AsistenciaRecord>()
    asistenciaData?.forEach((record: any) => {
      asistenciaMap.set(record.estudiante_id, {
        id: record.id,
        estudiante_id: record.estudiante_id,
        estado: record.estado,
        observaciones: record.observaciones,
      })
    })

    setAsistencias(asistenciaMap)
    setIsLoading(false)
  }

  const handleEstadoChange = (estudianteId: string, estado: AsistenciaRecord["estado"]) => {
    const newAsistencias = new Map(asistencias)
    const existing = newAsistencias.get(estudianteId)

    newAsistencias.set(estudianteId, {
      ...existing,
      estudiante_id: estudianteId,
      estado,
    })

    setAsistencias(newAsistencias)
  }

  const handleSave = async () => {
    if (!horarioId) return

    setIsSaving(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const records = Array.from(asistencias.values()).map((record) => ({
        horario_id: horarioId,
        estudiante_id: record.estudiante_id,
        fecha,
        estado: record.estado,
        hora_registro: new Date().toISOString(),
        observaciones: record.observaciones,
      }))

      // Delete existing records for this date
      await supabase.from("asistencia").delete().eq("horario_id", horarioId).eq("fecha", fecha)

      // Insert new records
      const { error } = await supabase.from("asistencia").insert(records)

      if (error) throw error

      alert("Asistencia guardada exitosamente")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving asistencia:", error)
      alert("Error al guardar la asistencia")
    } finally {
      setIsSaving(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "presente":
        return <Badge className="bg-green-500">Presente</Badge>
      case "ausente":
        return <Badge variant="destructive">Ausente</Badge>
      case "tardanza":
        return <Badge className="bg-yellow-500">Tardanza</Badge>
      case "justificado":
        return <Badge variant="secondary">Justificado</Badge>
      default:
        return <Badge variant="outline">Sin registrar</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Cargando estudiantes...</p>
      </Card>
    )
  }

  if (!horarioId) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No hay horario programado para este curso en la fecha seleccionada</p>
      </Card>
    )
  }

  if (estudiantes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No hay estudiantes matriculados en este curso</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Lista de Asistencia</h3>
          <p className="text-sm text-muted-foreground">{estudiantes.length} estudiantes</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar Asistencia"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudiante</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {estudiantes.map((estudiante) => {
            const asistencia = asistencias.get(estudiante.id)
            const estado = asistencia?.estado

            return (
              <TableRow key={estudiante.id}>
                <TableCell className="font-medium">
                  {estudiante.nombre} {estudiante.apellido}
                </TableCell>
                <TableCell className="font-mono text-sm">{estudiante.documento}</TableCell>
                <TableCell>{estado ? getEstadoBadge(estado) : getEstadoBadge("sin_registrar")}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={estado === "presente" ? "default" : "outline"}
                      onClick={() => handleEstadoChange(estudiante.id, "presente")}
                      className={cn(estado === "presente" && "bg-green-500 hover:bg-green-600")}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={estado === "ausente" ? "destructive" : "outline"}
                      onClick={() => handleEstadoChange(estudiante.id, "ausente")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={estado === "tardanza" ? "default" : "outline"}
                      onClick={() => handleEstadoChange(estudiante.id, "tardanza")}
                      className={cn(estado === "tardanza" && "bg-yellow-500 hover:bg-yellow-600")}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={estado === "justificado" ? "secondary" : "outline"}
                      onClick={() => handleEstadoChange(estudiante.id, "justificado")}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
