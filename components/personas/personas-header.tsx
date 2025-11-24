"use client"

import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { PersonaDialog } from "./persona-dialog"

interface PersonasHeaderProps {
  canManage?: boolean
}

export function PersonasHeader({ canManage = false }: PersonasHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Gestión de Personas</h1>
        </div>
        <p className="text-muted-foreground text-lg">Administra estudiantes, profesores y personal académico</p>
      </div>
      {canManage && (
        <>
          <Button size="lg" onClick={() => setIsDialogOpen(true)} className="rounded-xl">
            Agregar Persona
          </Button>
          <PersonaDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </>
      )}
    </div>
  )
}
