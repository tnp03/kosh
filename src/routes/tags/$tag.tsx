import { createFileRoute, Link } from "@tanstack/react-router"
import { listArticles } from "~/lib/content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute("/tags/$tag")({
  component: TagPage,
  loader: async () => {
    return { articles: await listArticles({ data: { status: "published" } }) }
  },
})

function TagPage() {
  const { tag } = Route.useParams()
  const { articles } = Route.useLoaderData()
  const tagged = articles
    .filter((a) => a.tags.includes(tag))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Tag: <Badge variant="outline">{tag}</Badge>
        </h1>
        <p className="text-muted-foreground mt-2">
          {tagged.length} article{tagged.length !== 1 ? "s" : ""} with this tag
        </p>
      </div>

      {tagged.length === 0 ? (
        <p className="text-muted-foreground">No articles with this tag yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tagged.map((article) => (
            <Link key={article.slug} to="/articles/$slug" params={{ slug: article.slug }}>
              <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
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
