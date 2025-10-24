import { PageWrapper } from "@/components/page-wrapper"
import { ReportesHeader } from "@/components/reportes/reportes-header"
import { ReportesCharts } from "@/components/reportes/reportes-charts"

export default function ReportesPage() {
  return (
    <PageWrapper className="pt-24 pb-12">
      <div className="container mx-auto px-4 space-y-8">
        <ReportesHeader />
        <ReportesCharts />
      </div>
    </PageWrapper>
  )
}
