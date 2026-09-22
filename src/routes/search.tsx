import { createFileRoute, Link } from "@tanstack/react-router"
import { searchDocs, type SearchDoc } from "~/lib/content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import MiniSearch from "minisearch"
import { Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: (search: Record<string, unknown>) => ({
    ...(typeof search.q === "string" ? { q: search.q } : {}),
  }),
  loader: async () => {
    return { docs: await searchDocs() }
  },
})

function createSearchIndex(docs: SearchDoc[]) {
  const index = new MiniSearch({
    fields: ["title", "description", "tags"],
    storeFields: ["title", "description", "slug", "tags"],
    searchOptions: {
      fuzzy: 0.2,
      prefix: true,
    },
  })

  if (docs.length > 0) {
    index.addAll(
      docs.map((doc) => ({
        id: doc.slug,
        title: doc.title,
        description: doc.description,
        slug: doc.slug,
        tags: doc.tags.join(" "),
      }))
    )
  }

  return index
}

function SearchPage() {
  const { docs } = Route.useLoaderData()
  const { q: initialQuery } = Route.useSearch()
  const [query, setQuery] = useState(initialQuery ?? "")
  const searchIndex = useMemo(() => createSearchIndex(docs), [docs])

  const results = useMemo(() => {
    if (!query.trim()) return []
    return searchIndex.search(query)
  }, [query, searchIndex])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Search</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{result.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {result.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {result.tags.split(" ").slice(0, 3).map((tag: string) => (
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
