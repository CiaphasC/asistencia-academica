"use client"

import * as React from "react"
import { Search, Filter, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { PersonaDialog } from "./persona-dialog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Persona {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string | null
  tipo: "estudiante" | "profesor" | "administrador"
  documento: string
  estado: "activo" | "inactivo" | "suspendido"
  created_at: string
}

interface PersonasTableProps {
  initialPersonas: Persona[]
  canManage?: boolean
}

export function PersonasTable({ initialPersonas, canManage = false }: PersonasTableProps) {
  const [personas, setPersonas] = React.useState<Persona[]>(initialPersonas)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterTipo, setFilterTipo] = React.useState<string>("todos")
  const [filterEstado, setFilterEstado] = React.useState<string>("todos")
  const [selectedPersona, setSelectedPersona] = React.useState<Persona | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const router = useRouter()

  const filteredPersonas = personas.filter((persona) => {
    const matchesSearch =
      persona.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.documento.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = filterTipo === "todos" || persona.tipo === filterTipo
    const matchesEstado = filterEstado === "todos" || persona.estado === filterEstado

    return matchesSearch && matchesTipo && matchesEstado
  })

  const handleEdit = (persona: Persona) => {
    setSelectedPersona(persona)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta persona?")) return

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("personas").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting persona:", error)
      alert("Error al eliminar la persona")
    } else {
      setPersonas(personas.filter((p) => p.id !== id))
      router.refresh()
    }
  }

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "estudiante":
        return "default"
      case "profesor":
        return "secondary"
      case "administrador":
        return "outline"
      default:
        return "default"
    }
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "activo":
        return "default"
      case "inactivo":
        return "secondary"
      case "suspendido":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="estudiante">Estudiantes</SelectItem>
              <SelectItem value="profesor">Profesores</SelectItem>
              <SelectItem value="administrador">Administradores</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="inactivo">Inactivos</SelectItem>
              <SelectItem value="suspendido">Suspendidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            {canManage && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPersonas.length === 0 ? (
            <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron personas
                </TableCell>
              </TableRow>
            ) : (
              filteredPersonas.map((persona) => (
                <TableRow key={persona.id}>
                  <TableCell className="font-medium">
                    {persona.nombre} {persona.apellido}
                  </TableCell>
                  <TableCell>{persona.email}</TableCell>
                  <TableCell className="font-mono text-sm">{persona.documento}</TableCell>
                  <TableCell>
                    <Badge variant={getTipoBadgeVariant(persona.tipo)} className="capitalize">
                      {persona.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getEstadoBadgeVariant(persona.estado)} className="capitalize">
                      {persona.estado}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(persona)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(persona.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <PersonaDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setSelectedPersona(null)
        }}
        persona={selectedPersona}
        onSuccess={() => {
          router.refresh()
          setIsDialogOpen(false)
          setSelectedPersona(null)
        }}
      />
    </div>
  )
}
