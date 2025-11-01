"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users } from "lucide-react"

export default function SelectRolePage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<"estudiante" | "docente" | null>(null)

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/auth/register?role=${selectedRole}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Bienvenido a Asistencia Académica</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Selecciona tu rol para continuar</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Estudiante Card */}
          <Card
            className={`cursor-pointer transition-all duration-300 ${
              selectedRole === "estudiante" ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedRole("estudiante")}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle>Estudiante</CardTitle>
              <CardDescription>Accede como estudiante</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Registra tu asistencia, consulta horarios y accede a tus cursos
            </CardContent>
          </Card>

          {/* Docente Card */}
          <Card
            className={`cursor-pointer transition-all duration-300 ${
              selectedRole === "docente" ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedRole("docente")}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle>Docente</CardTitle>
              <CardDescription>Accede como docente</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Gestiona tus cursos, registra asistencia y genera reportes
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/auth/login")}>
            Iniciar Sesión
          </Button>
          <Button className="flex-1" disabled={!selectedRole} onClick={handleContinue}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
