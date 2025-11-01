import { Calendar, Users, ClipboardCheck, BarChart3, BookOpen, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Users,
    title: "Gestión de Personas",
    description: "Administra estudiantes, profesores y personal con perfiles completos y roles personalizados",
  },
  {
    icon: BookOpen,
    title: "Mallas y Cursos",
    description: "Organiza planes de estudio, asignaturas y contenidos académicos de forma estructurada",
  },
  {
    icon: Calendar,
    title: "Horarios Inteligentes",
    description: "Crea y visualiza horarios optimizados con detección automática de conflictos",
  },
  {
    icon: ClipboardCheck,
    title: "Control de Asistencia",
    description: "Registra y monitorea asistencia en tiempo real con múltiples métodos de verificación",
  },
  {
    icon: BarChart3,
    title: "Reportes Avanzados",
    description: "Genera informes detallados con gráficos interactivos y exportación de datos",
  },
  {
    icon: Settings,
    title: "Configuración Flexible",
    description: "Personaliza el sistema según las necesidades específicas de tu institución",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Funcionalidades Completas
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Todo lo que necesitas para gestionar tu institución académica en un solo lugar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
              >
                <CardHeader>
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
