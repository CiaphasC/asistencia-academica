"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface CursoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mallaId: string
  onSuccess?: () => void
}

interface CursoFormData {
  nombre: string
  codigo: string
  descripcion: string
  creditos: number
  horas_semanales: number
  semestre: number
  tipo: string
  estado: string
}

export function CursoFormDialog({ open, onOpenChange, mallaId, onSuccess }: CursoFormDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [profesores, setProfesores] = React.useState<any[]>([])
  const [selectedProfesor, setSelectedProfesor] = React.useState<string>("")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CursoFormData>({
    defaultValues: {
      tipo: "obligatorio",
      estado: "activo",
    },
  })

  const tipo = watch("tipo")
  const estado = watch("estado")

  React.useEffect(() => {
    if (open) {
      loadProfesores()
    }
  }, [open])

  const loadProfesores = async () => {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase.from("personas").select("*").eq("tipo", "profesor").eq("estado", "activo")

    setProfesores(data || [])
  }

  const onSubmit = async (data: CursoFormData) => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const cursoData = {
        ...data,
        malla_id: mallaId,
        profesor_id: selectedProfesor || null,
      }

      const { error } = await supabase.from("cursos").insert([cursoData])

      if (error) throw error

      onSuccess?.()
      reset()
      setSelectedProfesor("")
    } catch (error) {
      console.error("[v0] Error saving curso:", error)
      alert("Error al guardar el curso")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Curso</DialogTitle>
          <DialogDescription>Completa el formulario para agregar un curso a la malla</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nombre">Nombre del Curso *</Label>
              <Input id="nombre" {...register("nombre", { required: true })} placeholder="Programación I" />
              {errors.nombre && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input id="codigo" {...register("codigo", { required: true })} placeholder="PROG-101" />
              {errors.codigo && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="semestre">Semestre *</Label>
              <Input
                id="semestre"
                type="number"
                {...register("semestre", { required: true, valueAsNumber: true })}
                placeholder="1"
              />
              {errors.semestre && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditos">Créditos *</Label>
              <Input
                id="creditos"
                type="number"
                {...register("creditos", { required: true, valueAsNumber: true })}
                placeholder="4"
              />
              {errors.creditos && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas_semanales">Horas Semanales *</Label>
              <Input
                id="horas_semanales"
                type="number"
                {...register("horas_semanales", { required: true, valueAsNumber: true })}
                placeholder="6"
              />
              {errors.horas_semanales && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={tipo} onValueChange={(value) => setValue("tipo", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="obligatorio">Obligatorio</SelectItem>
                  <SelectItem value="electivo">Electivo</SelectItem>
                  <SelectItem value="practica">Práctica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profesor">Profesor</Label>
              <Select value={selectedProfesor} onValueChange={setSelectedProfesor}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar profesor" />
                </SelectTrigger>
                <SelectContent>
                  {profesores.map((profesor) => (
                    <SelectItem key={profesor.id} value={profesor.id}>
                      {profesor.nombre} {profesor.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" {...register("descripcion")} placeholder="Descripción del curso..." rows={3} />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Crear Curso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
