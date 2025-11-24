import { PageWrapper } from "@/components/page-wrapper"
import { HorariosHeader } from "@/components/horarios/horarios-header"
import { HorariosCalendar } from "@/components/horarios/horarios-calendar"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function HorariosPage() {
  const supabase = await getSupabaseServerClient()

  const { data: horarios, error } = await supabase
    .from("horarios")
    .select(
      `
      *,
      cursos(
        nombre, 
        codigo,
        docente:personas(nombre, apellido)
      )
    `,
    )
    .eq("estado", "activo")
    .order("dia_semana", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching horarios:", error)
  }

  return (
    <PageWrapper className="pt-24 pb-12">
      <div className="container mx-auto px-4 space-y-8">
        <HorariosHeader />
        <HorariosCalendar initialHorarios={horarios || []} />
      </div>
    </PageWrapper>
  )
}
