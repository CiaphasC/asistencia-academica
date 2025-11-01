import { PageWrapper } from "@/components/page-wrapper"
import { MallasCursosHeader } from "@/components/mallas-cursos/mallas-cursos-header"
import { MallasList } from "@/components/mallas-cursos/mallas-list"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function MallasCursosPage() {
  const supabase = await getSupabaseServerClient()

  const { data: mallas, error } = await supabase
    .from("mallas_curriculares")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching mallas:", error)
  }

  return (
    <PageWrapper className="pt-24 pb-12">
      <div className="container mx-auto px-4 space-y-8">
        <MallasCursosHeader />
        <MallasList initialMallas={mallas || []} />
      </div>
    </PageWrapper>
  )
}
