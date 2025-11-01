import { BarChart3 } from "lucide-react"

export function ReportesHeader() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-accent/10 rounded-xl">
          <BarChart3 className="h-6 w-6 text-accent" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Reportes y Estadísticas</h1>
      </div>
      <p className="text-muted-foreground text-lg">Visualiza métricas y análisis del sistema académico</p>
    </div>
  )
}
