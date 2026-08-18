import { createFileRoute, Link } from "@tanstack/react-router"
import { allArticles } from "content-collections"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState, useMemo, useMemo as useMemoOnce } from "react"
import MiniSearch from "minisearch"
import { Search } from "lucide-react"

export const Route = createFileRoute("/search")({
  component: SearchPage,
})

function createSearchIndex() {
  const index = new MiniSearch({
    fields: ["title", "description", "tags", "category"],
    storeFields: ["title", "description", "slug", "category", "tags"],
    searchOptions: {
      fuzzy: 0.2,
      prefix: true,
    },
  })

  if (allArticles && allArticles.length > 0) {
    index.addAll(
      allArticles.map((article) => ({
        id: article.slug,
        title: article.title,
        description: article.description,
        slug: article.slug,
        category: article.category,
        tags: article.tags.join(" "),
      }))
    )
  }

  return index
}

function SearchPage() {
  const [query, setQuery] = useState("")
  const searchIndex = useMemo(() => createSearchIndex(), [])

  const results = useMemo(() => {
    if (!query.trim()) return []
    return searchIndex.search(query)
  }, [query, searchIndex])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Search</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {query.trim() && (
          <div className="mb-4 text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
          </div>
        )}

        <div className="space-y-4">
          {results.map((result) => (
            <Link key={result.id} to={`/articles/$slug`} params={{ slug: result.slug }}>
              <Card className="hover:bg-accent transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{result.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{result.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {result.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {result.tags.split(" ").slice(0, 3).map((tag) => (
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

        {query.trim() && results.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No results found. Try a different search term.
          </div>
        )}
      </div>
    </div>
  )
}
