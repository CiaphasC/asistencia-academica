import { PageWrapper } from "@/components/page-wrapper"
import { AsistenciaHeader } from "@/components/asistencia/asistencia-header"
import { AsistenciaManager } from "@/components/asistencia/asistencia-manager"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function AsistenciaPage() {
  const supabase = await getSupabaseServerClient()

  const { data: cursos } = await supabase.from("cursos").select("*, horarios(*)").eq("estado", "activo").order("nombre")

  return (
    <PageWrapper className="pt-24 pb-12">
      <div className="container mx-auto px-4 space-y-8">
        <AsistenciaHeader />
        <AsistenciaManager cursos={cursos || []} />
      </div>
    </PageWrapper>
  )
}
