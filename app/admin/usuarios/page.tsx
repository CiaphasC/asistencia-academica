import { redirect } from "next/navigation"

import { PageWrapper } from "@/components/page-wrapper"
import { ValidationRequestsPanel } from "@/components/admin/validation-requests-panel"
import { fetchSolicitudesPendientesAdmin } from "@/lib/supabase/queries"

export default async function AdminUsuariosPage() {
  const { userRole, solicitudes } = await fetchSolicitudesPendientesAdmin()

  if (userRole !== "admin") {
    redirect("/")
  }

  return (
    <PageWrapper className="pt-24 pb-12">
      <div className="container mx-auto px-4 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Panel de Validación</h1>
          <p className="text-muted-foreground">
            Revisa y gestiona las solicitudes de activación de docentes y estudiantes.
          </p>
        </header>
        <ValidationRequestsPanel initialSolicitudes={solicitudes} />
      </div>
    </PageWrapper>
  )
}
