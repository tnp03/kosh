import { Link } from "@tanstack/react-router"
import { allNodes } from "content-collections"

interface LayerChipsProps {
  selected?: string | null
  onSelect?: (slug: string | null) => void
}

export function LayerChips({ selected, onSelect }: LayerChipsProps) {
  const layerNodes = allNodes.filter((n) => n.type === "layer")

  return (
    <div className="flex flex-wrap gap-2">
      {layerNodes.map((node) => {
        const isActive = selected === node.slug
        return onSelect ? (
          <button
            key={node.slug}
            onClick={() => onSelect(isActive ? null : node.slug)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all"
            style={
              isActive
                ? { backgroundColor: node.color, borderColor: node.color, color: "white" }
                : { borderColor: node.color + "40" }
            }
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: node.color }} />
            {node.title}
          </button>
        ) : (
          <Link
            key={node.slug}
            to="/nodes/$slug"
            params={{ slug: node.slug }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all hover:shadow-sm"
            style={{ borderColor: node.color + "40" }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: node.color }} />
            {node.title}
          </Link>
        )
      })}
    </div>
  )
}
