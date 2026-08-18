import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { allSites, allNodes } from "content-collections"
import { useMDXComponent } from "@content-collections/mdx/react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/sites/$slug")({
  component: SitePage,
  loader: ({ params }) => {
    const site = allSites.find((s) => s.slug === params.slug)
    if (!site) {
      throw notFound()
    }
    const siteNodes = site.layers
      .map((slug) => allNodes.find((n) => n.slug === slug))
      .filter(Boolean)
    return { site, siteNodes }
  },
})

function SitePage() {
  const { site, siteNodes } = Route.useLoaderData()
  const MDXContent = useMDXComponent(site.mdx)

  return (
    <div className="max-w-4xl mx-auto">
      <Link to={siteNodes.length > 0 ? `/nodes/$slug` : "/graph"} params={siteNodes.length > 0 ? { slug: siteNodes[0]!.slug } : {}}>
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to {siteNodes.length > 0 ? siteNodes[0]!.title : "Graph"}
        </Button>
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {site.type && (
              <Badge variant="secondary">{site.type}</Badge>
            )}
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
            <h1 className="text-4xl font-bold tracking-tight">
              {site.title}
            </h1>
            {site.url && (
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            )}
          </div>
          <p className="text-xl text-muted-foreground">{site.description}</p>
        </header>

        <Separator className="mb-8" />

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXContent />
        </div>
      </article>
    </div>
  )
}
