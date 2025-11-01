import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-secondary p-1">
            <div className="bg-background rounded-[22px] p-12 md:p-16 text-center space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-balance">
                ¿Listo para transformar tu gestión académica?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                Únete a las instituciones que ya confían en nuestro sistema para optimizar sus procesos educativos
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="text-lg px-8 py-6 rounded-xl group">
                  <Link href="/asistencia">
                    Comenzar Ahora
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 rounded-xl border-2 bg-transparent"
                >
                  <Link href="/reportes">Ver Reportes</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
