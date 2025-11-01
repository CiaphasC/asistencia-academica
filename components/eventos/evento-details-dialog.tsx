"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, MapPin, Users, Copy, Check } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface EventoDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evento: any
}

interface Participante {
  id: string
  nombre: string
  email: string
  telefono: string | null
  institucion: string | null
  asistio: boolean
  fecha_registro: string
}

export function EventoDetailsDialog({ open, onOpenChange, evento }: EventoDetailsDialogProps) {
  const [participantes, setParticipantes] = React.useState<Participante[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isRegistering, setIsRegistering] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [formData, setFormData] = React.useState({
    nombre: "",
    email: "",
    telefono: "",
    institucion: "",
  })

  React.useEffect(() => {
    if (open && evento) {
      loadParticipantes()
    }
  }, [open, evento])

  const loadParticipantes = async () => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase
      .from("participantes_eventos")
      .select("*")
      .eq("evento_id", evento.id)
      .order("fecha_registro", { ascending: false })

    if (error) {
      console.error("[v0] Error loading participantes:", error)
    } else {
      setParticipantes(data || [])
    }

    setIsLoading(false)
  }

  const handleRegisterParticipant = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegistering(true)

    const supabase = getSupabaseBrowserClient()

    try {
      const { error } = await supabase.from("participantes_eventos").insert([
        {
          evento_id: evento.id,
          ...formData,
        },
      ])

      if (error) throw error

      setFormData({ nombre: "", email: "", telefono: "", institucion: "" })
      loadParticipantes()
    } catch (error) {
      console.error("[v0] Error registering participant:", error)
      alert("Error al registrar participante")
    } finally {
      setIsRegistering(false)
    }
  }

  const copyPublicLink = () => {
    const link = `${window.location.origin}/eventos/registro/${evento.enlace_publico}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{evento?.nombre}</DialogTitle>
          <DialogDescription>Gestiona los detalles y participantes del evento</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="participantes">Participantes ({participantes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Tipo de Evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="capitalize">{evento?.tipo}</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="capitalize">
                    {evento?.estado}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha y Hora
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Inicio:</span> {formatDate(evento?.fecha_inicio)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Fin:</span> {formatDate(evento?.fecha_fin)}
                  </p>
                </CardContent>
              </Card>

              {evento?.ubicacion && (
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Ubicación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{evento?.ubicacion}</p>
                  </CardContent>
                </Card>
              )}

              {evento?.capacidad_maxima && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Capacidad
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{evento?.capacidad_maxima} personas</p>
                  </CardContent>
                </Card>
              )}

              {evento?.descripcion && (
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Descripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{evento?.descripcion}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Enlace Público de Registro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/eventos/registro/${evento?.enlace_publico}`}
                      className="text-xs"
                    />
                    <Button size="sm" variant="outline" onClick={copyPublicLink}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="participantes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nuevo Participante</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterParticipant} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institucion">Institución</Label>
                      <Input
                        id="institucion"
                        value={formData.institucion}
                        onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isRegistering}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isRegistering ? "Registrando..." : "Registrar Participante"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Participantes Registrados</CardTitle>
                <CardDescription>{participantes.length} participantes</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Cargando participantes...</p>
                ) : participantes.length === 0 ? (
                  <p className="text-muted-foreground">No hay participantes registrados</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Nombre</th>
                          <th className="text-left py-2 px-2">Email</th>
                          <th className="text-left py-2 px-2">Institución</th>
                          <th className="text-left py-2 px-2">Asistió</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participantes.map((p) => (
                          <tr key={p.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2">{p.nombre}</td>
                            <td className="py-2 px-2 text-xs text-muted-foreground">{p.email}</td>
                            <td className="py-2 px-2 text-xs text-muted-foreground">{p.institucion || "-"}</td>
                            <td className="py-2 px-2">
                              <Badge variant={p.asistio ? "default" : "secondary"}>{p.asistio ? "Sí" : "No"}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
