"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar, Users, ClipboardCheck, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const slides = [
  {
    title: "Gestión de Asistencia Inteligente",
    description: "Controla y monitorea la asistencia académica en tiempo real con tecnología avanzada",
    icon: ClipboardCheck,
    gradient: "from-primary via-accent to-primary",
  },
  {
    title: "Horarios Optimizados",
    description: "Organiza y visualiza horarios académicos de manera eficiente y clara",
    icon: Calendar,
    gradient: "from-accent via-secondary to-accent",
  },
  {
    title: "Gestión de Personas",
    description: "Administra estudiantes, profesores y personal académico desde un solo lugar",
    icon: Users,
    gradient: "from-secondary via-primary to-secondary",
  },
  {
    title: "Reportes Detallados",
    description: "Genera informes completos y visualiza estadísticas académicas en tiempo real",
    icon: BarChart3,
    gradient: "from-primary via-secondary to-primary",
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [scrollY, setScrollY] = React.useState(0)

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Parallax background layers */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Slider content */}
          <div className="relative">
            {slides.map((slide, index) => {
              const Icon = slide.icon
              return (
                <div
                  key={index}
                  className={cn(
                    "transition-all duration-700 ease-in-out",
                    index === currentSlide
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 absolute inset-0 pointer-events-none",
                  )}
                >
                  <div className="text-center space-y-8">
                    {/* Icon with glow effect */}
                    <div className="flex justify-center">
                      <div className="relative">
                        <div
                          className={cn(
                            "absolute inset-0 blur-3xl opacity-50 animate-pulse",
                            `bg-gradient-to-r ${slide.gradient}`,
                          )}
                        />
                        <div className="relative bg-card/50 backdrop-blur-sm p-8 rounded-3xl border border-border">
                          <Icon className="h-20 w-20 text-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h1
                      className={cn(
                        "text-5xl md:text-7xl font-bold text-balance",
                        `bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`,
                      )}
                    >
                      {slide.title}
                    </h1>

                    {/* Description */}
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                      {slide.description}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <Button
                        size="lg"
                        className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        Comenzar Ahora
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="text-lg px-8 py-6 rounded-xl border-2 hover:bg-primary/10 transition-all bg-transparent"
                      >
                        Ver Demo
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation controls */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button variant="ghost" size="icon" onClick={prevSlide} className="h-12 w-12 rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>

            {/* Dots indicator */}
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === currentSlide
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <Button variant="ghost" size="icon" onClick={nextSlide} className="h-12 w-12 rounded-full">
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
