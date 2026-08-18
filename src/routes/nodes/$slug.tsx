import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { allNodes, allArticles, allSites } from "content-collections"
import { useMDXComponent } from "@content-collections/mdx/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/nodes/$slug")({
  component: NodePage,
  loader: ({ params }) => {
    const node = allNodes.find((n) => n.slug === params.slug)
    if (!node) {
      throw notFound()
    }
    const articles = allArticles.filter((a) => a.layers.includes(node.slug))
    const sites = allSites.filter((s) => s.layers.includes(node.slug))
    const adjacentNodes = node.edges
      .map((slug) => allNodes.find((n) => n.slug === slug))
      .filter(Boolean)
    return { node, articles, sites, adjacentNodes }
  },
})

function NodePage() {
  const { node, articles, sites, adjacentNodes } = Route.useLoaderData()
  const MDXContent = useMDXComponent(node.mdx)

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/graph">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Graph
        </Button>
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge
              variant="secondary"
              style={{ backgroundColor: node.color + "20", color: node.color, borderColor: node.color }}
            >
              {node.type}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {node.title}
          </h1>
          <p className="text-xl text-muted-foreground">{node.description}</p>
        </header>

        <Separator className="mb-8" />

        <div className="prose prose-neutral dark:prose-invert max-w-none mb-12">
          <MDXContent />
        </div>
      </article>

      {sites.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Sites in this layer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.map((site) => (
              <Link
                key={site.slug}
                to="/sites/$slug"
                params={{ slug: site.slug }}
              >
                <Card className="h-full hover:bg-accent transition-colors">
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
        </div>
      )}

      {articles.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <Link
                key={article.slug}
                to="/articles/$slug"
                params={{ slug: article.slug }}
              >
                <Card className="h-full hover:bg-accent transition-colors">
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
        </div>
      )}

      {adjacentNodes.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Connected layers</h2>
          <div className="flex flex-wrap gap-3">
            {adjacentNodes.map((adj) => (
              <Link
                key={adj!.slug}
                to="/nodes/$slug"
                params={{ slug: adj!.slug }}
              >
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
        </div>
      )}
    </div>
  )
}
