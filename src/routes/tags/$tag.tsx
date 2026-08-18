import { createFileRoute, Link } from "@tanstack/react-router"
import { allArticles } from "content-collections"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute("/tags/$tag")({
  component: TagPage,
})

function TagPage() {
  const { tag } = Route.useParams()
  const articles = allArticles
    .filter((a) => a.tags.includes(tag))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Tag: <Badge variant="outline">{tag}</Badge>
        </h1>
        <p className="text-muted-foreground mt-2">
          {articles.length} article{articles.length !== 1 ? "s" : ""} with this tag
        </p>
      </div>

      {articles.length === 0 ? (
        <p className="text-muted-foreground">No articles with this tag yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <Link key={article.slug} to={`/articles/$slug`} params={{ slug: article.slug }}>
              <Card className="h-full hover:bg-accent transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {article.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
