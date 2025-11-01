"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { CheckCircle, AlertCircle, Clock, BookOpen } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface SesionInfo {
  id: string
  numero_sesion: number
  fecha_sesion: string
  hora_inicio: string
  hora_fin: string
  cursos: {
    nombre: string
    codigo: string
  }
}

export default function QRAsistenciaPage() {
  const params = useParams()
  const token = params.token as string
  const [sesion, setSesion] = useState<SesionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [estudianteId, setEstudianteId] = useState<string | null>(null)

  useEffect(() => {
    loadSesionInfo()
  }, [token])

  const loadSesionInfo = async () => {
    const supabase = getSupabaseBrowserClient()

    try {
      const { data, error: fetchError } = await supabase
        .from("sesiones_clase")
        .select("*, cursos(nombre, codigo)")
        .eq("qr_token", token)
        .single()

      if (fetchError || !data) {
        setError("Código QR inválido o expirado")
        setSesion(null)
      } else {
        setSesion(data)

        // Check if session is still active (within time window)
        const now = new Date()
        const sessionStart = new Date(`${data.fecha_sesion}T${data.hora_inicio}`)
        const sessionEnd = new Date(`${data.fecha_sesion}T${data.hora_fin}`)

        if (now < sessionStart || now > sessionEnd) {
          setError("La sesión no está activa en este momento")
        }
      }
    } catch (err) {
      console.error("[v0] Error loading sesion:", err)
      setError("Error al cargar la información de la sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAttendance = async () => {
    if (!sesion || !estudianteId) {
      setError("Información incompleta")
      return
    }

    setIsRegistering(true)
    const supabase = getSupabaseBrowserClient()

    try {
      // Check if student is enrolled in the course
      const { data: matricula, error: matriculaError } = await supabase
        .from("matriculas")
        .select("id")
        .eq("curso_id", sesion.cursos.id)
        .eq("estudiante_id", estudianteId)
        .single()

      if (matriculaError || !matricula) {
        setError("No estás matriculado en este curso")
        return
      }

      // Register attendance
      const { error: asistenciaError } = await supabase.from("asistencias").upsert(
        [
          {
            sesion_id: sesion.id,
            estudiante_id: estudianteId,
            asistio: true,
            fecha_registro: new Date().toISOString(),
          },
        ],
        {
          onConflict: "sesion_id,estudiante_id",
        },
      )

      if (asistenciaError) throw asistenciaError

      setIsSuccess(true)
    } catch (err) {
      console.error("[v0] Error marking attendance:", err)
      setError("Error al registrar asistencia")
    } finally {
      setIsRegistering(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Cargando información de la sesión...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !sesion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-xl">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">{error || "Código QR inválido"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-green-600">¡Asistencia Registrada!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <p className="text-sm font-medium">{sesion.cursos.nombre}</p>
              <p className="text-xs text-muted-foreground">{sesion.cursos.codigo}</p>
            </div>
            <p className="text-sm text-muted-foreground">Tu asistencia ha sido registrada exitosamente</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl">Marcar Asistencia</CardTitle>
          <CardDescription>Sesión {sesion.numero_sesion}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">{sesion.cursos.nombre}</p>
              <p className="text-xs text-muted-foreground">{sesion.cursos.codigo}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(sesion.fecha_sesion), "d 'de' MMMM 'de' yyyy", { locale: es })} - {sesion.hora_inicio}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ID de Estudiante</label>
            <input
              type="text"
              placeholder="Ingresa tu ID de estudiante"
              value={estudianteId || ""}
              onChange={(e) => setEstudianteId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <Button onClick={handleMarkAttendance} disabled={isRegistering || !estudianteId} className="w-full">
            {isRegistering ? "Registrando..." : "Confirmar Asistencia"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
