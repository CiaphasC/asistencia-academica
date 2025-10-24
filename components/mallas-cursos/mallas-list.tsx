"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Award, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
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
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay mallas curriculares registradas</p>
          </div>
        ) : (
          mallas.map((malla) => (
            <Card key={malla.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-xl">{malla.nombre}</CardTitle>
                    <CardDescription className="font-mono text-sm">{malla.codigo}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewCursos(malla)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Cursos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(malla)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(malla.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Badge variant={getEstadoBadgeVariant(malla.estado)} className="w-fit capitalize">
                  {malla.estado.replace("_", " ")}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {malla.descripcion && <p className="text-sm text-muted-foreground line-clamp-2">{malla.descripcion}</p>}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{malla.duracion_semestres} semestres</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{malla.creditos_totales} créditos</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent" onClick={() => handleViewCursos(malla)}>
                  Ver Cursos
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
