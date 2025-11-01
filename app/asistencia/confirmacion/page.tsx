"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function ConfirmacionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sesionId = searchParams.get("sesion")
  const [sesion, setSesion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSesion = async () => {
      if (!sesionId) {
        setIsLoading(false)
        return
      }

      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from("sesiones_clase")
        .select("*, cursos(nombre)")
        .eq("id", sesionId)
        .single()

      if (error) {
        console.error("[v0] Error loading sesion:", error)
      } else {
        setSesion(data)
      }

      setIsLoading(false)
    }

    loadSesion()
  }, [sesionId])

  if (isLoading) {
    return (
      <PageWrapper className="pt-24 pb-12 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando informacion...</p>
        </div>
      </PageWrapper>
    )
  }

  if (!sesion) {
    return (
      <PageWrapper className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-center text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">No se encontro la sesion</p>
              <Button onClick={() => router.push("/asistencia/scanner")} className="w-full">
                Volver a Escanear
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="border-green-500/50">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-center text-green-600">Asistencia Registrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">Curso</p>
              <p className="font-semibold">{sesion.cursos?.nombre}</p>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-semibold">{new Date(sesion.fecha_sesion).toLocaleDateString("es-ES")}</p>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">Hora</p>
              <p className="font-semibold">
                {sesion.hora_inicio} - {sesion.hora_fin}
              </p>
            </div>
            <Button onClick={() => router.push("/asistencia/scanner")} className="w-full mt-6">
              Escanear Otro QR
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
