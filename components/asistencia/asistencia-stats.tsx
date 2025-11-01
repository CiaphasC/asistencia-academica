"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { TrendingUp, TrendingDown, Users, BookOpen } from "lucide-react"

interface EstadisticaEstudiante {
  estudiante_id: string
  nombre: string
  apellido: string
  curso_id: string
  curso_nombre: string
  curso_codigo: string
  total_clases: number
  presentes: number
  ausentes: number
  tardanzas: number
  justificados: number
  porcentaje_asistencia: number
}

export function AsistenciaStats() {
  const [estadisticas, setEstadisticas] = React.useState<EstadisticaEstudiante[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    loadEstadisticas()
  }, [])

  const loadEstadisticas = async () => {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("asistencia_estadisticas").select("*").order("porcentaje_asistencia", {
      ascending: false,
    })

    if (error) {
      console.error("[v0] Error loading estadisticas:", error)
    } else {
      setEstadisticas(data || [])
    }

    setIsLoading(false)
  }

  const getAsistenciaColor = (porcentaje: number) => {
    if (porcentaje >= 90) return "text-green-600 dark:text-green-400"
    if (porcentaje >= 75) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getAsistenciaBadge = (porcentaje: number) => {
    if (porcentaje >= 90) return <Badge className="bg-green-500">Excelente</Badge>
    if (porcentaje >= 75) return <Badge className="bg-yellow-500">Bueno</Badge>
    return <Badge variant="destructive">Bajo</Badge>
  }

  const promedioGeneral =
    estadisticas.length > 0
      ? estadisticas.reduce((acc, est) => acc + est.porcentaje_asistencia, 0) / estadisticas.length
      : 0

  const totalEstudiantes = new Set(estadisticas.map((e) => e.estudiante_id)).size
  const totalCursos = new Set(estadisticas.map((e) => e.curso_id)).size

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Cargando estadísticas...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            {promedioGeneral >= 80 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promedioGeneral.toFixed(1)}%</div>
            <Progress value={promedioGeneral} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEstudiantes}</div>
            <p className="text-xs text-muted-foreground mt-2">Estudiantes activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Monitoreados</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCursos}</div>
            <p className="text-xs text-muted-foreground mt-2">Cursos con registro</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas Detalladas por Estudiante</CardTitle>
          <CardDescription>Resumen de asistencia por curso y estudiante</CardDescription>
        </CardHeader>
        <CardContent>
          {estadisticas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay datos de asistencia registrados</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead className="text-center">Total Clases</TableHead>
                  <TableHead className="text-center">Presentes</TableHead>
                  <TableHead className="text-center">Ausentes</TableHead>
                  <TableHead className="text-center">Tardanzas</TableHead>
                  <TableHead className="text-right">Asistencia</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estadisticas.map((est, index) => (
                  <TableRow key={`${est.estudiante_id}-${est.curso_id}-${index}`}>
                    <TableCell className="font-medium">
                      {est.nombre} {est.apellido}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{est.curso_nombre}</div>
                        <div className="text-xs text-muted-foreground">{est.curso_codigo}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{est.total_clases}</TableCell>
                    <TableCell className="text-center text-green-600">{est.presentes}</TableCell>
                    <TableCell className="text-center text-red-600">{est.ausentes}</TableCell>
                    <TableCell className="text-center text-yellow-600">{est.tardanzas}</TableCell>
                    <TableCell className="text-right">
                      <span className={getAsistenciaColor(est.porcentaje_asistencia)}>
                        {est.porcentaje_asistencia?.toFixed(1) || 0}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{getAsistenciaBadge(est.porcentaje_asistencia)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
