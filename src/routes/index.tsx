import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { listArticles, listNodes, listSites } from "~/lib/content"
import { useState } from "react"
import { LayerChips } from "~/components/LayerChips"
import {
  Search,
  Layers,
  Building2,
  FileText,
  ArrowRight,
  ArrowUpRight,
  Network,
} from "lucide-react"

export const Route = createFileRoute("/")({
  component: LandingPage,
  loader: async () => {
    const [articles, nodes, sites] = await Promise.all([
      listArticles({ data: { status: "published" } }),
      listNodes(),
      listSites(),
    ])
    return { articles, nodes, sites }
  },
})

function LandingPage() {
  const { articles, nodes, sites } = Route.useLoaderData()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const layerNodes = nodes.filter((n) => n.type === "layer")
  const featuredArticles = [...articles]
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, 3)
  const spotlightSites = sites.slice(0, 8)

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate({ to: "/search", search: { q: query.trim() } })
  }

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/[0.04] to-transparent">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
          <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">
            AI Knowledge Base
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6 text-balance">
            The AI ecosystem,{" "}
            <span className="text-primary">mapped and explained</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
            Explore {nodes.length} interconnected layers of artificial
            intelligence — from silicon to applications — with curated sites,
            in-depth articles, and industry events.
          </p>

          {/* Prominent search */}
          <form onSubmit={submitSearch} role="search" className="max-w-xl mx-auto">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models, tools, concepts…"
                aria-label="Search the knowledge base"
                className="w-full h-14 pl-12 pr-32 rounded-full border bg-card text-base shadow-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick stats */}
          <dl className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mt-12 text-sm">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <dt className="text-muted-foreground">Layers</dt>
              <dd className="font-bold">{layerNodes.length}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <dt className="text-muted-foreground">Sites tracked</dt>
              <dd className="font-bold">{sites.length}</dd>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <dt className="text-muted-foreground">Articles</dt>
              <dd className="font-bold">{articles.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Popular layers */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Explore by layer</h2>
            <p className="text-muted-foreground mt-1">
              Every part of the stack, from silicon to governance
            </p>
          </div>
          <Link
            to="/graph"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View full graph <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <LayerChips nodes={nodes} />
      </section>

      {/* Featured articles */}
      <section className="max-w-7xl mx-auto px-6 pb-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Latest articles</h2>
            <p className="text-muted-foreground mt-1">Deep dives from the knowledge base</p>
          </div>
          <Link
            to="/articles"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            All articles <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredArticles.map((article) => (
            <Link key={article.slug} to="/articles/$slug" params={{ slug: article.slug }}>
              <article className="h-full rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="flex items-center gap-2 mb-3">
                  {article.layers.slice(0, 2).map((l) => {
                    const layer = layerNodes.find((n) => n.slug === l)
                    return layer ? (
                      <span
                        key={l}
                        className="inline-flex items-center gap-1.5 text-xs font-medium"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: layer.color }}
                          aria-hidden="true"
                        />
                        {layer.title}
                      </span>
                    ) : null
                  })}
                </div>
                <h3 className="font-semibold leading-snug mb-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {article.description}
                </p>
                {article.date && (
                  <time className="text-xs text-muted-foreground">{article.date}</time>
                )}
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Sites spotlight */}
      <section className="border-y bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Sites we track</h2>
              <p className="text-muted-foreground mt-1">
                The companies and projects shaping the ecosystem
              </p>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Open dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {spotlightSites.map((site) => (
              <li key={site.slug}>
                <Link
                  to="/sites/$slug"
                  params={{ slug: site.slug }}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                >
                  <span
                    className="h-9 w-9 shrink-0 rounded-lg bg-secondary flex items-center justify-center font-bold text-muted-foreground"
                    aria-hidden="true"
                  >
                    {site.title[0]}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium truncate">{site.title}</span>
                    {site.type && (
                      <span className="block text-xs text-muted-foreground truncate">
                        {site.type}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA band */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="rounded-2xl border bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] p-10 md:p-14 text-center">
          <Network className="h-10 w-10 mx-auto text-primary mb-4" aria-hidden="true" />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            See how it all connects
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            The ecosystem graph maps dependencies across every layer — who builds
            on what, and where the industry is heading.
          </p>
          <Link
            to="/graph"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-primary text-primary-foreground font-semibold transition-opacity hover:opacity-90"
          >
            Explore the graph <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
