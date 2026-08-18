import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useCallback } from "react"

interface PrototypeSwitcherProps {
  variants: readonly string[]
  names: Record<string, string>
  current: string
  onChange: (variant: string) => void
}

export function PrototypeSwitcher({ variants, names, current, onChange }: PrototypeSwitcherProps) {
  const idx = variants.indexOf(current as typeof variants[number])

  const prev = useCallback(() => {
    onChange(variants[(idx - 1 + variants.length) % variants.length])
  }, [idx, variants, onChange])

  const next = useCallback(() => {
    onChange(variants[(idx + 1) % variants.length])
  }, [idx, variants, onChange])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [prev, next])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-full border bg-background/95 px-2 py-1.5 shadow-lg backdrop-blur" style={{ minWidth: 320 }}>
      <button onClick={prev} className="rounded-full p-1.5 hover:bg-accent transition-colors" aria-label="Previous variant">
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex-1 text-center">
        <span className="font-mono text-xs font-semibold text-muted-foreground">{current}</span>
        <span className="mx-2 text-muted-foreground">·</span>
        <span className="text-sm">{names[current] ?? current}</span>
      </div>

      <button onClick={next} className="rounded-full p-1.5 hover:bg-accent transition-colors" aria-label="Next variant">
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="ml-2 flex gap-1 border-l pl-2">
        {variants.map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`h-2 w-2 rounded-full transition-colors ${v === current ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
            aria-label={`Switch to variant ${v}`}
          />
        ))}
      </div>
    </div>
  )
}
