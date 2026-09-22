import { createFileRoute, Link } from "@tanstack/react-router"
import { listNodes } from "~/lib/content"
import { useState } from "react"

const nodePositions: Record<string, { x: number; y: number }> = {
  silicon: { x: 400, y: 540 },
  infrastructure: { x: 400, y: 440 },
  data: { x: 220, y: 340 },
  "model-runtime": { x: 580, y: 340 },
  "foundation-models": { x: 400, y: 240 },
  "fine-tuning": { x: 180, y: 190 },
  retrieval: { x: 620, y: 190 },
  "frameworks-tooling": { x: 350, y: 130 },
  agents: { x: 400, y: 60 },
  applications: { x: 400, y: -10 },
  "eval-obs": { x: 660, y: 100 },
  governance: { x: 140, y: 100 },
  languages: { x: 80, y: 320 },
  people: { x: 720, y: 320 },
  places: { x: 720, y: 480 },
  tutorials: { x: 80, y: 480 },
}

const NODE_W = 130
const NODE_H = 34
const DIM_W = 110
const DIM_H = 30

function getEdgeLines(nodes: Array<{ slug: string; edges: string[] }>) {
  const lines: Array<{
    x1: number
    y1: number
    x2: number
    y2: number
    from: string
    to: string
  }> = []
  const seen = new Set<string>()
  for (const node of nodes) {
    const pos = nodePositions[node.slug]
    if (!pos) continue
    for (const edgeSlug of node.edges) {
      const key = [node.slug, edgeSlug].sort().join("|")
      if (seen.has(key)) continue
      seen.add(key)
      const target = nodePositions[edgeSlug]
      if (target) {
        lines.push({ x1: pos.x, y1: pos.y, x2: target.x, y2: target.y, from: node.slug, to: edgeSlug })
      }
    }
  }
  return lines
}

export const Route = createFileRoute("/graph/")({
  component: GraphPage,
  loader: async () => {
    return { nodes: await listNodes() }
  },
})

function GraphPage() {
  const { nodes: allNodes } = Route.useLoaderData()
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const layerNodes = allNodes.filter((n) => n.type === "layer")
  const dimensionNodes = allNodes.filter((n) => n.type === "dimension")
  const edges = getEdgeLines(allNodes)

  const edgeColor = "#94a3b8"
  const edgeHighlight = "#1e293b"

  return (
    <div className="w-full px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Ecosystem Map</h1>
        <p className="text-muted-foreground mt-2">Click a node to explore its layer</p>
      </div>

      <div className="overflow-auto rounded-lg border bg-card">
        <svg viewBox="-30 -30 860 620" className="w-full h-auto" style={{ minWidth: 700, minHeight: 480 }}>
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0, 6 2.5, 0 5" fill={edgeColor} />
            </marker>
            <marker id="arrow-hl" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0, 6 2.5, 0 5" fill={edgeHighlight} />
            </marker>
          </defs>

          {edges.map((edge, i) => {
            const hl = hovered === edge.from || hovered === edge.to
            return (
              <line
                key={i}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={hl ? edgeHighlight : edgeColor}
                strokeWidth={hl ? 2 : 1.2}
                strokeOpacity={hl ? 1 : 0.5}
                markerEnd={hl ? "url(#arrow-hl)" : "url(#arrow)"}
              />
            )
          })}

          {layerNodes.map((node) => {
            const pos = nodePositions[node.slug]
            if (!pos) return null
            const active = hovered === node.slug || selected === node.slug
            return (
              <g
                key={node.slug}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(node.slug)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(selected === node.slug ? null : node.slug)}
              >
                <rect
                  x={pos.x - NODE_W / 2}
                  y={pos.y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  fill={active ? node.color : "var(--card)"}
                  stroke={node.color}
                  strokeWidth={active ? 2.5 : 1.5}
                  style={{ transition: "all 150ms ease" }}
                />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={active ? "#ffffff" : "var(--foreground)"}
                  fontSize={11}
                  fontWeight={600}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {node.title}
                </text>
              </g>
            )
          })}

          {dimensionNodes.map((node) => {
            const pos = nodePositions[node.slug]
            if (!pos) return null
            const active = hovered === node.slug || selected === node.slug
            return (
              <g
                key={node.slug}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(node.slug)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(selected === node.slug ? null : node.slug)}
              >
                <rect
                  x={pos.x - DIM_W / 2}
                  y={pos.y - DIM_H / 2}
                  width={DIM_W}
                  height={DIM_H}
                  rx={15}
                  fill={active ? node.color : "var(--secondary)"}
                  stroke={node.color}
                  strokeWidth={active ? 2 : 1.2}
                  strokeDasharray="5 3"
                  style={{ transition: "all 150ms ease" }}
                />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={active ? "#ffffff" : "var(--muted-foreground)"}
                  fontSize={10}
                  fontWeight={500}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {node.title}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {selected && (() => {
        const node = allNodes.find((n) => n.slug === selected)
        if (!node) return null
        return (
          <div className="mt-6 p-6 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{node.title}</h2>
              <Link
                to="/nodes/$slug"
                params={{ slug: node.slug }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                View full page →
              </Link>
            </div>
            <p className="text-muted-foreground mb-4">{node.description}</p>
            <div className="flex flex-wrap gap-2">
              {node.edges.map((edge) => {
                const target = allNodes.find((n) => n.slug === edge)
                return (
                  <button
                    key={edge}
                    onClick={() => setSelected(edge)}
                    className="text-xs px-2 py-1 rounded-full border hover:bg-accent"
                  >
                    {target?.title ?? edge}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
