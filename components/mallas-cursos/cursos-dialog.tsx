"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BookOpen, Clock, Award, User } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { CursoFormDialog } from "./curso-form-dialog"

interface CursosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  malla: any
}

interface Curso {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  creditos: number
  horas_semanales: number
  semestre: number
  tipo: string
  estado: string
  profesor_id: string | null
  personas?: {
    nombre: string
    apellido: string
  }
}

export function CursosDialog({ open, onOpenChange, malla }: CursosDialogProps) {
  const [cursos, setCursos] = React.useState<Curso[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isCursoDialogOpen, setIsCursoDialogOpen] = React.useState(false)

  React.useEffect(() => {
    if (open && malla) {
      loadCursos()
    }
  }, [open, malla])

  const loadCursos = async () => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase
      .from("cursos")
      .select("*, personas(nombre, apellido)")
      .eq("malla_id", malla.id)
      .order("semestre", { ascending: true })

    if (error) {
      console.error("[v0] Error loading cursos:", error)
    } else {
      setCursos(data || [])
    }

    setIsLoading(false)
  }

  const groupedCursos = cursos.reduce(
    (acc, curso) => {
      if (!acc[curso.semestre]) {
        acc[curso.semestre] = []
      }
      acc[curso.semestre].push(curso)
      return acc
    },
    {} as Record<number, Curso[]>,
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Cursos - {malla?.nombre}</DialogTitle>
            <DialogDescription>Gestiona los cursos de esta malla curricular</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setIsCursoDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Curso
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Cargando cursos...</div>
            ) : Object.keys(groupedCursos).length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay cursos registrados en esta malla</p>
              </div>
            ) : (
              Object.entries(groupedCursos)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([semestre, cursosList]) => (
                  <div key={semestre} className="space-y-4">
                    <h3 className="text-xl font-semibold">Semestre {semestre}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cursosList.map((curso) => (
                        <Card key={curso.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg">{curso.nombre}</CardTitle>
                                <CardDescription className="font-mono text-xs">{curso.codigo}</CardDescription>
                              </div>
                              <Badge
                                variant={curso.tipo === "obligatorio" ? "default" : "secondary"}
                                className="capitalize"
                              >
                                {curso.tipo}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {curso.descripcion && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{curso.descripcion}</p>
                            )}

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <span>{curso.creditos} créditos</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{curso.horas_semanales}h/semana</span>
                              </div>
                            </div>

                            {curso.personas && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>
                                  {curso.personas.nombre} {curso.personas.apellido}
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CursoFormDialog
        open={isCursoDialogOpen}
        onOpenChange={setIsCursoDialogOpen}
        mallaId={malla?.id}
        onSuccess={() => {
          loadCursos()
          setIsCursoDialogOpen(false)
        }}
      />
    </>
  )
}
