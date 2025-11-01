"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageWrapper } from "@/components/page-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QRScanner } from "@/components/qr-scanner"
import { Scan, LinkIcon, AlertCircle } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function ScannerPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [qrToken, setQrToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  const handleScan = (result: string) => {
    setQrToken(result)
    setIsScannerOpen(false)
    handleSubmit(result)
  }

  const handleSubmit = async (token: string = qrToken) => {
    if (!token.trim()) {
      setError("Por favor ingresa un token válido")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseBrowserClient()

      // Get current user's student ID
      const { data: persona, error: personaError } = await supabase
        .from("personas")
        .select("id")
        .eq("auth_id", user.id)
        .single()

      if (personaError) throw new Error("No se encontró tu perfil de estudiante")

      // Call edge function to validate QR
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/validate-qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          qrToken: token,
          estudianteId: persona.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al validar el código QR")
      }

      if (!data.success) {
        setError(data.message || "No se pudo registrar la asistencia")
        return
      }

      // Success - redirect to confirmation
      router.push(`/asistencia/confirmacion?sesion=${data.sesion.id}`)
    } catch (err) {
      console.error("[v0] QR validation error:", err)
      setError(err instanceof Error ? err.message : "Error al procesar el código QR")
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  if (isCheckingAuth) {
    return (
      <PageWrapper className="pt-24 pb-12 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-md">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Marcar Asistencia</h1>
            <p className="text-muted-foreground">Escanea el código QR o ingresa el token manualmente</p>
          </div>

          {error && (
            <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Escanear QR
              </CardTitle>
              <CardDescription>Usa la cámara de tu dispositivo</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsScannerOpen(true)} className="w-full" disabled={isLoading}>
                <Scan className="h-4 w-4 mr-2" />
                {isLoading ? "Procesando..." : "Abrir Escáner"}
              </Button>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">O</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Ingreso Manual
              </CardTitle>
              <CardDescription>Ingresa el token del código QR</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Token QR</Label>
                  <Input
                    id="token"
                    placeholder="qr-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!qrToken.trim() || isLoading}>
                  {isLoading ? "Procesando..." : "Continuar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <QRScanner isOpen={isScannerOpen} onOpenChange={setIsScannerOpen} onScan={handleScan} />
    </PageWrapper>
  )
}
