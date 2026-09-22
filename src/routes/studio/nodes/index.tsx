import { createFileRoute, Link } from "@tanstack/react-router"
import { listNodes } from "~/lib/content"
import { Plus, Network } from "lucide-react"

export const Route = createFileRoute("/studio/nodes/")({
  component: StudioNodes,
  loader: async () => {
    return { nodes: await listNodes() }
  },
})

function StudioNodes() {
  const { nodes } = Route.useLoaderData()
  const sorted = [...nodes].sort((a, b) => a.title.localeCompare(b.title))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Nodes{" "}
          <span className="text-sm font-normal text-muted-foreground">({nodes.length})</span>
        </h2>
        <Link
          to="/studio/nodes/$slug"
          params={{ slug: "new" }}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> New node
        </Link>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50 text-left">
              <th scope="col" className="px-3 py-2 font-medium">Title</th>
              <th scope="col" className="px-3 py-2 font-medium">Type</th>
              <th scope="col" className="px-3 py-2 font-medium">Edges</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((node) => (
              <tr key={node.slug} className="hover:bg-accent/50 transition-colors">
                <td className="px-3 py-2">
                  <Link
                    to="/studio/nodes/$slug"
                    params={{ slug: node.slug }}
                    className="font-medium hover:underline underline-offset-2 inline-flex items-center gap-2"
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: node.color }}
                      aria-hidden="true"
                    />
                    {node.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">{node.slug}</div>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{node.type}</td>
                <td className="px-3 py-2 text-muted-foreground tabular-nums">
                  {node.edges.length}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-10 text-center text-muted-foreground">
                  <Network className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
                  No nodes yet — create the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
