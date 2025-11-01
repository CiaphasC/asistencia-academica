"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface PersonaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  persona?: any
  onSuccess?: () => void
}

interface PersonaFormData {
  nombre: string
  apellido: string
  email: string
  telefono: string
  tipo: string
  documento: string
  fecha_nacimiento: string
  direccion: string
  estado: string
}

export function PersonaDialog({ open, onOpenChange, persona, onSuccess }: PersonaDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PersonaFormData>({
    defaultValues: persona || {
      tipo: "estudiante",
      estado: "activo",
    },
  })

  const tipo = watch("tipo")
  const estado = watch("estado")

  React.useEffect(() => {
    if (persona) {
      Object.keys(persona).forEach((key) => {
        setValue(key as keyof PersonaFormData, persona[key])
      })
    } else {
      reset({
        tipo: "estudiante",
        estado: "activo",
      })
    }
  }, [persona, setValue, reset])

  const onSubmit = async (data: PersonaFormData) => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      if (persona) {
        const { error } = await supabase.from("personas").update(data).eq("id", persona.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("personas").insert([data])

        if (error) throw error
      }

      router.refresh()
      onSuccess?.()
      reset()
    } catch (error) {
      console.error("[v0] Error saving persona:", error)
      alert("Error al guardar la persona")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{persona ? "Editar Persona" : "Agregar Nueva Persona"}</DialogTitle>
          <DialogDescription>
            {persona
              ? "Actualiza la información de la persona"
              : "Completa el formulario para agregar una nueva persona"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" {...register("nombre", { required: true })} placeholder="Juan" />
              {errors.nombre && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input id="apellido" {...register("apellido", { required: true })} placeholder="Pérez" />
              {errors.apellido && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: true })}
                placeholder="juan.perez@universidad.edu"
              />
              {errors.email && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...register("telefono")} placeholder="+1234567890" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento">Documento *</Label>
              <Input id="documento" {...register("documento", { required: true })} placeholder="EST001" />
              {errors.documento && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input id="fecha_nacimiento" type="date" {...register("fecha_nacimiento")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={tipo} onValueChange={(value) => setValue("tipo", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estudiante">Estudiante</SelectItem>
                  <SelectItem value="profesor">Profesor</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="suspendido">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" {...register("direccion")} placeholder="Av. Principal 123" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : persona ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
