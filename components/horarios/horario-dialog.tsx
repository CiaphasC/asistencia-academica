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

interface HorarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  horario?: any
  onSuccess?: () => void
}

interface HorarioFormData {
  curso_id: string
  aula: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  periodo_academico: string
}

const DIAS_SEMANA = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
]

export function HorarioDialog({ open, onOpenChange, horario, onSuccess }: HorarioDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [cursos, setCursos] = React.useState<any[]>([])
  const [selectedCurso, setSelectedCurso] = React.useState<string>("")
  const [selectedDia, setSelectedDia] = React.useState<string>("1")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<HorarioFormData>({
    defaultValues: horario || {
      periodo_academico: "2024-1",
    },
  })

  React.useEffect(() => {
    if (open) {
      loadCursos()
    }
  }, [open])

  const loadCursos = async () => {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase
      .from("cursos")
      .select("*, personas(nombre, apellido)")
      .eq("estado", "activo")
      .order("nombre")

    setCursos(data || [])
  }

  const onSubmit = async (data: HorarioFormData) => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const curso = cursos.find((c) => c.id === selectedCurso)

      const horarioData = {
        ...data,
        curso_id: selectedCurso,
        profesor_id: curso?.profesor_id || null,
        dia_semana: Number(selectedDia),
        estado: "activo",
      }

      const { error } = await supabase.from("horarios").insert([horarioData])

      if (error) throw error

      router.refresh()
      onSuccess?.()
      reset()
      setSelectedCurso("")
      setSelectedDia("1")
    } catch (error) {
      console.error("[v0] Error saving horario:", error)
      alert("Error al guardar el horario. Verifica que no haya conflictos de horario.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Horario</DialogTitle>
          <DialogDescription>Completa el formulario para crear un nuevo horario de clase</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="curso">Curso *</Label>
              <Select value={selectedCurso} onValueChange={setSelectedCurso}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id}>
                      {curso.nombre} ({curso.codigo})
                      {curso.personas && ` - ${curso.personas.nombre} ${curso.personas.apellido}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dia_semana">Día de la Semana *</Label>
              <Select value={selectedDia} onValueChange={setSelectedDia}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIAS_SEMANA.map((dia) => (
                    <SelectItem key={dia.value} value={dia.value.toString()}>
                      {dia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aula">Aula *</Label>
              <Input id="aula" {...register("aula", { required: true })} placeholder="A-101" />
              {errors.aula && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Hora Inicio *</Label>
              <Input id="hora_inicio" type="time" {...register("hora_inicio", { required: true })} />
              {errors.hora_inicio && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_fin">Hora Fin *</Label>
              <Input id="hora_fin" type="time" {...register("hora_fin", { required: true })} />
              {errors.hora_fin && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="periodo_academico">Periodo Académico *</Label>
              <Input
                id="periodo_academico"
                {...register("periodo_academico", { required: true })}
                placeholder="2024-1"
              />
              {errors.periodo_academico && <span className="text-sm text-destructive">Este campo es requerido</span>}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !selectedCurso}>
              {isLoading ? "Guardando..." : "Crear Horario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
