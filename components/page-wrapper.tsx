import type * as React from "react"
import { Navigation } from "@/components/navigation"
import { ScrollProgress } from "@/components/scroll-progress"

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <>
      <ScrollProgress />
      <Navigation />
      <main className={className}>{children}</main>
    </>
  )
}
