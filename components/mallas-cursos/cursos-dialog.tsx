"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BookOpen, Clock, Award, User, Search, Grid3x3, List, Trash2, MoreHorizontal } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { CursoFormDialog } from "./curso-form-dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedTipo, setSelectedTipo] = React.useState<string>("todos")
  const [editingCurso, setEditingCurso] = React.useState<Curso | null>(null)

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

  const handleDeleteCurso = async (cursoId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este curso?")) return

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("cursos").delete().eq("id", cursoId)

    if (error) {
      console.error("[v0] Error deleting curso:", error)
      alert("Error al eliminar el curso")
    } else {
      setCursos(cursos.filter((c) => c.id !== cursoId))
    }
  }

  const filteredCursos = cursos.filter((curso) => {
    const matchesSearch =
      curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = selectedTipo === "todos" || curso.tipo === selectedTipo
    return matchesSearch && matchesTipo
  })

  const groupedCursos = filteredCursos.reduce(
    (acc, curso) => {
      if (!acc[curso.semestre]) {
        acc[curso.semestre] = []
      }
      acc[curso.semestre].push(curso)
      return acc
    },
    {} as Record<number, Curso[]>,
  )

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "obligatorio":
        return "default"
      case "electivo":
        return "secondary"
      case "practica":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full max-w-7xl p-0 gap-0 max-h-[95vh] flex flex-col">
          <DialogHeader className="px-6 sm:px-8 pt-6 sm:pt-8 flex-shrink-0 border-b border-border/50">
            <DialogTitle className="text-2xl sm:text-3xl font-bold">{malla?.nombre}</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Gestiona los cursos de esta malla curricular
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 px-6 sm:px-8 py-6 sm:py-8">
              <div className="flex flex-col gap-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-6 sm:-mx-8 px-6 sm:px-8 py-4 z-10 border-b border-border/30">
                <div className="w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <select
                    value={selectedTipo}
                    onChange={(e) => setSelectedTipo(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm bg-background flex-1 sm:flex-none"
                  >
                    <option value="todos">Todos los tipos</option>
                    <option value="obligatorio">Obligatorio</option>
                    <option value="electivo">Electivo</option>
                    <option value="practica">Práctica</option>
                  </select>

                  <Button onClick={() => setIsCursoDialogOpen(true)} className="whitespace-nowrap w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Agregar Curso</span>
                    <span className="sm:hidden">Agregar</span>
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Cargando cursos...</div>
              ) : Object.keys(groupedCursos).length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {searchTerm || selectedTipo !== "todos"
                      ? "No hay cursos que coincidan con los filtros"
                      : "No hay cursos registrados en esta malla"}
                  </p>
                </div>
              ) : (
                <Tabs defaultValue="cards" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="cards" className="flex items-center gap-2 text-xs sm:text-sm">
                      <Grid3x3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Cards</span>
                    </TabsTrigger>
                    <TabsTrigger value="table" className="flex items-center gap-2 text-xs sm:text-sm">
                      <List className="h-4 w-4" />
                      <span className="hidden sm:inline">Tabla</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="cards" className="space-y-8 mt-0">
                    {Object.entries(groupedCursos)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([semestre, cursosList]) => (
                        <div key={semestre} className="space-y-5">
                          <div className="flex items-center gap-3">
                            <div className="h-1 w-8 bg-accent rounded-full"></div>
                            <h3 className="text-lg sm:text-xl font-bold">Semestre {semestre}</h3>
                            <span className="text-xs sm:text-sm text-muted-foreground ml-auto">
                              {cursosList.length} {cursosList.length === 1 ? "curso" : "cursos"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7 lg:gap-8">
                            {cursosList.map((curso) => (
                              <Card
                                key={curso.id}
                                className="hover:shadow-xl transition-all duration-300 hover:border-accent/50 flex flex-col h-full bg-card/50 backdrop-blur-sm border border-border/50"
                              >
                                <CardHeader className="pb-4 space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <CardTitle className="text-base sm:text-lg font-bold leading-snug">
                                        {curso.nombre}
                                      </CardTitle>
                                      <CardDescription className="font-mono text-xs mt-2 text-muted-foreground/70">
                                        {curso.codigo}
                                      </CardDescription>
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
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteCurso(curso.id)}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Eliminar
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <Badge
                                    variant={getTipoBadgeVariant(curso.tipo)}
                                    className="w-fit capitalize text-xs font-medium"
                                  >
                                    {curso.tipo}
                                  </Badge>
                                </CardHeader>

                                <CardContent className="space-y-4 flex-1 flex flex-col">
                                  {curso.descripcion && (
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                      {curso.descripcion}
                                    </p>
                                  )}

                                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/30">
                                    <div className="flex items-center gap-2">
                                      <Award className="h-4 w-4 text-accent flex-shrink-0" />
                                      <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Créditos</span>
                                        <span className="text-sm font-semibold">{curso.creditos}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-accent flex-shrink-0" />
                                      <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Horas/sem</span>
                                        <span className="text-sm font-semibold">{curso.horas_semanales}h</span>
                                      </div>
                                    </div>
                                  </div>

                                  {curso.personas && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-3 border-t border-border/30 mt-auto">
                                      <User className="h-4 w-4 flex-shrink-0" />
                                      <span className="truncate text-xs">
                                        {curso.personas.nombre} {curso.personas.apellido}
                                      </span>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                  </TabsContent>

                  <TabsContent value="table" className="space-y-4 mt-0">
                    <div className="border rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs sm:text-sm">Nombre</TableHead>
                            <TableHead className="text-xs sm:text-sm">Código</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Semestre</TableHead>
                            <TableHead className="text-xs sm:text-sm">Tipo</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden md:table-cell">Créditos</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Horas</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Profesor</TableHead>
                            <TableHead className="text-right text-xs sm:text-sm">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(groupedCursos)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .flatMap(([_, cursosList]) =>
                              cursosList.map((curso) => (
                                <TableRow key={curso.id}>
                                  <TableCell className="font-medium max-w-xs truncate text-xs sm:text-sm">
                                    {curso.nombre}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">{curso.codigo}</TableCell>
                                  <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                                    {curso.semestre}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={getTipoBadgeVariant(curso.tipo)} className="capitalize text-xs">
                                      {curso.tipo}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                                    {curso.creditos}
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                                    {curso.horas_semanales}h
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                                    {curso.personas ? `${curso.personas.nombre} ${curso.personas.apellido}` : "-"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteCurso(curso.id)}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Eliminar
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              )),
                            )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
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
