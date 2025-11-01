"use client"

import type React from "react"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Calendar, CheckCircle } from "lucide-react"

export default function EventoRegistroPage() {
  const params = useParams()
  const enlace = params.enlace as string
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    institucion: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = getSupabaseBrowserClient()

    try {
      const { data: evento } = await supabase.from("eventos").select("id").eq("enlace_publico", enlace).single()

      if (!evento) {
        alert("Evento no encontrado")
        return
      }

      const { error } = await supabase.from("participantes_eventos").insert([
        {
          evento_id: evento.id,
          ...formData,
        },
      ])

      if (error) throw error

      setIsSuccess(true)
      setFormData({ nombre: "", email: "", telefono: "", institucion: "" })
    } catch (error) {
      console.error("[v0] Error registering:", error)
      alert("Error al registrarse. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl">Registro de Evento</CardTitle>
          <CardDescription>Completa el formulario para registrarte</CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg">¡Registro Exitoso!</h3>
              <p className="text-sm text-muted-foreground">
                Tu registro ha sido confirmado. Recibirás un correo de confirmación pronto.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="juan@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+34 123 456 789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institucion">Institución</Label>
                <Input
                  id="institucion"
                  value={formData.institucion}
                  onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                  placeholder="Universidad Central"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
