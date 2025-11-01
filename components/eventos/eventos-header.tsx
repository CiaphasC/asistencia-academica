"use client"

import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { EventoDialog } from "./evento-dialog"

export function EventosHeader() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent/10 rounded-xl">
            <Calendar className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Eventos Académicos</h1>
        </div>
        <p className="text-muted-foreground text-lg">Gestiona seminarios, capacitaciones y eventos universitarios</p>
      </div>
      <Button size="lg" onClick={() => setIsDialogOpen(true)} className="rounded-xl">
        Crear Evento
      </Button>
      <EventoDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
