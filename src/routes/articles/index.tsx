import { createFileRoute, Link } from "@tanstack/react-router"
import { allArticles, allNodes } from "content-collections"
import { useState } from "react"
import { LayerChips } from "~/components/LayerChips"
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/articles/")({
  component: ArticlesPage,
})

function ArticlesPage() {
  const layerNodes = allNodes.filter((n) => n.type === "layer")
  const articles = allArticles.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)

  const filtered = selectedLayer
    ? articles.filter((a) => a.layers.includes(selectedLayer))
    : articles

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link to="/">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
        <p className="text-muted-foreground mt-1">
          {articles.length} articles across the AI ecosystem
        </p>
      </div>

      {/* Layer filter */}
      <div className="bg-card rounded-xl border p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Filter by Layer</h2>
          {selectedLayer && (
            <button
              onClick={() => setSelectedLayer(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>
        <LayerChips selected={selectedLayer} onSelect={setSelectedLayer} />
      </div>

      {/* Articles list */}
      <div className="bg-card rounded-xl border">
        <div className="p-4 border-b flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{filtered.length} article{filtered.length !== 1 ? "s" : ""}</span>
          {selectedLayer && (
            <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
              in {layerNodes.find((n) => n.slug === selectedLayer)?.title}
            </span>
          )}
        </div>

        <div className="divide-y">
          {filtered.map((article) => (
            <Link
              key={article.slug}
              to="/articles/$slug"
              params={{ slug: article.slug }}
              className="flex items-center gap-4 px-4 py-4 hover:bg-accent transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium">{article.title}</div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{article.description}</div>
                <div className="flex items-center gap-2 mt-2">
                  {article.layers.slice(0, 2).map((l) => {
                    const layer = layerNodes.find((n) => n.slug === l)
                    return layer ? (
                      <span key={l} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: layer.color }} />
                        {layer.title}
                      </span>
                    ) : null
                  })}
                  {article.date && <span className="text-xs text-muted-foreground">· {article.date}</span>}
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No articles found for this layer.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
