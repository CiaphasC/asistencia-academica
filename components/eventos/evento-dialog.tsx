"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Evento } from "@/types/eventos"

interface EventoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evento?: Evento
  onSuccess?: () => void
}

const tiposEvento = ["seminario", "capacitacion", "taller", "conferencia", "otro"] as const
const estadosEvento = ["activo", "inactivo", "cancelado", "finalizado"] as const

const eventoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().trim().optional(),
  tipo: z.enum(tiposEvento, { required_error: "Selecciona un tipo" }),
  fecha_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  fecha_fin: z.string().min(1, "La fecha de fin es obligatoria"),
  ubicacion: z.string().trim().optional(),
  capacidad_maxima: z
    .preprocess(
      (value) => {
        if (value === "" || value === null || typeof value === "undefined") return null
        const numberValue = Number(value)
        return Number.isNaN(numberValue) ? null : numberValue
      },
      z.number().positive("Debe ser mayor a 0").nullable(),
    )
    .optional(),
  estado: z.enum(estadosEvento, { required_error: "Selecciona un estado" }),
})

type EventoFormValues = z.infer<typeof eventoSchema>

function formatDateTimeInput(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return `${date.toISOString().slice(0, 16)}`
}

function buildPayload(values: EventoFormValues, enlace_publico?: string) {
  return {
    ...values,
    descripcion: values.descripcion ?? null,
    ubicacion: values.ubicacion ?? null,
    capacidad_maxima: values.capacidad_maxima ?? null,
    fecha_inicio: new Date(values.fecha_inicio).toISOString(),
    fecha_fin: new Date(values.fecha_fin).toISOString(),
    enlace_publico:
      enlace_publico || `evento-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
  }
}

export function EventoDialog({ open, onOpenChange, evento, onSuccess }: EventoDialogProps) {
  const router = useRouter()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<EventoFormValues>({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      tipo: "seminario",
      fecha_inicio: "",
      fecha_fin: "",
      ubicacion: "",
      capacidad_maxima: null,
      estado: "activo",
    },
  })

  useEffect(() => {
    if (evento) {
      form.reset({
        nombre: evento.nombre,
        descripcion: evento.descripcion ?? "",
        tipo: (evento.tipo as EventoFormValues["tipo"]) ?? "otro",
        fecha_inicio: formatDateTimeInput(evento.fecha_inicio),
        fecha_fin: formatDateTimeInput(evento.fecha_fin),
        ubicacion: evento.ubicacion ?? "",
        capacidad_maxima: evento.capacidad_maxima ?? null,
        estado: (evento.estado as EventoFormValues["estado"]) ?? "activo",
      })
    } else {
      form.reset({
        nombre: "",
        descripcion: "",
        tipo: "seminario",
        fecha_inicio: "",
        fecha_fin: "",
        ubicacion: "",
        capacidad_maxima: null,
        estado: "activo",
      })
    }
  }, [evento, form, open])

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true)
    try {
      const payload = buildPayload(values, evento?.enlace_publico)

      if (evento) {
        const { error } = await supabase.from("eventos").update(payload).eq("id", evento.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("eventos").insert([payload])
        if (error) throw error
      }

      router.refresh()
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error guardando evento:", error)
      alert("Error al guardar el evento")
    } finally {
      setIsLoading(false)
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{evento ? "Editar evento" : "Crear nuevo evento"}</DialogTitle>
          <DialogDescription>
            {evento
              ? "Actualiza la información y confirma los cambios."
              : "Completa el formulario para registrar un evento."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 space-y-2">
                    <FormLabel>Nombre del evento *</FormLabel>
                    <FormControl>
                      <Input placeholder="Seminario de IA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Tipo *</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposEvento.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo === "capacitacion" ? "Capacitación" : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Estado *</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {estadosEvento.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado.charAt(0).toUpperCase() + estado.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fecha_inicio"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Fecha y hora de inicio *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fecha_fin"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Fecha y hora de fin *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ubicacion"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Auditorio principal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacidad_maxima"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Capacidad máxima</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder="100"
                        min={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem className="space-y-2 md:col-span-2">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Describe el objetivo del evento..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : evento ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
