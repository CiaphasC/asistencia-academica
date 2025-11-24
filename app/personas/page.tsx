import { PageWrapper } from "@/components/page-wrapper"
import { PersonasTable } from "@/components/personas/personas-table"
import { PersonasHeader } from "@/components/personas/personas-header"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function PersonasPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let roleName: string | null = null

  if (user) {
    const { data: roleRow } = await supabase.from("auth_users").select("role, roles(name)").eq("id", user.id).maybeSingle()
    // @ts-ignore
    roleName = roleRow?.roles?.name || roleRow?.role || null
  }

  let personasQuery = supabase.from("personas").select("*")

  if (roleName !== "admin") {
    personasQuery = personasQuery.eq("tipo", "estudiante")
  }

  personasQuery = personasQuery.order("created_at", { ascending: false })

  const { data: personas, error } = await personasQuery

  if (error) {
    console.error("[v0] Error fetching personas:", error)
  }

  const canManage = roleName === "admin"

  return (
    <PageWrapper className="pt-24 pb-12">
      <div className="container mx-auto px-4 space-y-8">
        <PersonasHeader canManage={canManage} />
        <PersonasTable initialPersonas={personas || []} canManage={canManage} />
      </div>
    </PageWrapper>
  )
}
