export function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-2000" />
    </div>
  )
}
