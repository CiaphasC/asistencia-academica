import { PageWrapper } from "@/components/page-wrapper"
import { PersonasTable } from "@/components/personas/personas-table"
import { PersonasHeader } from "@/components/personas/personas-header"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function PersonasPage() {
  const supabase = await getSupabaseServerClient()

  const { data: personas, error } = await supabase
    .from("personas")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching personas:", error)
  }

  return (
    <PageWrapper className="pt-24 pb-12">
      <div className="container mx-auto px-4 space-y-8">
        <PersonasHeader />
        <PersonasTable initialPersonas={personas || []} />
      </div>
    </PageWrapper>
  )
}
