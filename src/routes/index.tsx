import { createFileRoute } from "@tanstack/react-router"
import { allArticles } from "content-collections"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: HomePage,
})

const categories = [
  {
    name: "Models",
    slug: "models",
    description: "GPT-4, Claude, Llama, and other large language models",
  },
  {
    name: "Tools",
    slug: "tools",
    description: "Frameworks, platforms, and utilities for building AI applications",
  },
  {
    name: "Concepts",
    slug: "concepts",
    description: "Core ideas and architectures behind modern AI",
  },
  {
    name: "Research",
    slug: "research",
    description: "Landmark papers and breakthroughs in AI research",
  },
]

function HomePage() {
  const recentArticles = allArticles
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, 6)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Kosh</h1>
        <p className="text-xl text-muted-foreground">
          A comprehensive knowledge base for artificial intelligence
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link key={category.slug} to={`/categories/$category`} params={{ category: category.slug }}>
              <Card className="h-full hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Recent Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentArticles.map((article) => (
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
      </div>
    </div>
  )
}
