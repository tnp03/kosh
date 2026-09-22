import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { getArticleBySlug, listArticles, listNodes } from "~/lib/content"
import { Markdown } from "~/components/markdown"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/articles/$slug")({
  component: ArticlePage,
  loader: async ({ params }) => {
    const article = await getArticleBySlug({ data: params.slug })
    if (!article || article.status !== "published") {
      throw notFound()
    }
    const [allArticles, nodes] = await Promise.all([
      listArticles({ data: { status: "published" } }),
      listNodes(),
    ])
    const relatedArticles = allArticles.filter(
      (a) => article.related.includes(a.slug) && a.slug !== article.slug
    )
    return { article, relatedArticles, nodes }
  },
})

function ArticlePage() {
  const { article, relatedArticles, nodes } = Route.useLoaderData()
  const layerNodes = nodes.filter((n) => n.type === "layer")

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/articles">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Articles
        </Button>
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.layers.map((l) => {
              const layer = layerNodes.find((n) => n.slug === l)
              return layer ? (
                <Link key={l} to="/nodes/$slug" params={{ slug: l }}>
                  <Badge
                    variant="outline"
                    style={{ borderColor: layer.color, color: layer.color }}
                  >
                    {layer.title}
                  </Badge>
                </Link>
              ) : null
            })}
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{article.title}</h1>
          <p className="text-xl text-muted-foreground">{article.description}</p>
          <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
            {article.date && <time dateTime={article.date}>{article.date}</time>}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </header>

        <Separator className="mb-8" />

        <Markdown>{article.body}</Markdown>
      </article>

      {relatedArticles.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Related articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedArticles.map((rel) => (
              <Link key={rel.slug} to="/articles/$slug" params={{ slug: rel.slug }}>
                <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{rel.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {rel.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
