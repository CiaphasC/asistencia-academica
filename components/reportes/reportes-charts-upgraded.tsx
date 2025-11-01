"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend)

interface AsistenciaStats {
  curso: string
  cursoId: string
  carrera: string
  presente: number
  ausente: number
  tardanza: number
  justificado: number
}

interface EstudianteStats {
  nombre: string
  porcentaje: number
  asistencias: number
  total: number
}

export function ReportesChartsUpgraded() {
  const [asistenciaStats, setAsistenciaStats] = React.useState<AsistenciaStats[]>([])
  const [estudianteStats, setEstudianteStats] = React.useState<EstudianteStats[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedCurso, setSelectedCurso] = React.useState<string>("todos")
  const [selectedCarrera, setSelectedCarrera] = React.useState<string>("todas")
  const [carreras, setCarreras] = React.useState<string[]>([])
  const [cursos, setCursos] = React.useState<Array<{ id: string; nombre: string }>>([])

  React.useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const supabase = getSupabaseBrowserClient()

    try {
      const { data: cursosData } = await supabase.from("cursos").select("id, nombre, malla_id, mallas(nombre)")

      if (cursosData) {
        setCursos(cursosData.map((c: any) => ({ id: c.id, nombre: c.nombre })))

        const stats: AsistenciaStats[] = []
        const carrerasSet = new Set<string>()

        for (const curso of cursosData) {
          const { data: asistencias } = await supabase.from("asistencias").select("estado").eq("curso_id", curso.id)

          const presente = asistencias?.filter((a) => a.estado === "presente").length || 0
          const ausente = asistencias?.filter((a) => a.estado === "ausente").length || 0
          const tardanza = asistencias?.filter((a) => a.estado === "tardanza").length || 0
          const justificado = asistencias?.filter((a) => a.estado === "justificado").length || 0

          const carrera = (curso.mallas as any)?.nombre || "Sin carrera"
          carrerasSet.add(carrera)

          stats.push({
            curso: curso.nombre,
            cursoId: curso.id,
            carrera,
            presente,
            ausente,
            tardanza,
            justificado,
          })
        }

        setAsistenciaStats(stats)
        setCarreras(Array.from(carrerasSet))
      }

      // Load student statistics
      const { data: estudiantes } = await supabase
        .from("personas")
        .select("id, nombre, apellido")
        .eq("tipo", "estudiante")

      if (estudiantes) {
        const stats: EstudianteStats[] = []

        for (const estudiante of estudiantes) {
          const { data: asistencias } = await supabase
            .from("asistencias")
            .select("estado")
            .eq("estudiante_id", estudiante.id)

          const presente = asistencias?.filter((a) => a.estado === "presente").length || 0
          const total = asistencias?.length || 0
          const porcentaje = total > 0 ? Math.round((presente / total) * 100) : 0

          stats.push({
            nombre: `${estudiante.nombre} ${estudiante.apellido}`,
            porcentaje,
            asistencias: presente,
            total,
          })
        }

        setEstudianteStats(stats.sort((a, b) => b.porcentaje - a.porcentaje))
      }
    } catch (error) {
      console.error("[v0] Error loading stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStats = asistenciaStats.filter((stat) => {
    const matchesCurso = selectedCurso === "todos" || stat.cursoId === selectedCurso
    const matchesCarrera = selectedCarrera === "todas" || stat.carrera === selectedCarrera
    return matchesCurso && matchesCarrera
  })

  // Chart options with modern styling
  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 13,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  }

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = Math.round((value / total) * 100)
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
    },
  }

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando reportes...</div>
  }

  // Prepare data for charts
  const asistenciaByStateData = {
    labels: ["Presente", "Ausente", "Tardanza", "Justificado"],
    datasets: [
      {
        label: "Total de Registros",
        data: [
          filteredStats.reduce((sum, s) => sum + s.presente, 0),
          filteredStats.reduce((sum, s) => sum + s.ausente, 0),
          filteredStats.reduce((sum, s) => sum + s.tardanza, 0),
          filteredStats.reduce((sum, s) => sum + s.justificado, 0),
        ],
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b", "#3b82f6"],
        borderColor: ["#059669", "#dc2626", "#d97706", "#1d4ed8"],
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: ["#059669", "#dc2626", "#d97706", "#1d4ed8"],
      },
    ],
  }

  const asistenciaByCourseData = {
    labels: filteredStats.map((s) => s.curso),
    datasets: [
      {
        label: "Presente",
        data: filteredStats.map((s) => s.presente),
        backgroundColor: "#10b981",
        borderColor: "#059669",
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: "Ausente",
        data: filteredStats.map((s) => s.ausente),
        backgroundColor: "#ef4444",
        borderColor: "#dc2626",
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: "Tardanza",
        data: filteredStats.map((s) => s.tardanza),
        backgroundColor: "#f59e0b",
        borderColor: "#d97706",
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: "Justificado",
        data: filteredStats.map((s) => s.justificado),
        backgroundColor: "#3b82f6",
        borderColor: "#1d4ed8",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }

  const estudiantePercentageData = {
    labels: estudianteStats.slice(0, 10).map((s) => s.nombre),
    datasets: [
      {
        label: "Porcentaje de Asistencia",
        data: estudianteStats.slice(0, 10).map((s) => s.porcentaje),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      },
    ],
  }

  const estudianteDistributionData = {
    labels: ["0-50%", "50-70%", "70-85%", "85-95%", "95-100%"],
    datasets: [
      {
        label: "Estudiantes",
        data: [
          estudianteStats.filter((s) => s.porcentaje < 50).length,
          estudianteStats.filter((s) => s.porcentaje >= 50 && s.porcentaje < 70).length,
          estudianteStats.filter((s) => s.porcentaje >= 70 && s.porcentaje < 85).length,
          estudianteStats.filter((s) => s.porcentaje >= 85 && s.porcentaje < 95).length,
          estudianteStats.filter((s) => s.porcentaje >= 95).length,
        ],
        backgroundColor: ["#ef4444", "#f59e0b", "#eab308", "#84cc16", "#10b981"],
        borderColor: ["#dc2626", "#d97706", "#ca8a04", "#65a30d", "#059669"],
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Filtrar por Carrera</label>
          <Select value={selectedCarrera} onValueChange={setSelectedCarrera}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una carrera" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las carreras</SelectItem>
              {carreras.map((carrera) => (
                <SelectItem key={carrera} value={carrera}>
                  {carrera}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Filtrar por Curso</label>
          <Select value={selectedCurso} onValueChange={setSelectedCurso}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los cursos</SelectItem>
              {cursos.map((curso) => (
                <SelectItem key={curso.id} value={curso.id}>
                  {curso.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="courses" className="text-xs sm:text-sm">
            Por Curso
          </TabsTrigger>
          <TabsTrigger value="students" className="text-xs sm:text-sm">
            Estudiantes
          </TabsTrigger>
          <TabsTrigger value="distribution" className="text-xs sm:text-sm">
            Distribución
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Asistencia General</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Distribución de estados de asistencia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <Pie data={asistenciaByStateData} options={pieOptions} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Resumen de Estadísticas</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Totales por estado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-xs sm:text-sm">Presente</span>
                    <span className="text-base sm:text-lg font-bold text-green-600">
                      {asistenciaStats.reduce((sum, s) => sum + s.presente, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-xs sm:text-sm">Ausente</span>
                    <span className="text-base sm:text-lg font-bold text-red-600">
                      {asistenciaStats.reduce((sum, s) => sum + s.ausente, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-amber-50 rounded-lg">
                    <span className="font-medium text-xs sm:text-sm">Tardanza</span>
                    <span className="text-base sm:text-lg font-bold text-amber-600">
                      {asistenciaStats.reduce((sum, s) => sum + s.tardanza, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-xs sm:text-sm">Justificado</span>
                    <span className="text-base sm:text-lg font-bold text-blue-600">
                      {asistenciaStats.reduce((sum, s) => sum + s.justificado, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Asistencia por Curso</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Comparativa de estados de asistencia en cada curso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-96">
                <Bar data={asistenciaByCourseData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Porcentaje de Asistencia por Estudiante</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Top 10 estudiantes por porcentaje de asistencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-96">
                <Line data={estudiantePercentageData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Distribución de Asistencia</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Cantidad de estudiantes por rango de porcentaje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-96">
                <Doughnut data={estudianteDistributionData} options={pieOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
