import { createFileRoute, Link } from "@tanstack/react-router"
import { listSites } from "~/lib/content"
import { Plus, Building2, ExternalLink } from "lucide-react"

export const Route = createFileRoute("/studio/sites/")({
  component: StudioSites,
  loader: async () => {
    return { sites: await listSites() }
  },
})

function StudioSites() {
  const { sites } = Route.useLoaderData()
  const sorted = [...sites].sort((a, b) => a.title.localeCompare(b.title))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Sites{" "}
          <span className="text-sm font-normal text-muted-foreground">({sites.length})</span>
        </h2>
        <Link
          to="/studio/sites/$slug"
          params={{ slug: "new" }}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> New site
        </Link>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50 text-left">
              <th scope="col" className="px-3 py-2 font-medium">Title</th>
              <th scope="col" className="px-3 py-2 font-medium">Type</th>
              <th scope="col" className="px-3 py-2 font-medium">URL</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((site) => (
              <tr key={site.slug} className="hover:bg-accent/50 transition-colors">
                <td className="px-3 py-2">
                  <Link
                    to="/studio/sites/$slug"
                    params={{ slug: site.slug }}
                    className="font-medium hover:underline underline-offset-2"
                  >
                    {site.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">{site.slug}</div>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{site.type ?? "—"}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {site.url ? (
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      link <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-10 text-center text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
                  No sites yet — add the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
