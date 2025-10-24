"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export function ReportesCharts() {
  const [personasData, setPersonasData] = React.useState<any[]>([])
  const [cursosData, setCursosData] = React.useState<any[]>([])
  const [asistenciaData, setAsistenciaData] = React.useState<any[]>([])

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = getSupabaseBrowserClient()

    // Personas por tipo
    const { data: personas } = await supabase.from("personas").select("tipo").eq("estado", "activo")

    const personasCounts = personas?.reduce(
      (acc, p) => {
        acc[p.tipo] = (acc[p.tipo] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    setPersonasData(
      Object.entries(personasCounts || {}).map(([tipo, count]) => ({
        tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1),
        cantidad: count,
      })),
    )

    // Cursos por semestre
    const { data: cursos } = await supabase.from("cursos").select("semestre").eq("estado", "activo")

    const cursosCounts = cursos?.reduce(
      (acc, c) => {
        acc[c.semestre] = (acc[c.semestre] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    setCursosData(
      Object.entries(cursosCounts || {})
        .map(([semestre, count]) => ({
          semestre: `Semestre ${semestre}`,
          cursos: count,
        }))
        .sort((a, b) => Number.parseInt(a.semestre.split(" ")[1]) - Number.parseInt(b.semestre.split(" ")[1])),
    )

    // Asistencia por estado
    const { data: asistencia } = await supabase.from("asistencia").select("estado")

    const asistenciaCounts = asistencia?.reduce(
      (acc, a) => {
        acc[a.estado] = (acc[a.estado] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    setAsistenciaData(
      Object.entries(asistenciaCounts || {}).map(([estado, count]) => ({
        estado: estado.charAt(0).toUpperCase() + estado.slice(1),
        cantidad: count,
      })),
    )
  }

  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--chart-4))"]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personas Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Personas</CardTitle>
          <CardDescription>Cantidad de usuarios por tipo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={personasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tipo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidad" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cursos Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cursos por Semestre</CardTitle>
          <CardDescription>Distribución de cursos en la malla curricular</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cursosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semestre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cursos" fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Asistencia Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Estado de Asistencia</CardTitle>
          <CardDescription>Distribución de registros de asistencia</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={asistenciaData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label
                outerRadius={100}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {asistenciaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
