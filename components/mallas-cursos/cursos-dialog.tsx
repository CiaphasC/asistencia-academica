"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BookOpen, Clock, Award, User, Search, Grid3x3, List, Trash2, MoreHorizontal, GraduationCap, Filter } from "lucide-react"
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
        <DialogContent className="w-full max-w-6xl h-[85vh] p-0 gap-0 flex flex-col bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden rounded-2xl">
          <DialogHeader className="px-8 py-6 flex-shrink-0 border-b border-border/40 bg-gradient-to-r from-primary/5 via-background to-background relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  {malla?.nombre}
                </DialogTitle>
                <DialogDescription className="text-base mt-2 text-muted-foreground/80 max-w-2xl ml-14">
                  Gestiona y visualiza el plan de estudios completo. Organiza asignaturas, créditos y docentes.
                </DialogDescription>
              </div>
              <div className="hidden md:block">
                <Badge variant="outline" className="text-sm px-3 py-1 border-primary/20 bg-primary/5 text-primary">
                  {cursos.length} Asignaturas
                </Badge>
              </div>
            </div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-muted/5 [scrollbar-width:none] [-ms-overflow-style:none]">
            <style>{`[data-radix-dialog-content]::-webkit-scrollbar{display:none;}`}</style>
            <div className="space-y-8 px-8 py-8 max-w-5xl mx-auto">
              <div className="sticky top-0 bg-background/90 backdrop-blur-md -mx-8 px-8 py-4 z-20 border-b border-border/40 shadow-sm">
                <div className="flex flex-col lg:flex-row items-center gap-3 w-full">
                  <div className="relative w-full lg:max-w-[360px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar asignatura o código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background rounded-xl"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto lg:ml-auto">
                    <div className="relative w-full lg:w-48">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <select
                        value={selectedTipo}
                        onChange={(e) => setSelectedTipo(e.target.value)}
                        className="h-11 pl-10 pr-8 py-2 rounded-xl border border-input bg-background text-sm w-full cursor-pointer hover:bg-muted/50"
                      >
                        <option value="todos">Todos los tipos</option>
                        <option value="obligatorio">Obligatorio</option>
                        <option value="electivo">Electivo</option>
                        <option value="practica">Práctica</option>
                      </select>
                    </div>

                    <Button
                      onClick={() => setIsCursoDialogOpen(true)}
                      className="h-11 px-6 rounded-xl shadow-md shadow-primary/15 hover:shadow-primary/30 transition-all w-full lg:w-auto"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Nuevo Curso
                    </Button>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-muted-foreground animate-pulse text-lg">Cargando plan de estudios...</p>
                </div>
              ) : Object.keys(groupedCursos).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-muted rounded-3xl bg-muted/10">
                  <div className="p-6 bg-background rounded-full shadow-sm mb-6">
                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No se encontraron cursos</h3>
                  <p className="text-muted-foreground max-w-md text-lg">
                    {searchTerm || selectedTipo !== "todos"
                      ? "Intenta ajustar los filtros de búsqueda para encontrar lo que buscas."
                      : "Comienza agregando asignaturas a esta malla curricular para estructurar el plan de estudios."}
                  </p>
                </div>
              ) : (
                <Tabs defaultValue="cards" className="w-full">
                  <div className="flex justify-end mb-8">
                    <TabsList className="bg-background border border-border/50 p-1 h-11 rounded-xl shadow-sm">
                      <TabsTrigger value="cards" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none rounded-lg px-4 h-9">
                        <Grid3x3 className="h-4 w-4 mr-2" />
                        Vista Tarjetas
                      </TabsTrigger>
                      <TabsTrigger value="table" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none rounded-lg px-4 h-9">
                        <List className="h-4 w-4 mr-2" />
                        Vista Tabla
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="cards" className="space-y-10 mt-0">
                    {Object.entries(groupedCursos)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([semestre, cursosList]) => (
                        <div key={semestre} className="space-y-5">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-primary-foreground font-bold">
                              {semestre}
                            </div>
                            <div className="flex flex-col">
                              <h3 className="text-lg font-semibold">Semestre {semestre}</h3>
                              <span className="text-sm text-muted-foreground">
                                {cursosList.length} asignaturas planificadas
                              </span>
                            </div>
                            <div className="flex-1 h-px bg-border/70 ml-4" />
                          </div>

                          <div className="grid auto-rows-fr gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
                            {cursosList.map((curso) => (
                              <Card
                                key={curso.id}
                                className="group relative w-full h-full overflow-hidden min-h-[280px] border border-border/60 bg-background hover:bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl"
                              >
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                                <CardHeader className="pb-3 pt-5 px-5 space-y-2">
                                  <div className="flex justify-between items-start gap-3">
                                    <div className="space-y-2 w-full">
                                      <div className="flex items-center justify-between w-full">
                                        <Badge
                                          variant={getTipoBadgeVariant(curso.tipo)}
                                          className="px-2.5 py-0.5 text-xs font-medium rounded-md"
                                        >
                                          {curso.tipo}
                                        </Badge>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 text-muted-foreground hover:text-foreground">
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

                                      <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[48px]">
                                        {curso.nombre}
                                      </CardTitle>

                                      <div className="flex items-center gap-2">
                                        <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground border border-border/50">
                                          {curso.codigo}
                                        </code>
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>

                                <CardContent className="px-5 pb-5 space-y-4 flex-1 flex flex-col">
                                  {curso.descripcion && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[36px] leading-relaxed">
                                      {curso.descripcion}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-auto">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground" title="Créditos">
                                        <Award className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{curso.creditos} CR</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground" title="Horas Semanales">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{curso.horas_semanales}h</span>
                                      </div>
                                    </div>

                                    {curso.personas ? (
                                      <div className="flex items-center gap-2 pl-4 border-l border-border/40" title={`Profesor: ${curso.personas.nombre} ${curso.personas.apellido}`}>
                                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-xs font-semibold text-primary">
                                          {curso.personas.nombre[0]}
                                          {curso.personas.apellido[0]}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 pl-4 border-l border-border/40 opacity-60" title="Sin profesor asignado">
                                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center border border-border">
                                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                  </TabsContent>

                  <TabsContent value="table" className="mt-0">
                    <div className="border rounded-2xl overflow-hidden bg-background shadow-sm">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow className="hover:bg-transparent border-b border-border/60">
                            <TableHead className="font-semibold h-12">Asignatura</TableHead>
                            <TableHead className="font-semibold h-12">Código</TableHead>
                            <TableHead className="font-semibold hidden sm:table-cell h-12">Semestre</TableHead>
                            <TableHead className="font-semibold h-12">Tipo</TableHead>
                            <TableHead className="font-semibold hidden md:table-cell h-12">Créditos</TableHead>
                            <TableHead className="font-semibold hidden lg:table-cell h-12">Horas</TableHead>
                            <TableHead className="font-semibold hidden lg:table-cell h-12">Docente</TableHead>
                            <TableHead className="text-right font-semibold h-12">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(groupedCursos)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .flatMap(([_, cursosList]) =>
                              cursosList.map((curso) => (
                                <TableRow key={curso.id} className="hover:bg-muted/30 transition-colors border-b border-border/40">
                                  <TableCell className="font-medium py-4">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-sm font-semibold text-foreground">{curso.nombre}</span>
                                      {curso.descripcion && (
                                        <span className="text-xs text-muted-foreground truncate max-w-[250px]">{curso.descripcion}</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="font-mono text-xs font-normal bg-muted/30">
                                      {curso.codigo}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell">
                                    <div className="flex items-center gap-2">
                                      <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                        {curso.semestre}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={getTipoBadgeVariant(curso.tipo)} className="capitalize text-xs shadow-none px-2.5 py-0.5 rounded-md">
                                      {curso.tipo}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell font-medium text-muted-foreground">
                                    {curso.creditos} CR
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell font-medium text-muted-foreground">
                                    {curso.horas_semanales}h
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell">
                                    {curso.personas ? (
                                      <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                                          {curso.personas.nombre[0]}
                                          {curso.personas.apellido[0]}
                                        </div>
                                        <span className="text-sm font-medium">
                                          {curso.personas.nombre} {curso.personas.apellido}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-sm italic">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/80">
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
