"use client"

import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { HorarioDialog } from "./horario-dialog"

export function HorariosHeader() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-secondary/10 rounded-xl">
            <Calendar className="h-6 w-6 text-secondary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Horarios Académicos</h1>
        </div>
        <p className="text-muted-foreground text-lg">Visualiza y gestiona los horarios de clases</p>
      </div>
      <Button size="lg" onClick={() => setIsDialogOpen(true)} className="rounded-xl">
        Agregar Horario
      </Button>
      <HorarioDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
