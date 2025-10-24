"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, MapPin, User, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface Horario {
  id: string
  aula: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  periodo_academico: string
  cursos?: {
    nombre: string
    codigo: string
  }
  personas?: {
    nombre: string
    apellido: string
  }
}

interface HorariosCalendarProps {
  initialHorarios: Horario[]
}

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

const HORAS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
]

export function HorariosCalendar({ initialHorarios }: HorariosCalendarProps) {
  const [horarios, setHorarios] = React.useState<Horario[]>(initialHorarios)
  const [viewMode, setViewMode] = React.useState<"week" | "list">("week")
  const [selectedPeriodo, setSelectedPeriodo] = React.useState<string>("todos")

  const periodos = Array.from(new Set(horarios.map((h) => h.periodo_academico)))

  const filteredHorarios =
    selectedPeriodo === "todos" ? horarios : horarios.filter((h) => h.periodo_academico === selectedPeriodo)

  const getHorarioPosition = (hora_inicio: string, hora_fin: string) => {
    const [startHour, startMin] = hora_inicio.split(":").map(Number)
    const [endHour, endMin] = hora_fin.split(":").map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const duration = endMinutes - startMinutes

    const baseHour = 7 * 60
    const top = ((startMinutes - baseHour) / 60) * 80
    const height = (duration / 60) * 80

    return { top, height }
  }

  const getColorForCurso = (codigo: string) => {
    const colors = [
      "bg-primary/20 border-primary text-primary",
      "bg-accent/20 border-accent text-accent",
      "bg-secondary/20 border-secondary text-secondary",
      "bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300",
      "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300",
      "bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-300",
    ]

    const hash = codigo.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              onClick={() => setViewMode("week")}
              className="bg-transparent"
            >
              Vista Semanal
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className="bg-transparent"
            >
              Vista Lista
            </Button>
          </div>

          <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los periodos</SelectItem>
              {periodos.map((periodo) => (
                <SelectItem key={periodo} value={periodo}>
                  {periodo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Calendar View */}
      {viewMode === "week" ? (
        <Card className="overflow-x-auto">
          <div className="min-w-[800px] p-4">
            {/* Header */}
            <div className="grid grid-cols-8 gap-2 mb-4">
              <div className="text-sm font-medium text-muted-foreground">Hora</div>
              {DIAS_SEMANA.slice(1, 7).map((dia) => (
                <div key={dia} className="text-sm font-medium text-center">
                  {dia}
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="relative">
              <div className="grid grid-cols-8 gap-2">
                {/* Time column */}
                <div className="space-y-[60px]">
                  {HORAS.map((hora) => (
                    <div key={hora} className="text-xs text-muted-foreground h-5">
                      {hora}
                    </div>
                  ))}
                </div>

                {/* Days columns */}
                {[1, 2, 3, 4, 5, 6].map((dia) => (
                  <div key={dia} className="relative border-l border-border min-h-[1000px]">
                    {/* Hour lines */}
                    {HORAS.map((_, index) => (
                      <div
                        key={index}
                        className="absolute w-full border-t border-border/50"
                        style={{ top: index * 80 }}
                      />
                    ))}

                    {/* Horarios */}
                    {filteredHorarios
                      .filter((h) => h.dia_semana === dia)
                      .map((horario) => {
                        const { top, height } = getHorarioPosition(horario.hora_inicio, horario.hora_fin)
                        const colorClass = getColorForCurso(horario.cursos?.codigo || "")

                        return (
                          <div
                            key={horario.id}
                            className={cn(
                              "absolute left-1 right-1 rounded-lg border-l-4 p-2 overflow-hidden cursor-pointer hover:shadow-lg transition-all",
                              colorClass,
                            )}
                            style={{ top: `${top}px`, height: `${height}px` }}
                          >
                            <div className="text-xs font-semibold line-clamp-1">{horario.cursos?.nombre}</div>
                            <div className="text-xs opacity-80 line-clamp-1">{horario.cursos?.codigo}</div>
                            <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{horario.aula}</span>
                            </div>
                            {horario.personas && (
                              <div className="flex items-center gap-1 text-xs opacity-70">
                                <User className="h-3 w-3" />
                                <span className="line-clamp-1">
                                  {horario.personas.nombre} {horario.personas.apellido}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* List View */
        <div className="space-y-4">
          {DIAS_SEMANA.slice(1, 7).map((dia, diaIndex) => {
            const diaHorarios = filteredHorarios.filter((h) => h.dia_semana === diaIndex + 1)

            if (diaHorarios.length === 0) return null

            return (
              <Card key={dia} className="p-4">
                <h3 className="text-lg font-semibold mb-4">{dia}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {diaHorarios.map((horario) => (
                    <Card key={horario.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{horario.cursos?.nombre}</h4>
                          <Badge variant="outline" className="text-xs">
                            {horario.cursos?.codigo}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {horario.hora_inicio.slice(0, 5)} - {horario.hora_fin.slice(0, 5)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{horario.aula}</span>
                        </div>
                        {horario.personas && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>
                              {horario.personas.nombre} {horario.personas.apellido}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
