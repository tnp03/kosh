import { createFileRoute, Link } from "@tanstack/react-router"
import { allArticles, allNodes, allSites } from "content-collections"
import { useState } from "react"
import { LayerChips } from "~/components/LayerChips"
import {
  Layers, Building2, FileText, Zap, ArrowUpRight,
} from "lucide-react"

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  const layerNodes = allNodes.filter((n) => n.type === "layer")
  const recentArticles = allArticles
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, 6)
  const recentSites = allSites.slice(0, 6)

  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"sites" | "articles">("sites")

  const filteredSites = selectedLayer
    ? recentSites.filter((s) => s.layers.includes(selectedLayer))
    : recentSites
  const filteredArticles = selectedLayer
    ? recentArticles.filter((a) => a.layers.includes(selectedLayer))
    : recentArticles

  const totalSites = allSites.length
  const totalArticles = allArticles.length

  return (
    <div className="min-h-screen">
      {/* Stats row */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Ecosystem Layers</span>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{layerNodes.length}</span>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">11 layers + 4 dimensions</span>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Tracked Sites</span>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{totalSites}</span>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Articles</span>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{totalArticles}</span>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Graph Nodes</span>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{allNodes.length}</span>
              <span className="text-xs text-muted-foreground">total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-3 gap-8">
          {/* Left 2/3 — Layer chips + content */}
          <div className="col-span-2 space-y-6">
            {/* Layer chips */}
            <div className="bg-card rounded-xl border p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Ecosystem Layers</h2>
                <Link
                  to="/graph"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  View full graph <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <LayerChips selected={selectedLayer} onSelect={setSelectedLayer} />
            </div>

            {/* Content tabs */}
            <div className="bg-card rounded-xl border">
              <div className="flex items-center border-b">
                {(["sites", "articles"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setViewMode(tab)}
                    className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                      viewMode === tab
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "sites" && <Building2 className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />}
                    {tab === "articles" && <FileText className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />}
                    {tab}
                  </button>
                ))}
                <div className="flex-1" />
                <div className="px-4 flex items-center gap-2 text-xs text-muted-foreground">
                  {selectedLayer && (
                    <span className="px-2 py-0.5 rounded-full bg-secondary">
                      Filtered by: {layerNodes.find((n) => n.slug === selectedLayer)?.title}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                {viewMode === "sites" && (
                  <div className="divide-y">
                    {filteredSites.map((site) => (
                      <Link
                        key={site.slug}
                        to="/sites/$slug"
                        params={{ slug: site.slug }}
                        className="flex items-center gap-3 py-3 hover:bg-accent rounded px-2 -mx-2 transition-colors"
                      >
                        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground">
                          {site.title[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{site.title}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            {site.type && <span className="px-1.5 py-0.5 rounded bg-secondary">{site.type}</span>}
                            {site.layers.slice(0, 2).map((l) => {
                              const layer = layerNodes.find((n) => n.slug === l)
                              return layer ? (
                                <span key={l} className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: layer.color }} />
                                  {layer.title}
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                    {filteredSites.length === 0 && (
                      <p className="text-sm text-muted-foreground py-4 text-center">No sites in this layer yet.</p>
                    )}
                  </div>
                )}

                {viewMode === "articles" && (
                  <div className="space-y-3">
                    {filteredArticles.map((article) => (
                      <Link
                        key={article.slug}
                        to="/articles/$slug"
                        params={{ slug: article.slug }}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{article.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {article.layers.slice(0, 2).map((l) => {
                              const layer = layerNodes.find((n) => n.slug === l)
                              return layer ? (
                                <span key={l} className="flex items-center gap-1 inline-flex mr-2">
                                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: layer.color }} />
                                  {layer.title}
                                </span>
                              ) : null
                            })}
                            {article.date && <span>· {article.date}</span>}
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                    {filteredArticles.length === 0 && (
                      <p className="text-sm text-muted-foreground py-4 text-center">No articles in this layer yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 1/3 — Quick links */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl border p-4">
              <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/graph" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent text-sm transition-colors">
                  <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layers className="h-4 w-4 text-primary" />
                  </span>
                  <div>
                    <div className="font-medium">Ecosystem Graph</div>
                    <div className="text-xs text-muted-foreground">Interactive map of all layers</div>
                  </div>
                </Link>
                <Link to="/articles" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent text-sm transition-colors">
                  <span className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </span>
                  <div>
                    <div className="font-medium">All Articles</div>
                    <div className="text-xs text-muted-foreground">Browse the knowledge base</div>
                  </div>
                </Link>
                <Link to="/events" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent text-sm transition-colors">
                  <span className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </span>
                  <div>
                    <div className="font-medium">Events</div>
                    <div className="text-xs text-muted-foreground">Funding, M&A, releases</div>
                  </div>
                </Link>
                <Link to="/search" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent text-sm transition-colors">
                  <span className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div>
                    <div className="font-medium">Search</div>
                    <div className="text-xs text-muted-foreground">Find anything</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-card rounded-xl border p-4">
              <h3 className="font-semibold text-sm mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {recentArticles.slice(0, 4).map((article) => (
                  <Link
                    key={article.slug}
                    to="/articles/$slug"
                    params={{ slug: article.slug }}
                    className="flex items-start gap-2 text-sm hover:text-foreground transition-colors"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                    <div>
                      <div className="font-medium line-clamp-1">{article.title}</div>
                      <div className="text-xs text-muted-foreground">{article.date}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
