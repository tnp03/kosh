import { createFileRoute, Link } from "@tanstack/react-router"
import { listArticles } from "~/lib/content"
import { Plus, FileText } from "lucide-react"

export const Route = createFileRoute("/studio/articles/")({
  component: StudioArticles,
  loader: async () => {
    return { articles: await listArticles() }
  },
})

function StudioArticles() {
  const { articles } = Route.useLoaderData()
  const sorted = [...articles].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Articles{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({articles.length})
          </span>
        </h2>
        <Link
          to="/studio/articles/$slug"
          params={{ slug: "new" }}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> New article
        </Link>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50 text-left">
              <th scope="col" className="px-3 py-2 font-medium">Title</th>
              <th scope="col" className="px-3 py-2 font-medium">Status</th>
              <th scope="col" className="px-3 py-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((article) => (
              <tr key={article.slug} className="hover:bg-accent/50 transition-colors">
                <td className="px-3 py-2">
                  <Link
                    to="/studio/articles/$slug"
                    params={{ slug: article.slug }}
                    className="font-medium hover:underline underline-offset-2"
                  >
                    {article.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">{article.slug}</div>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      article.status === "published"
                        ? "bg-green-500/15 text-green-600 dark:text-green-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {article.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground tabular-nums">
                  {article.date ?? "—"}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-10 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
                  No articles yet — create the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
