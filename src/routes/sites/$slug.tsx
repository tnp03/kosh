import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { getSiteBySlug, listNodes } from "~/lib/content"
import { Markdown } from "~/components/markdown"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/sites/$slug")({
  component: SitePage,
  loader: async ({ params }) => {
    const site = await getSiteBySlug({ data: params.slug })
    if (!site) {
      throw notFound()
    }
    const allNodes = await listNodes()
    const siteNodes = site.layers
      .map((slug) => allNodes.find((n) => n.slug === slug))
      .filter(Boolean)
    return { site, siteNodes }
  },
})

function SitePage() {
  const { site, siteNodes } = Route.useLoaderData()

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to={siteNodes.length > 0 ? "/nodes/$slug" : "/graph"}
        params={siteNodes.length > 0 ? { slug: siteNodes[0]!.slug } : {}}
      >
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to {siteNodes.length > 0 ? siteNodes[0]!.title : "Graph"}
        </Button>
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {site.type && <Badge variant="secondary">{site.type}</Badge>}
            {siteNodes.map((node) => (
              <Link key={node!.slug} to="/nodes/$slug" params={{ slug: node!.slug }}>
                <Badge
                  variant="outline"
                  style={{ borderColor: node!.color, color: node!.color }}
                >
                  {node!.title}
                </Badge>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold tracking-tight">{site.title}</h1>
            {site.url && (
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${site.title}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-5 w-5" aria-hidden="true" />
              </a>
            )}
          </div>
          <p className="text-xl text-muted-foreground">{site.description}</p>
        </header>

        <Separator className="mb-8" />

        {site.body ? (
          <Markdown>{site.body}</Markdown>
        ) : (
          <p className="text-muted-foreground">No description available yet.</p>
        )}
      </article>
    </div>
  )
}
