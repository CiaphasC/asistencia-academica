"use client"

import { BookOpen, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { MallaDialog } from "./malla-dialog"

export function MallasCursosHeader() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background via-muted/40 to-background p-6 md:p-8 shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(45,212,191,0.06),transparent_35%)]" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <Sparkles className="h-3 w-3" />
              <span>Gestión académica</span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Mallas y Cursos</h1>
            <p className="text-muted-foreground text-base md:text-lg mt-2 leading-relaxed">
              Diseña, organiza y administra los planes de estudio y asignaturas de tu institución con facilidad.
            </p>
          </div>
        </div>

        <Button
          size="default"
          onClick={() => setIsDialogOpen(true)}
          className="rounded-lg h-11 px-5 text-sm font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Malla Curricular
        </Button>
      </div>

      <MallaDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
