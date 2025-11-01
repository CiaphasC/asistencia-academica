import { PageWrapper } from "@/components/page-wrapper"
import { EventosHeader } from "@/components/eventos/eventos-header"
import { EventosList } from "@/components/eventos/eventos-list"
import { fetchEventosActivos } from "@/lib/supabase/queries"

export default async function EventosPage() {
  const eventos = await fetchEventosActivos()

  return (
    <PageWrapper className="pt-24 pb-12">
      <div className="container mx-auto px-4 space-y-8">
        <EventosHeader />
        <EventosList initialEventos={eventos} />
      </div>
    </PageWrapper>
  )
}
