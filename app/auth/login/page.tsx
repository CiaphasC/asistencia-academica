"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowLeft, BookOpen, Lock, Mail, User } from "lucide-react"

import { loginAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const loginSchema = z.object({
  role: z.enum(["estudiante", "docente"], {
    required_error: "Selecciona tu rol para continuar",
  }),
  email: z.string().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),
  password: z.string().min(6, "La contraseña es obligatoria"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const selectedRole = form.watch("role")

  const onSubmit = form.handleSubmit(async (values) => {
    setGlobalError(null)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("email", values.email)
      formData.append("password", values.password)
      formData.append("role", values.role)

      const result = await loginAction(null, formData)

      if (result?.message) {
        setGlobalError(result.message)
        if (result.error) {
          // Optional: map field errors back to form if needed
          console.error("Validation errors:", result.error)
        }
      }
      // If no message, it means redirect happened (or will happen)
    } catch (error) {
      console.error("[v0] Login error:", error)
      setGlobalError("Ocurrió un error inesperado.")
    } finally {
      setIsLoading(false)
    }
  })

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted to-background flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Volver al inicio</span>
        </Link>

        <Card className="border border-border/50 shadow-2xl backdrop-blur-sm bg-background/95 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center space-y-3 pb-6">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold">Iniciar sesión</CardTitle>
            <CardDescription className="text-sm sm:text-base">Accede a Asistencia Académica</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
                {globalError && (
                  <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-in shake duration-300">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-destructive">{globalError}</p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-semibold">Selecciona tu rol</FormLabel>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => field.onChange("estudiante")}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 group ${
                            field.value === "estudiante"
                              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <User
                              className={`h-5 w-5 transition-colors ${
                                field.value === "estudiante"
                                  ? "text-primary"
                                  : "text-muted-foreground group-hover:text-foreground"
                              }`}
                            />
                            <p className="text-sm font-medium">Estudiante</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange("docente")}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 group ${
                            field.value === "docente"
                              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <BookOpen
                              className={`h-5 w-5 transition-colors ${
                                field.value === "docente"
                                  ? "text-primary"
                                  : "text-muted-foreground group-hover:text-foreground"
                              }`}
                            />
                            <p className="text-sm font-medium">Docente</p>
                          </div>
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-medium">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            type="email"
                            placeholder="tu@email.com"
                            className="pl-10 text-sm sm:text-base transition-all focus:ring-2 focus:ring-primary/50"
                            autoComplete="email"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-medium">Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 text-sm sm:text-base transition-all focus:ring-2 focus:ring-primary/50"
                            autoComplete="current-password"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading || !selectedRole}
                  className="w-full text-sm sm:text-base font-medium transition-all duration-300 hover:shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-background border-t-foreground rounded-full animate-spin" />
                      Iniciando sesión...
                    </span>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>

                <p className="text-center text-xs sm:text-sm text-muted-foreground">
                  ¿No tienes cuenta?{" "}
                  <Link
                    href="/auth/select-role"
                    className="text-accent hover:text-accent/80 underline font-medium transition-colors"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
