import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import {
  getNodeBySlug,
  listArticles,
  listNodes,
  listSites,
} from "~/lib/content"
import { fetchEvents } from "~/lib/events"
import { Markdown } from "~/components/markdown"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Building2, FileText, Network, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/nodes/$slug")({
  component: NodePage,
  loader: async ({ params }) => {
    const node = await getNodeBySlug({ data: params.slug })
    if (!node) {
      throw notFound()
    }
    const [articles, allSites, allNodes, events] = await Promise.all([
      listArticles({ data: { status: "published" } }),
      listSites(),
      listNodes(),
      fetchEvents(),
    ])
    const nodeArticles = articles.filter((a) => a.layers.includes(node.slug))
    const nodeSites = allSites.filter((s) => s.layers.includes(node.slug))
    const adjacentNodes = node.edges
      .map((slug) => allNodes.find((n) => n.slug === slug))
      .filter(Boolean)
    const nodeEvents = events
      .filter((e) => e.layerId === node.slug)
      .slice(0, 5)
    return { node, articles: nodeArticles, sites: nodeSites, adjacentNodes, events: nodeEvents }
  },
})

function NodePage() {
  const { node, articles, sites, adjacentNodes, events } = Route.useLoaderData()

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/graph">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Graph
        </Button>
      </Link>

      {/* Hero */}
      <header
        className="rounded-2xl border p-8 mb-8"
        style={{ backgroundColor: node.color + "0d", borderColor: node.color + "33" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="secondary"
            style={{ backgroundColor: node.color + "20", color: node.color, borderColor: node.color }}
          >
            {node.type}
          </Badge>
        </div>
        <div className="flex items-start gap-4">
          <span
            className="h-3 w-3 rounded-full mt-3 shrink-0"
            style={{ backgroundColor: node.color }}
            aria-hidden="true"
          />
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">{node.title}</h1>
            <p className="text-lg text-muted-foreground">{node.description}</p>
          </div>
        </div>

        {/* Stats */}
        <dl className="grid grid-cols-3 gap-4 mt-8">
          <div className="rounded-lg bg-card border p-3 text-center">
            <Building2 className="h-4 w-4 mx-auto text-muted-foreground mb-1" aria-hidden="true" />
            <dd className="text-xl font-bold">{sites.length}</dd>
            <dt className="text-xs text-muted-foreground">Sites</dt>
          </div>
          <div className="rounded-lg bg-card border p-3 text-center">
            <FileText className="h-4 w-4 mx-auto text-muted-foreground mb-1" aria-hidden="true" />
            <dd className="text-xl font-bold">{articles.length}</dd>
            <dt className="text-xs text-muted-foreground">Articles</dt>
          </div>
          <div className="rounded-lg bg-card border p-3 text-center">
            <Network className="h-4 w-4 mx-auto text-muted-foreground mb-1" aria-hidden="true" />
            <dd className="text-xl font-bold">{node.edges.length}</dd>
            <dt className="text-xs text-muted-foreground">Connections</dt>
          </div>
        </dl>
      </header>

      {node.body && (
        <>
          <Markdown>{node.body}</Markdown>
          <Separator className="my-12" />
        </>
      )}

      {events.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5" aria-hidden="true" /> Recent events
          </h2>
          <ol className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="flex items-baseline gap-3 text-sm">
                <time className="text-muted-foreground shrink-0 tabular-nums" dateTime={event.date}>
                  {event.date}
                </time>
                <span className="font-medium">{event.title}</span>
                {event.sourceUrl && (
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    source ↗
                  </a>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {sites.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Sites in this layer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.map((site) => (
              <Link key={site.slug} to="/sites/$slug" params={{ slug: site.slug }}>
                <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{site.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {site.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <Link key={article.slug} to="/articles/$slug" params={{ slug: article.slug }}>
                <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {article.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {adjacentNodes.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Connected layers</h2>
          <div className="flex flex-wrap gap-3">
            {adjacentNodes.map((adj) => (
              <Link key={adj!.slug} to="/nodes/$slug" params={{ slug: adj!.slug }}>
                <Badge
                  variant="outline"
                  className="text-sm py-1 px-3 hover:bg-accent cursor-pointer"
                  style={{ borderColor: adj!.color }}
                >
                  {adj!.title}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
