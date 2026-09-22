import { createFileRoute, Link } from "@tanstack/react-router"
import { listNodes } from "~/lib/content"
import { useMemo, useState } from "react"
import { Zap, ArrowUpRight, ExternalLink, CalendarDays } from "lucide-react"
import { fetchEvents, type EventItem } from "~/lib/events"

export const Route = createFileRoute("/events/")({
  component: EventsPage,
  loader: async () => {
    const [events, nodes] = await Promise.all([fetchEvents(), listNodes()])
    return { events, nodes }
  },
})

const eventTypeLabels: Record<string, string> = {
  funding: "Funding",
  ma: "M&A",
  model_release: "Model Release",
  paper: "Paper",
}

const eventTypeColors: Record<string, string> = {
  funding: "#16a34a",
  ma: "#dc2626",
  model_release: "#2563eb",
  paper: "#7c3aed",
}

function typeColor(type: string) {
  return eventTypeColors[type] ?? "#64748b"
}

function monthLabel(date: string) {
  const d = new Date(date + "T00:00:00")
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function dayLabel(date: string) {
  const d = new Date(date + "T00:00:00")
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function groupByMonth(items: EventItem[]) {
  const groups = new Map<string, EventItem[]>()
  for (const item of items) {
    const key = item.date.slice(0, 7)
    const list = groups.get(key)
    if (list) list.push(item)
    else groups.set(key, [item])
  }
  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

function EventsPage() {
  const { events: allEvents, nodes } = Route.useLoaderData()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)

  const layerNodes = useMemo(() => nodes.filter((n) => n.type === "layer"), [nodes])

  const countsByType = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of allEvents) counts[e.type] = (counts[e.type] ?? 0) + 1
    return counts
  }, [allEvents])

  const filtered = useMemo(
    () =>
      allEvents.filter(
        (e) =>
          (!selectedType || e.type === selectedType) &&
          (!selectedLayer || e.layerId === selectedLayer)
      ),
    [allEvents, selectedType, selectedLayer]
  )

  const grouped = useMemo(() => groupByMonth(filtered), [filtered])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground mt-1">
          Track funding rounds, M&A, model releases, and papers across the ecosystem
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border p-4 mb-8 space-y-4">
        <div>
          <h2 className="text-sm font-semibold mb-2">Filter by type</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(eventTypeLabels).map(([type, label]) => {
              const active = selectedType === type
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(active ? null : type)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all cursor-pointer ${
                    active ? "text-white" : "bg-card text-foreground hover:shadow-sm"
                  }`}
                  style={
                    active
                      ? { backgroundColor: typeColor(type), borderColor: typeColor(type) }
                      : { borderColor: typeColor(type) + "40" }
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: typeColor(type) }}
                    aria-hidden="true"
                  />
                  {label}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold mb-2">Filter by layer</h2>
          <div className="flex flex-wrap gap-2">
            {layerNodes.map((node) => {
              const active = selectedLayer === node.slug
              return (
                <button
                  key={node.slug}
                  onClick={() => setSelectedLayer(active ? null : node.slug)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all cursor-pointer ${
                    active ? "text-white" : "bg-card text-foreground hover:shadow-sm"
                  }`}
                  style={
                    active
                      ? { backgroundColor: node.color, borderColor: node.color }
                      : { borderColor: node.color + "40" }
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: node.color }}
                    aria-hidden="true"
                  />
                  {node.title}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="lg:col-span-2">
          {grouped.length === 0 ? (
            <div className="bg-card rounded-xl border">
              <div className="p-4 border-b flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" aria-hidden="true" />
                <span>
                  Events are stored in D1 and will appear here once the database is set up.
                </span>
              </div>
              <div className="p-10 text-center text-muted-foreground">
                <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-50" aria-hidden="true" />
                <p className="text-lg font-medium text-foreground mb-1">No events yet</p>
                <p className="text-sm mb-5">
                  {selectedType || selectedLayer
                    ? "No events match the current filters."
                    : "Add events to D1 to see them on the timeline."}
                </p>
                {!selectedType && !selectedLayer && (
                  <code className="block px-3 py-2 rounded bg-secondary text-xs font-mono text-left max-w-md mx-auto overflow-x-auto">
                    npx wrangler d1 execute kosh-db --local --file=drizzle/0000_init.sql
                  </code>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {grouped.map(([month, items]) => (
                <section key={month} aria-label={monthLabel(items[0].date)}>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                    {monthLabel(items[0].date)}
                  </h2>
                  <ol className="relative border-l ml-3 space-y-6">
                    {items.map((event) => (
                      <li key={event.id} className="pl-6 relative">
                        <span
                          className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background"
                          style={{ backgroundColor: typeColor(event.type) }}
                          aria-hidden="true"
                        />
                        <article className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: typeColor(event.type) }}
                            >
                              {eventTypeLabels[event.type] ?? event.type}
                            </span>
                            <time className="text-xs text-muted-foreground" dateTime={event.date}>
                              {dayLabel(event.date)}
                            </time>
                            {event.layerId && (
                              <Link
                                to="/nodes/$slug"
                                params={{ slug: event.layerId }}
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{
                                    backgroundColor:
                                      layerNodes.find((n) => n.slug === event.layerId)?.color ??
                                      "#94a3b8",
                                  }}
                                  aria-hidden="true"
                                />
                                {layerNodes.find((n) => n.slug === event.layerId)?.title ??
                                  event.layerId}
                              </Link>
                            )}
                          </div>
                          <h3 className="font-semibold leading-snug">{event.title}</h3>
                          {event.details && (
                            <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                          )}
                          {(event.sourceUrl || event.siteId) && (
                            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                              {event.siteId && (
                                <Link
                                  to="/sites/$slug"
                                  params={{ slug: event.siteId }}
                                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  Related site <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </Link>
                              )}
                              {event.sourceUrl && (
                                <a
                                  href={event.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  Source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                </a>
                              )}
                            </div>
                          )}
                        </article>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border p-4">
            <h3 className="font-semibold text-sm mb-3">Event Types</h3>
            <div className="space-y-2">
              {Object.entries(eventTypeLabels).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  aria-pressed={selectedType === type}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left cursor-pointer ${
                    selectedType === type ? "bg-accent" : "hover:bg-accent"
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: typeColor(type) }}
                    aria-hidden="true"
                  />
                  <span className="text-sm flex-1">{label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {countsByType[type] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border p-4">
            <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
            <div className="space-y-2">
              <Link
                to="/graph"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                View Ecosystem Graph
              </Link>
              <Link
                to="/articles"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                Browse Articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
