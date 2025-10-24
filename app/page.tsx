import { PageWrapper } from "@/components/page-wrapper"
import { AuroraBackground } from "@/components/aurora-background"
import { HeroSlider } from "@/components/hero-slider"
import { FeaturesSection } from "@/components/features-section"
import { StatsSection } from "@/components/stats-section"
import { CTASection } from "@/components/cta-section"

export default function HomePage() {
  return (
    <PageWrapper>
      <AuroraBackground />
      <HeroSlider />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
    </PageWrapper>
  )
}
