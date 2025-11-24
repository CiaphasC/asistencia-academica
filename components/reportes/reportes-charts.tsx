"use client"

import * as React from "react"
import ReactECharts from "echarts-for-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type ChartSeries = { name: string; value: number }

export function ReportesCharts() {
  const [personasData, setPersonasData] = React.useState<ChartSeries[]>([])
  const [cursosData, setCursosData] = React.useState<{ semestre: string; cursos: number }[]>([])
  const [asistenciaData, setAsistenciaData] = React.useState<ChartSeries[]>([])
  const [loading, setLoading] = React.useState(true)
  const [totals, setTotals] = React.useState<{ personas: number; cursos: number; asistencias: number }>({
    personas: 0,
    cursos: 0,
    asistencias: 0,
  })

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const supabase = getSupabaseBrowserClient()

    // Personas por tipo
    const { data: personas } = await supabase.from("personas").select("tipo").eq("estado", "activo")
    const personasCounts =
      personas?.reduce((acc: Record<string, number>, p: any) => {
        acc[p.tipo] = (acc[p.tipo] || 0) + 1
        return acc
      }, {}) || {}
    setPersonasData(Object.entries(personasCounts).map(([name, value]) => ({ name, value })))
    const personasTotal = Object.values(personasCounts).reduce((a, b) => a + b, 0)

    // Cursos por semestre
    const { data: cursos } = await supabase.from("cursos").select("semestre").eq("estado", "activo")
    const cursosCounts =
      cursos?.reduce((acc: Record<number, number>, c: any) => {
        acc[c.semestre] = (acc[c.semestre] || 0) + 1
        return acc
      }, {}) || {}
    setCursosData(
      Object.entries(cursosCounts)
        .map(([semestre, count]) => ({ semestre: `Semestre ${semestre}`, cursos: Number(count) }))
        .sort((a, b) => Number.parseInt(a.semestre.split(" ")[1]) - Number.parseInt(b.semestre.split(" ")[1])),
    )
    const cursosTotal = Object.values(cursosCounts).reduce((a, b) => a + b, 0)

    // Asistencia por estado
    const { data: asistencia } = await supabase.from("asistencia").select("estado")
    const asistenciaCounts =
      asistencia?.reduce((acc: Record<string, number>, a: any) => {
        acc[a.estado] = (acc[a.estado] || 0) + 1
        return acc
      }, {}) || {}
    setAsistenciaData(Object.entries(asistenciaCounts).map(([name, value]) => ({ name, value })))
    const asistenciasTotal = Object.values(asistenciaCounts).reduce((a, b) => a + b, 0)

    setTotals({ personas: personasTotal, cursos: cursosTotal, asistencias: asistenciasTotal })

    setLoading(false)
  }

  const personasOption = {
    tooltip: { trigger: "item" },
    legend: { orient: "horizontal", bottom: 0 },
    series: [
      {
        type: "pie",
        radius: "60%",
        data: personasData,
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.4)" } },
      },
    ],
  }

  const cursosOption = {
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: cursosData.map((c) => c.semestre), axisLabel: { rotate: 20 } },
    yAxis: { type: "value" },
    series: [
      {
        data: cursosData.map((c) => c.cursos),
        type: "bar",
        itemStyle: { color: "var(--color-chart-1)" },
        barWidth: 24,
      },
    ],
  }

  const asistenciaOption = {
    tooltip: { trigger: "item" },
    legend: { orient: "horizontal", bottom: 0 },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        data: asistenciaData,
        label: { show: false, position: "center" },
        emphasis: { label: { show: true, fontSize: 16, fontWeight: "bold" } },
      },
    ],
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Cargando reportes...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Personas activas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totals.personas}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cursos activos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totals.cursos}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Registros de asistencia</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totals.asistencias}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Personas</CardTitle>
            <CardDescription>Cantidad de usuarios por tipo</CardDescription>
          </CardHeader>
        <CardContent>
          <ReactECharts option={personasOption} style={{ height: 320 }} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cursos por Semestre</CardTitle>
          <CardDescription>Distribución de cursos en la malla curricular</CardDescription>
        </CardHeader>
        <CardContent>
          <ReactECharts option={cursosOption} style={{ height: 320 }} />
        </CardContent>
      </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Estado de Asistencia</CardTitle>
            <CardDescription>Distribución de registros de asistencia</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts option={asistenciaOption} style={{ height: 320 }} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
