"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, MapPin, Clock, MoreHorizontal, Eye, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EventoDetailsDialog } from "./evento-details-dialog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Evento } from "@/types/eventos"

interface EventosListProps {
  initialEventos: Evento[]
}

export function EventosList({ initialEventos }: EventosListProps) {
  const [eventos, setEventos] = React.useState<Evento[]>(initialEventos)
  const [selectedEvento, setSelectedEvento] = React.useState<Evento | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false)
  const router = useRouter()

  const handleViewDetails = (evento: Evento) => {
    setSelectedEvento(evento)
    setIsDetailsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este evento?")) return

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("eventos").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting evento:", error)
      alert("Error al eliminar el evento")
    } else {
      setEventos(eventos.filter((e) => e.id !== id))
      router.refresh()
    }
  }

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "seminario":
        return "default"
      case "capacitacion":
        return "secondary"
      case "taller":
        return "outline"
      case "conferencia":
        return "default"
      default:
        return "secondary"
    }
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay eventos registrados</p>
          </div>
        ) : (
          eventos.map((evento) => (
            <Card
              key={evento.id}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2">{evento.nombre}</CardTitle>
                    <Badge variant={getTipoBadgeVariant(evento.tipo)} className="w-fit capitalize mt-2">
                      {evento.tipo}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewDetails(evento)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(evento.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                {evento.descripcion && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{evento.descripcion}</p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{formatDate(evento.fecha_inicio)}</span>
                  </div>

                  {evento.ubicacion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{evento.ubicacion}</span>
                    </div>
                  )}

                  {evento.capacidad_maxima && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Capacidad: {evento.capacidad_maxima} personas</span>
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full bg-transparent" onClick={() => handleViewDetails(evento)}>
                  Ver Detalles
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <EventoDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={(open) => {
          setIsDetailsDialogOpen(open)
          if (!open) setSelectedEvento(null)
        }}
        evento={selectedEvento}
      />
    </>
  )
}
