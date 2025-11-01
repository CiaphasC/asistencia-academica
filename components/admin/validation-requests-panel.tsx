"use client"

import { useMemo, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { SolicitudValidacion } from "@/types/personas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

const rechazoSchema = z.object({
  motivo: z.string().trim().min(1, "Ingresa un motivo para el rechazo"),
})

type RechazoFormValues = z.infer<typeof rechazoSchema>

interface ValidationRequestsPanelProps {
  initialSolicitudes: SolicitudValidacion[]
}

export function ValidationRequestsPanel({ initialSolicitudes }: ValidationRequestsPanelProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [solicitudes, setSolicitudes] = useState(initialSolicitudes)
  const [selected, setSelected] = useState<SolicitudValidacion | null>(null)
  const [dialogMode, setDialogMode] = useState<"aprobar" | "rechazar" | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<RechazoFormValues>({
    resolver: zodResolver(rechazoSchema),
    defaultValues: { motivo: "" },
  })

  const totalPendientes = solicitudes.length

  const closeDialog = () => {
    setSelected(null)
    setDialogMode(null)
    form.reset()
  }

  const refreshSolicitudes = async () => {
    const { data, error } = await supabase
      .from("solicitudes_validacion")
      .select("id, persona_id, tipo_solicitud, estado, motivo_rechazo, fecha_solicitud, fecha_resolucion, personas(nombre, apellido, email, id, role)")
      .eq("estado", "pendiente")
      .order("fecha_solicitud", { ascending: true })

    if (error) {
      console.error("[admin] Error refrescando solicitudes:", error)
      return
    }

    setSolicitudes(
      (data as SolicitudValidacion[] | null) ?? []
    )
  }

  const aprobarSolicitud = async (solicitud: SolicitudValidacion) => {
    startTransition(async () => {
      const now = new Date().toISOString()

      const { error: solicitudError } = await supabase
        .from("solicitudes_validacion")
        .update({ estado: "aprobado", fecha_resolucion: now })
        .eq("id", solicitud.id)

      if (solicitudError) {
        console.error("[admin] Error al aprobar solicitud:", solicitudError)
        return
      }

      const { error: personaError } = await supabase
        .from("personas")
        .update({
          validado: true,
          estado: "activo",
          fecha_validacion: now,
        })
        .eq("id", solicitud.persona_id)

      if (personaError) {
        console.error("[admin] Error actualizando persona:", personaError)
        return
      }

      await refreshSolicitudes()
      closeDialog()
    })
  }

  const rechazarSolicitud = async (solicitud: SolicitudValidacion, values: RechazoFormValues) => {
    startTransition(async () => {
      const { error } = await supabase
        .from("solicitudes_validacion")
        .update({
          estado: "rechazado",
          motivo_rechazo: values.motivo,
          fecha_resolucion: new Date().toISOString(),
        })
        .eq("id", solicitud.id)

      if (error) {
        console.error("[admin] Error al rechazar solicitud:", error)
        return
      }

      await refreshSolicitudes()
      closeDialog()
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Solicitudes de validación pendientes
          </CardTitle>
          <CardDescription>{totalPendientes} solicitudes en espera</CardDescription>
        </CardHeader>
        <CardContent>
          {totalPendientes === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No hay solicitudes pendientes</p>
          ) : (
            <div className="space-y-4">
              {solicitudes.map((solicitud) => (
                <div key={solicitud.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h4 className="font-semibold leading-tight">
                        {solicitud.personas.nombre} {solicitud.personas.apellido}
                      </h4>
                      <p className="text-sm text-muted-foreground">{solicitud.personas.email}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge className="capitalize">{solicitud.tipo_solicitud}</Badge>
                        <span>
                          {format(new Date(solicitud.fecha_solicitud), "d 'de' MMMM 'de' yyyy", { locale: es })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelected(solicitud)
                          setDialogMode("aprobar")
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive bg-transparent"
                        onClick={() => {
                          setSelected(solicitud)
                          form.reset({ motivo: "" })
                          setDialogMode("rechazar")
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "aprobar" ? "Aprobar solicitud" : "Rechazar solicitud"}
            </DialogTitle>
            <DialogDescription>
              {selected
                ? `${selected.personas.nombre} ${selected.personas.apellido} · ${selected.personas.email}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === "rechazar" && selected ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(async (values) => {
                  await rechazarSolicitud(selected, values)
                })}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="motivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo del rechazo *</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Describe el motivo..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" disabled={isPending} onClick={closeDialog} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" variant="destructive" disabled={isPending} className="flex-1">
                    {isPending ? "Procesando..." : "Rechazar"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Al aprobar, la cuenta se activará automáticamente y el usuario podrá acceder al sistema.
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" disabled={isPending} onClick={closeDialog} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={() => selected && aprobarSolicitud(selected)}
                  disabled={isPending}
                  className="flex-1"
                >
                  {isPending ? "Procesando..." : "Aprobar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
