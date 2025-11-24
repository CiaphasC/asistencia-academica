"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Award, MoreHorizontal, Pencil, Trash2, Eye, Layers } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MallaDialog } from "./malla-dialog"
import { CursosDialog } from "./cursos-dialog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Malla {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  nivel: string
  duracion_semestres: number
  creditos_totales: number
  estado: "activo" | "inactivo" | "en_revision"
}

interface MallasListProps {
  initialMallas: Malla[]
}

export function MallasList({ initialMallas }: MallasListProps) {
  const [mallas, setMallas] = React.useState<Malla[]>(initialMallas)
  const [selectedMalla, setSelectedMalla] = React.useState<Malla | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isCursosDialogOpen, setIsCursosDialogOpen] = React.useState(false)
  const router = useRouter()

  const handleEdit = (malla: Malla) => {
    setSelectedMalla(malla)
    setIsEditDialogOpen(true)
  }

  const handleViewCursos = (malla: Malla) => {
    setSelectedMalla(malla)
    setIsCursosDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta malla curricular?")) return

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("mallas_curriculares").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting malla:", error)
      alert("Error al eliminar la malla curricular")
    } else {
      setMallas(mallas.filter((m) => m.id !== id))
      router.refresh()
    }
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "activo":
        return "default"
      case "inactivo":
        return "secondary"
      case "en_revision":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mallas.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-muted rounded-2xl bg-muted/10">
            <div className="p-5 bg-background rounded-full shadow-sm mb-5">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-1">No hay mallas curriculares</h3>
            <p className="text-muted-foreground max-w-md text-sm">
              Comienza creando tu primera malla curricular para organizar los planes de estudio.
            </p>
          </div>
        ) : (
          mallas.map((malla) => (
            <Card
              key={malla.id}
              className="group relative overflow-hidden border border-border/60 bg-card/80 hover:border-primary/30 transition-all duration-200 hover:shadow-md flex flex-col h-full rounded-2xl"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                      <Badge variant={getEstadoBadgeVariant(malla.estado)} className="capitalize shadow-none">
                        {malla.estado.replace("_", " ")}
                      </Badge>
                      <span className="text-[11px] font-mono bg-muted/60 px-2 py-0.5 rounded border border-border/50">
                        {malla.codigo}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {malla.nombre}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewCursos(malla)} className="cursor-pointer">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver cursos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(malla)} className="cursor-pointer">
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(malla.id)}
                        className="text-destructive cursor-pointer focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 flex flex-col">
                {malla.descripcion ? (
                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{malla.descripcion}</p>
                ) : (
                  <p className="text-muted-foreground/60 text-sm italic">Sin descripción disponible</p>
                )}

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/40 mt-auto">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Duración</span>
                    </div>
                    <span className="text-base font-semibold">{malla.duracion_semestres} semestres</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">
                      <Award className="h-3.5 w-3.5" />
                      <span>Créditos</span>
                    </div>
                    <span className="text-base font-semibold">{malla.creditos_totales} totales</span>
                  </div>
                </div>

                <Button
                  className="w-full h-10 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleViewCursos(malla)}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Gestionar cursos
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <MallaDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) setSelectedMalla(null)
        }}
        malla={selectedMalla}
        onSuccess={() => {
          router.refresh()
          setIsEditDialogOpen(false)
          setSelectedMalla(null)
        }}
      />

      <CursosDialog
        open={isCursosDialogOpen}
        onOpenChange={(open) => {
          setIsCursosDialogOpen(open)
          if (!open) setSelectedMalla(null)
        }}
        malla={selectedMalla}
      />
    </>
  )
}
