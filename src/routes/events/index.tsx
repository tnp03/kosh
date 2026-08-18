import { createFileRoute, Link } from "@tanstack/react-router"
import { allNodes } from "content-collections"
import { useState } from "react"
import { ArrowLeft, Zap, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/events/")({
  component: EventsPage,
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

function EventsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link to="/">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground mt-1">
          Track funding rounds, M&A, model releases, and papers
        </p>
      </div>

      {/* Event type filter */}
      <div className="bg-card rounded-xl border p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Filter by Type</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(eventTypeLabels).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setSelectedType(selectedType === type ? null : type)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all ${
                selectedType === type
                  ? "text-white"
                  : "bg-card text-foreground hover:shadow-sm"
              }`}
              style={
                selectedType === type
                  ? { backgroundColor: eventTypeColors[type], borderColor: eventTypeColors[type] }
                  : { borderColor: eventTypeColors[type] + "40" }
              }
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: eventTypeColors[type] }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Events content */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="bg-card rounded-xl border">
            <div className="p-4 border-b flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>Events are stored in D1 and will appear here once the database is set up.</span>
            </div>
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-lg mb-2">No events yet</p>
              <p className="text-sm">Add events to D1 to see them here</p>
              <code className="block mt-4 px-3 py-2 rounded bg-secondary text-xs font-mono text-left max-w-md mx-auto">
                npx wrangler d1 execute kosh-db --local --file=drizzle/0000_init.sql
              </code>
            </div>
          </div>
        </div>

        {/* Sidebar — Event types */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border p-4">
            <h3 className="font-semibold text-sm mb-3">Event Types</h3>
            <div className="space-y-2">
              {Object.entries(eventTypeLabels).map(([type, label]) => (
                <div key={type} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: eventTypeColors[type] }} />
                  <span className="text-sm flex-1">{label}</span>
                  <span className="text-xs text-muted-foreground">0</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border p-4">
            <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/graph" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-accent transition-colors">
                <ArrowUpRight className="h-3.5 w-3.5" />
                View Ecosystem Graph
              </Link>
              <Link to="/articles" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-accent transition-colors">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Browse Articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
