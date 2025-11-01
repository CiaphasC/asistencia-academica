import { PageWrapper } from "@/components/page-wrapper"
import { AsistenciaHeader } from "@/components/asistencia/asistencia-header"
import { AsistenciaManager } from "@/components/asistencia/asistencia-manager"
import { fetchCursosActivos } from "@/lib/supabase/queries"

export default async function AsistenciaPage() {
  const cursos = await fetchCursosActivos()

  return (
    <PageWrapper className="pt-24 pb-12">
      <div className="container mx-auto px-4 space-y-8">
        <AsistenciaHeader />
        <AsistenciaManager cursos={cursos} />
      </div>
    </PageWrapper>
  )
}
