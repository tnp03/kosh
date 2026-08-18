import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { allArticles } from "content-collections"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute("/categories")({
  component: CategoriesLayout,
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

function CategoriesLayout() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground mt-2">
          Browse articles by topic
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {categories.map((category) => {
          const articleCount = allArticles.filter(
            (a) => a.category === category.slug
          ).length
          return (
            <Link
              key={category.slug}
              to={`/categories/$category`}
              params={{ category: category.slug }}
            >
              <Card className="h-full hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      <Outlet />
    </div>
  )
}
