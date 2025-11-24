"use server"

import { z } from "zod"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["estudiante", "docente"]),
})

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string

  const validatedFields = loginSchema.safeParse({
    email,
    password,
    role,
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      message: "Datos inválidos. Por favor revisa los campos.",
    }
  }

  const supabase = await getSupabaseServerClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Supabase Auth Error:", error)
      return { message: "Credenciales inválidas. Verifica tu correo y contraseña." }
    }

    if (!data.user) {
      return { message: "Error inesperado al iniciar sesión." }
    }

    // Verificar rol y estado en la base de datos
    const { data: authUser, error: authUserError } = await supabase
      .from("auth_users")
      .select("role, role_id, roles(name), validado, estado")
      .eq("id", data.user.id)
      .single()

    if (authUserError) {
      console.error("Auth User Fetch Error:", authUserError)
      await supabase.auth.signOut()
      return { message: "Error al verificar tu cuenta. Contacta a soporte." }
    }

    // @ts-ignore - roles is joined
    const userRole = authUser.roles?.name || authUser.role

    if (userRole !== role) {
      await supabase.auth.signOut()
      return { message: `Esta cuenta está registrada como ${userRole}, no como ${role}.` }
    }

    if (!authUser.validado) {
      await supabase.auth.signOut()
      return { message: "Tu cuenta está pendiente de validación." }
    }

    if (authUser.estado !== "activo") {
      await supabase.auth.signOut()
      return { message: "Tu cuenta no está activa." }
    }

  } catch (error) {
    console.error("Login Action Error:", error)
    return { message: "Ocurrió un error interno. Inténtalo más tarde." }
  }

  redirect("/")
}
