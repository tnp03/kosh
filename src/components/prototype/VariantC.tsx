import { useState } from "react"
import {
  Search, Bell, Settings, Plus, Calendar, Eye,
  TrendingUp, MessageCircle, Heart, Share2, Edit3,
  LayoutGrid, List, Filter, Layers, Building2, FileText,
  Zap, ArrowUpRight, ChevronRight, GitBranch, Clock
} from "lucide-react"

interface Page {
  id: string; title: string; icon: string; blocks: number; updated: string; status: "published" | "draft"
}
interface Block {
  id: string; type: string; content: string
}

const ecosystemLayers = [
  { slug: "silicon", title: "Silicon & Chips", color: "#dc2626", sites: 5, articles: 0 },
  { slug: "infrastructure", title: "Infrastructure", color: "#2563eb", sites: 3, articles: 0 },
  { slug: "data", title: "Data", color: "#7c3aed", sites: 2, articles: 0 },
  { slug: "model-runtime", title: "Model Runtime", color: "#059669", sites: 4, articles: 0 },
  { slug: "foundation-models", title: "Foundation Models", color: "#ea580c", sites: 7, articles: 4 },
  { slug: "fine-tuning", title: "Fine-tuning", color: "#ca8a04", sites: 3, articles: 1 },
  { slug: "retrieval", title: "Retrieval & Memory", color: "#0891b2", sites: 3, articles: 1 },
  { slug: "frameworks-tooling", title: "Frameworks", color: "#9333ea", sites: 3, articles: 2 },
  { slug: "agents", title: "Agents", color: "#e11d48", sites: 3, articles: 0 },
  { slug: "applications", title: "Applications", color: "#0d9488", sites: 4, articles: 0 },
  { slug: "eval-obs", title: "Eval & Guardrails", color: "#4f46e5", sites: 2, articles: 0 },
  { slug: "governance", title: "Governance", color: "#64748b", sites: 1, articles: 0 },
]

const recentSites = [
  { id: "s1", title: "OpenAI", layers: ["foundation-models", "fine-tuning"], type: "company", updated: "2h ago" },
  { id: "s2", title: "Anthropic", layers: ["foundation-models", "governance"], type: "company", updated: "1d ago" },
  { id: "s3", title: "NVIDIA", layers: ["silicon", "infrastructure"], type: "company", updated: "3d ago" },
  { id: "s4", title: "vLLM", layers: ["model-runtime"], type: "project", updated: "5d ago" },
  { id: "s5", title: "LangChain", layers: ["frameworks-tooling"], type: "project", updated: "1w ago" },
  { id: "s6", title: "Pinecone", layers: ["retrieval"], type: "company", updated: "1w ago" },
]

const recentEvents = [
  { id: "e1", type: "funding", title: "xAI raises $6B Series C", date: "2d ago", site: "xAI" },
  { id: "e2", type: "model_release", title: "GPT-4o mini released", date: "3d ago", site: "OpenAI" },
  { id: "e3", type: "ma", title: "Inflection AI acquired by Microsoft", date: "1w ago", site: "Inflection" },
  { id: "e4", type: "paper", title: "Mixture of Experts at Scale", date: "2w ago", site: "Google" },
]

const eventColors: Record<string, string> = {
  funding: "#16a34a",
  ma: "#dc2626",
  model_release: "#2563eb",
  paper: "#7c3aed",
}

