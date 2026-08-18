import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { allArticles } from "content-collections"
import { useMDXComponent } from "@content-collections/mdx/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/articles/$slug")({
  component: ArticlePage,
  loader: ({ params }) => {
    const article = allArticles.find((a) => a.slug === params.slug)
    if (!article) {
      throw notFound()
    }
    return { article }
  },
})

function ArticlePage() {
  const { article } = Route.useLoaderData()
  const MDXContent = useMDXComponent(article.mdx)

  const relatedArticles = allArticles.filter((a) =>
    article.related.includes(a.slug)
  )

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/articles">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Button>
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {article.layers.map((layer) => (
              <Link key={layer} to="/nodes/$slug" params={{ slug: layer }}>
                <Badge variant="secondary">{layer}</Badge>
              </Link>
            ))}
            {article.date && (
              <span className="text-sm text-muted-foreground">{article.date}</span>
            )}
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {article.title}
          </h1>
          <p className="text-xl text-muted-foreground">{article.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <Link key={tag} to="/tags/$tag" params={{ tag }}>
                <Badge variant="outline">{tag}</Badge>
              </Link>
            ))}
          </div>
        </header>

        <Separator className="mb-8" />

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXContent />
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <div className="mt-12">
          <Separator className="mb-8" />
          <h2 className="text-2xl font-semibold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                to={`/articles/$slug`}
                params={{ slug: related.slug }}
              >
                <Card className="h-full hover:bg-accent transition-colors">
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                      {related.layers[0]}
                    </Badge>
                    <CardTitle className="text-lg">{related.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {related.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
