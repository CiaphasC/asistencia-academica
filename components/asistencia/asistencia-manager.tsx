"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AsistenciaTable } from "./asistencia-table"
import { AsistenciaStats } from "./asistencia-stats"

interface AsistenciaManagerProps {
  cursos: any[]
}

export function AsistenciaManager({ cursos }: AsistenciaManagerProps) {
  const [selectedCurso, setSelectedCurso] = React.useState<string>("")
  const [selectedDate, setSelectedDate] = React.useState<string>(new Date().toISOString().split("T")[0])

  return (
    <Tabs defaultValue="registro" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="registro">Registro de Asistencia</TabsTrigger>
        <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
      </TabsList>

      <TabsContent value="registro" className="space-y-6">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="curso">Curso</Label>
              <Select value={selectedCurso} onValueChange={setSelectedCurso}>
                <SelectTrigger id="curso">
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id}>
                      {curso.nombre} ({curso.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
          </div>
        </Card>

        {selectedCurso && <AsistenciaTable cursoId={selectedCurso} fecha={selectedDate} />}
      </TabsContent>

      <TabsContent value="estadisticas">
        <AsistenciaStats />
      </TabsContent>
    </Tabs>
  )
}
