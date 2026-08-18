import { createFileRoute, Link } from "@tanstack/react-router"
import { allArticles } from "content-collections"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute("/categories/$category")({
  component: CategoryPage,
})

const categoryNames: Record<string, string> = {
  models: "Models",
  tools: "Tools",
  concepts: "Concepts",
  research: "Research",
}

const categoryDescriptions: Record<string, string> = {
  models: "Large language models and their capabilities",
  tools: "Frameworks, platforms, and utilities for AI development",
  concepts: "Core ideas and architectures in modern AI",
  research: "Landmark papers and breakthroughs in AI research",
}

function CategoryPage() {
  const { category } = Route.useParams()
  const articles = allArticles
    .filter((a) => a.category === category)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))

  const categoryName = categoryNames[category] ?? category
  const categoryDescription = categoryDescriptions[category] ?? ""

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/categories" className="text-muted-foreground hover:text-foreground">
            Categories
          </Link>
          <span className="text-muted-foreground">/</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{categoryName}</h1>
        <p className="text-muted-foreground mt-2">{categoryDescription}</p>
      </div>

      {articles.length === 0 ? (
        <p className="text-muted-foreground">No articles in this category yet.</p>
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
                    {article.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
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
