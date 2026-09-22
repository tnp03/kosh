import { createFileRoute, Link } from "@tanstack/react-router"
import { listArticles, listNodes, listSites } from "~/lib/content"
import { fetchEvents } from "~/lib/events"
import { useMemo } from "react"
import {
  FileText,
  Network,
  Building2,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react"

export const Route = createFileRoute("/studio/")({
  component: StudioOverview,
  loader: async () => {
    const [articles, nodes, sites, events] = await Promise.all([
      listArticles(),
      listNodes(),
      listSites(),
      fetchEvents(),
    ])
    return { articles, nodes, sites, events }
  },
})

interface HealthIssue {
  collection: string
  slug: string
  message: string
}

function buildHealthReport(
  articles: Awaited<ReturnType<typeof listArticles>>,
  nodes: Awaited<ReturnType<typeof listNodes>>,
  sites: Awaited<ReturnType<typeof listSites>>
): HealthIssue[] {
  const issues: HealthIssue[] = []

  for (const article of articles) {
    if (!article.date) issues.push({ collection: "articles", slug: article.slug, message: "Missing date" })
    if (article.layers.length === 0) issues.push({ collection: "articles", slug: article.slug, message: "No layers assigned" })
    if (article.tags.length === 0) issues.push({ collection: "articles", slug: article.slug, message: "No tags" })
  }
  for (const site of sites) {
    if (!site.url) issues.push({ collection: "sites", slug: site.slug, message: "Missing url" })
    if (site.layers.length === 0) issues.push({ collection: "sites", slug: site.slug, message: "No layers assigned" })
  }
  for (const node of nodes) {
    if (node.edges.length === 0) issues.push({ collection: "nodes", slug: node.slug, message: "No graph edges" })
  }

  return issues
}

function StudioOverview() {
  const { articles, nodes, sites, events } = Route.useLoaderData()

  const issues = useMemo(() => buildHealthReport(articles, nodes, sites), [articles, nodes, sites])

  const coverage = useMemo(() => {
    const layerNodes = nodes.filter((n) => n.type === "layer")
    return layerNodes.map((layer) => ({
      layer,
      sites: sites.filter((s) => s.layers.includes(layer.slug)).length,
      articles: articles.filter((a) => a.layers.includes(layer.slug)).length,
      events: events.filter((e) => e.layerId === layer.slug).length,
    }))
  }, [articles, nodes, sites, events])

  const stats = [
    { label: "Articles", value: articles.length, icon: FileText, to: "/studio/articles" },
    { label: "Sites", value: sites.length, icon: Building2, to: "/studio/sites" },
    { label: "Nodes", value: nodes.length, icon: Network, to: "/studio/nodes" },
    { label: "Events", value: events.length, icon: Zap, to: "/studio/events" },
  ]

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to}>
            <div className="bg-card rounded-xl border p-4 transition-colors hover:bg-accent cursor-pointer h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold tabular-nums">{value}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Health */}
        <section className="xl:col-span-3" aria-label="Content health">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Content health</h2>
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                issues.length === 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {issues.length === 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> All clean
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" /> {issues.length} issue{issues.length !== 1 ? "s" : ""}
                </>
              )}
            </span>
          </div>

          {issues.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" aria-hidden="true" />
              Every article, site, and node has complete metadata.
            </div>
          ) : (
            <div className="rounded-xl border bg-card divide-y max-h-[420px] overflow-y-auto">
              {issues.map((issue, i) => (
                <div key={i} className="flex items-center gap-3 p-3 text-sm">
                  <span className="px-1.5 py-0.5 rounded bg-secondary text-xs font-medium shrink-0">
                    {issue.collection}
                  </span>
                  <span className="font-medium shrink-0">{issue.slug}</span>
                  <span className="text-muted-foreground">— {issue.message}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Coverage */}
        <section className="xl:col-span-2" aria-label="Layer coverage">
          <h2 className="text-lg font-semibold mb-4">Layer coverage</h2>
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/50 text-left">
                  <th scope="col" className="px-3 py-2 font-medium">Layer</th>
                  <th scope="col" className="px-3 py-2 font-medium text-right">Sites</th>
                  <th scope="col" className="px-3 py-2 font-medium text-right">Articles</th>
                  <th scope="col" className="px-3 py-2 font-medium text-right">Events</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {coverage.map(({ layer, sites, articles, events }) => (
                  <tr key={layer.slug} className="hover:bg-accent/50 transition-colors">
                    <td className="px-3 py-2">
                      <Link
                        to="/nodes/$slug"
                        params={{ slug: layer.slug }}
                        className="flex items-center gap-2 hover:underline underline-offset-2"
                      >
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: layer.color }}
                          aria-hidden="true"
                        />
                        {layer.title}
                      </Link>
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums ${sites === 0 ? "text-muted-foreground/50" : ""}`}>{sites}</td>
                    <td className={`px-3 py-2 text-right tabular-nums ${articles === 0 ? "text-muted-foreground/50" : ""}`}>{articles}</td>
                    <td className={`px-3 py-2 text-right tabular-nums ${events === 0 ? "text-muted-foreground/50" : ""}`}>{events}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link
            to="/graph"
            className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            View public ecosystem graph
          </Link>
        </section>
      </div>
    </div>
  )
}
