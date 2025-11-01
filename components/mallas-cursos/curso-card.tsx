"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, User } from "lucide-react"

interface CursoCardProps {
  nombre: string
  codigo: string
  tipo: string
  creditos: number
  horasSemana: number
  descripcion: string
  profesor: string
}

export function CursoCard({ nombre, codigo, tipo, creditos, horasSemana, descripcion, profesor }: CursoCardProps) {
  return (
    <Card className="group relative overflow-hidden bg-card hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-primary/50 flex flex-col h-full">
      <div className="p-5 sm:p-6 flex flex-col h-full gap-4">
        {/* Header with title and badge */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight flex-1">{nombre}</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono">{codigo}</p>
        </div>

        {/* Type badge */}
        <div>
          <Badge variant={tipo === "Obligatorio" ? "default" : "secondary"} className="text-xs">
            {tipo}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{descripcion}</p>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary/70" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Créditos</span>
              <span className="text-sm font-semibold text-foreground">{creditos}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary/70" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Horas</span>
              <span className="text-sm font-semibold text-foreground">{horasSemana}h/sem</span>
            </div>
          </div>
        </div>

        {/* Professor */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
          <User className="w-4 h-4 text-primary/70" />
          <span className="text-sm text-muted-foreground">{profesor}</span>
        </div>
      </div>
    </Card>
  )
}
