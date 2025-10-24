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
import { useRouter } from "next/navigation"

interface MallaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  malla?: any
  onSuccess?: () => void
}

interface MallaFormData {
  nombre: string
  codigo: string
  descripcion: string
  nivel: string
  duracion_semestres: number
  creditos_totales: number
  estado: string
}

export function MallaDialog({ open, onOpenChange, malla, onSuccess }: MallaDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MallaFormData>({
    defaultValues: malla || {
      nivel: "Pregrado",
      estado: "activo",
    },
  })

  const nivel = watch("nivel")
  const estado = watch("estado")

  React.useEffect(() => {
    if (malla) {
      Object.keys(malla).forEach((key) => {
        setValue(key as keyof MallaFormData, malla[key])
      })
    } else {
      reset({
        nivel: "Pregrado",
        estado: "activo",
      })
    }
  }, [malla, setValue, reset])

  const onSubmit = async (data: MallaFormData) => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      if (malla) {
        const { error } = await supabase.from("mallas_curriculares").update(data).eq("id", malla.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("mallas_curriculares").insert([data])

        if (error) throw error
      }

      router.refresh()
      onSuccess?.()
      reset()
    } catch (error) {
      console.error("[v0] Error saving malla:", error)
      alert("Error al guardar la malla curricular")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{malla ? "Editar Malla Curricular" : "Crear Nueva Malla Curricular"}</DialogTitle>
          <DialogDescription>
            {malla ? "Actualiza la información de la malla" : "Completa el formulario para crear una nueva malla"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" {...register("nombre", { required: true })} placeholder="Ingeniería en Sistemas" />
              {errors.nombre && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input id="codigo" {...register("codigo", { required: true })} placeholder="ING-SIS-2024" />
              {errors.codigo && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel">Nivel *</Label>
              <Select value={nivel} onValueChange={(value) => setValue("nivel", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pregrado">Pregrado</SelectItem>
                  <SelectItem value="Postgrado">Postgrado</SelectItem>
                  <SelectItem value="Maestría">Maestría</SelectItem>
                  <SelectItem value="Doctorado">Doctorado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracion_semestres">Duración (semestres) *</Label>
              <Input
                id="duracion_semestres"
                type="number"
                {...register("duracion_semestres", { required: true, valueAsNumber: true })}
                placeholder="10"
              />
              {errors.duracion_semestres && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditos_totales">Créditos Totales *</Label>
              <Input
                id="creditos_totales"
                type="number"
                {...register("creditos_totales", { required: true, valueAsNumber: true })}
                placeholder="240"
              />
              {errors.creditos_totales && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select value={estado} onValueChange={(value) => setValue("estado", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="en_revision">En Revisión</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                {...register("descripcion")}
                placeholder="Descripción del programa académico..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : malla ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
