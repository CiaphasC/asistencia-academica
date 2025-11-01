"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clock, QrCode } from "lucide-react"

import type { CursoConHorarios } from "@/types/asistencia"
import { useAsistencia } from "@/hooks/use-asistencia"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AsistenciaStats } from "./asistencia-stats"

interface AsistenciaManagerProps {
  cursos: CursoConHorarios[]
}

export function AsistenciaManager({ cursos }: AsistenciaManagerProps) {
  const {
    asistencias,
    cursos: cursosState,
    guardando,
    guardarAsistencias,
    matriculas,
    recargandoMatriculas,
    recargandoSesiones,
    refrescarAsistencias,
    refrescarMatriculas,
    refrescarSesiones,
    selectedCursoId,
    selectedSesionId,
    sesiones,
    sesionActual,
    setSelectedCursoId,
    setSelectedSesionId,
    toggleAsistencia,
  } = useAsistencia(cursos)

  const [showQRDialog, setShowQRDialog] = useState(false)

  const handleCursoChange = async (cursoId: string) => {
    setSelectedCursoId(cursoId)
    await Promise.all([refrescarSesiones(), refrescarMatriculas()])
  }

  const handleSesionChange = async (sesionId: string) => {
    setSelectedSesionId(sesionId)
    await refrescarAsistencias()
  }

  const asistentesMarcados = Object.values(asistencias).filter(Boolean).length

  return (
    <Tabs defaultValue="registro" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="registro">Registro de asistencia</TabsTrigger>
        <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
      </TabsList>

      <TabsContent value="registro" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sesiones de clase</CardTitle>
            <CardDescription>Selecciona un curso y la sesión para registrar la asistencia.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="curso">Curso</Label>
              <Select value={selectedCursoId} onValueChange={handleCursoChange} disabled={cursosState.length === 0}>
                <SelectTrigger id="curso">
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursosState.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id}>
                      {curso.nombre} ({curso.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sesion">Sesión</Label>
              <Select
                value={selectedSesionId}
                onValueChange={handleSesionChange}
                disabled={recargandoSesiones || sesiones.length === 0}
              >
                <SelectTrigger id="sesion">
                  <SelectValue placeholder={recargandoSesiones ? "Cargando sesiones..." : "Seleccionar sesión"} />
                </SelectTrigger>
                <SelectContent>
                  {sesiones.map((sesion) => (
                    <SelectItem key={sesion.id} value={sesion.id}>
                      Sesión {sesion.numero_sesion} ·{" "}
                      {format(new Date(sesion.fecha_sesion), "d MMM yyyy", { locale: es })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {sesionActual && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Sesión {sesionActual.numero_sesion}</span>
                {sesionActual.qr_token && (
                  <Button variant="outline" size="sm" onClick={() => setShowQRDialog(true)}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Ver QR
                  </Button>
                )}
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(sesionActual.fecha_sesion), "EEEE d 'de' MMMM yyyy", { locale: es })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {sesionActual.hora_inicio} · {sesionActual.hora_fin}
                </span>
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de asistencia</CardTitle>
            <CardDescription>
              {recargandoMatriculas
                ? "Cargando estudiantes..."
                : `${asistentesMarcados}/${matriculas.length} presentes`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {matriculas.map((matricula) => {
                const persona = matricula.personas
                if (!persona) return null
                const checked = asistencias[matricula.estudiante_id] ?? false
                return (
                  <div key={matricula.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                    <Checkbox checked={checked} onCheckedChange={() => toggleAsistencia(matricula.estudiante_id)} />
                    <span className="flex-1">
                      {persona.nombre} {persona.apellido}
                    </span>
                    <Badge variant={checked ? "default" : "secondary"}>{checked ? "Presente" : "Ausente"}</Badge>
                  </div>
                )
              })}
              {!recargandoMatriculas && matriculas.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No hay estudiantes activos en este curso.</p>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={guardarAsistencias}
                disabled={guardando || !selectedSesionId}
                className="flex-1 min-w-[200px]"
              >
                {guardando ? "Guardando..." : "Guardar asistencia"}
              </Button>
              <Button
                variant="outline"
                onClick={refrescarAsistencias}
                disabled={!selectedSesionId || guardando}
                className="min-w-[180px]"
              >
                Actualizar lista
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Código QR de la sesión</DialogTitle>
              <DialogDescription>Escanea este código para registrar la asistencia.</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center p-6 bg-white rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                  sesionActual?.qr_token ?? "",
                )}`}
                alt="Código QR de la sesión"
                className="w-64 h-64"
              />
            </div>
          </DialogContent>
        </Dialog>
      </TabsContent>

      <TabsContent value="estadisticas">
        <AsistenciaStats />
      </TabsContent>
    </Tabs>
  )
}