export function VariantC({ pages, blocks }: { pages: Page[]; blocks: Block[] }) {
  const [selectedPage, setSelectedPage] = useState(pages[0])
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"sites" | "articles" | "events">("sites")
  const [editing, setEditing] = useState(false)

  const totalSites = ecosystemLayers.reduce((a, l) => a + l.sites, 0)
  const totalArticles = ecosystemLayers.reduce((a, l) => a + l.articles, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <span className="text-xl">🧠</span> Kosh Studio
              </h1>
              <nav className="hidden md:flex items-center gap-1 text-sm">
                <button className="px-3 py-1.5 rounded-full bg-gray-900 text-white font-medium">Dashboard</button>
                <button className="px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100">Graph</button>
                <button className="px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100">Sites</button>
                <button className="px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100">Events</button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sites, articles..."
                  className="pl-9 pr-4 py-1.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-gray-900/10 w-56"
                />
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell className="h-4 w-4 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="h-4 w-4 text-gray-600" />
              </button>
              <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800">
                <Plus className="h-4 w-4" />
                Add Site
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Ecosystem Layers</span>
              <Layers className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{ecosystemLayers.length}</span>
              <span className="text-xs text-green-600 font-medium">11 layers + 4 dimensions</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Tracked Sites</span>
              <Building2 className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{totalSites}</span>
              <span className="text-xs text-green-600 font-medium">+3 this week</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Articles</span>
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{totalArticles}</span>
              <span className="text-xs text-green-600 font-medium">+2 this week</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Events Tracked</span>
              <Zap className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{recentEvents.length}</span>
              <span className="text-xs text-green-600 font-medium">funding · M&A · releases</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left 2/3 — Layer breakdown + content */}
          <div className="col-span-2 space-y-6">
            {/* Layer chips */}
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">Ecosystem Layers</h2>
                <button className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
                  View full graph <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ecosystemLayers.map(layer => (
                  <button
                    key={layer.slug}
                    onClick={() => setSelectedLayer(selectedLayer === layer.slug ? null : layer.slug)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all ${
                      selectedLayer === layer.slug
                        ? "text-white shadow-md"
                        : "bg-white text-gray-700 hover:shadow-sm"
                    }`}
                    style={selectedLayer === layer.slug ? { backgroundColor: layer.color, borderColor: layer.color } : { borderColor: layer.color + "40" }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: layer.color }} />
                    {layer.title}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      selectedLayer === layer.slug ? "bg-white/20" : "bg-gray-100"
                    }`}>
                      {layer.sites + layer.articles}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content tabs */}
            <div className="bg-white rounded-xl border">
              <div className="flex items-center border-b">
                {(["sites", "articles", "events"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setViewMode(tab)}
                    className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                      viewMode === tab
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab === "sites" && <Building2 className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />}
                    {tab === "articles" && <FileText className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />}
                    {tab === "events" && <Zap className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />}
                    {tab}
                  </button>
                ))}
                <div className="flex-1" />
                <div className="px-4 flex items-center gap-2">
                  <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {viewMode === "sites" && (
                  <div className="divide-y">
                    {recentSites
                      .filter(s => !selectedLayer || s.layers.includes(selectedLayer))
                      .map(site => (
                      <div key={site.id} className="flex items-center gap-3 py-3 hover:bg-gray-50 rounded px-2 -mx-2 cursor-pointer">
                        <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                          {site.title[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{site.title}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-gray-100">{site.type}</span>
                            {site.layers.map(l => {
                              const layer = ecosystemLayers.find(el => el.slug === l)
                              return layer ? (
                                <span key={l} className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: layer.color }} />
                                  {layer.title}
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{site.updated}</span>
                        <button className="p-1.5 rounded hover:bg-gray-200 text-gray-400">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === "articles" && (
                  <div className="space-y-3">
                    {pages.filter(p => !selectedLayer || true).map(page => (
                      <div
                        key={page.id}
                        onClick={() => setSelectedPage(page)}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm cursor-pointer transition-shadow"
                      >
                        <span className="text-2xl">{page.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{page.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {page.blocks} blocks · {page.updated}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          page.status === "published" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {page.status}
                        </span>
                        <button className="p-1.5 rounded hover:bg-gray-200 text-gray-400">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === "events" && (
                  <div className="space-y-2">
                    {recentEvents.map(event => (
                      <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: eventColors[event.type] }} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-gray-500">{event.site} · {event.date}</div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                          {event.type.replace("_", " ")}
                        </span>
                        <button className="p-1.5 rounded hover:bg-gray-200 text-gray-400">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 1/3 — Preview + Layer detail */}
          <div className="space-y-4">
            {/* Layer detail card */}
            {selectedLayer && (() => {
              const layer = ecosystemLayers.find(l => l.slug === selectedLayer)
              if (!layer) return null
              return (
                <div className="bg-white rounded-xl border overflow-hidden">
                  <div className="px-4 py-3 border-b flex items-center gap-2" style={{ backgroundColor: layer.color + "10" }}>
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: layer.color }} />
                    <h3 className="font-semibold text-sm" style={{ color: layer.color }}>{layer.title}</h3>
                  </div>
                  <div className="p-4 text-sm space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Sites</span>
                      <span className="font-medium">{layer.sites}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Articles</span>
                      <span className="font-medium">{layer.articles}</span>
                    </div>
                    <button className="w-full py-2 rounded-lg text-sm font-medium border hover:bg-gray-50" style={{ borderColor: layer.color + "40", color: layer.color }}>
                      View layer page →
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Preview card */}
            <div className="bg-white rounded-xl border sticky top-20">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold text-sm">Article Preview</h3>
                <button
                  onClick={() => setEditing(!editing)}
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    editing ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {editing ? "Editing" : "Read only"}
                </button>
              </div>

              <div className="p-4">
                <div className="text-3xl mb-3">{selectedPage.icon}</div>
                <h2 className="text-lg font-bold mb-1">{selectedPage.title}</h2>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Clock className="h-3 w-3" />
                  <span>{selectedPage.updated}</span>
                  <span>·</span>
                  <span>{selectedPage.blocks} blocks</span>
                </div>

                <div className="space-y-3 text-sm">
                  {blocks.slice(0, 5).map(block => (
                    <div key={block.id}>
                      {block.type === "heading" && <h3 className="font-semibold mt-3">{block.content}</h3>}
                      {block.type === "paragraph" && <p className="text-gray-600 leading-relaxed">{block.content}</p>}
                      {block.type === "callout" && (
                        <div className="p-2 rounded bg-blue-50 text-xs text-blue-800 border border-blue-100">
                          💡 {block.content}
                        </div>
                      )}
                      {block.type === "code" && (
                        <pre className="p-2 rounded bg-gray-100 text-xs font-mono overflow-x-auto">{block.content}</pre>
                      )}
                      {block.type === "list" && (
                        <ul className="space-y-1 text-gray-600">
                          {block.content.split("\n").map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="h-1 w-1 rounded-full bg-gray-400" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t px-4 py-3 flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800">
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Article
                </button>
                <button className="p-2 rounded-lg border hover:bg-gray-50">
                  <Share2 className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status surface */}
      <div className="fixed bottom-20 right-6 bg-white rounded-lg shadow-lg border p-3 text-[10px] font-mono text-gray-500 space-y-0.5 z-40">
        <div>variant C · ecosystem data studio</div>
        <div>layers: {ecosystemLayers.length} · sites: {totalSites} · articles: {totalArticles}</div>
        <div>view: {viewMode}{selectedLayer ? ` · layer: ${selectedLayer}` : ""}</div>
      </div>
    </div>
  )
}
