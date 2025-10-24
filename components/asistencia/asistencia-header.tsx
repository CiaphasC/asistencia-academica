import { ClipboardCheck } from "lucide-react"

export function AsistenciaHeader() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <ClipboardCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Control de Asistencia</h1>
      </div>
      <p className="text-muted-foreground text-lg">Registra y monitorea la asistencia de estudiantes en tiempo real</p>
    </div>
  )
}
