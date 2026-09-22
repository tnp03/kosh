import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { listNodes, listSites, upsertEvent, deleteEvent } from "~/lib/content"
import { fetchEvents } from "~/lib/events"
import {
  Field,
  TextInput,
  TextArea,
  Select,
} from "~/components/studio/inputs"
import { useState } from "react"
import { Plus, Trash2, Zap } from "lucide-react"

export const Route = createFileRoute("/studio/events")({
  component: StudioEvents,
  loader: async () => {
    const [events, nodes, sites] = await Promise.all([
      fetchEvents(),
      listNodes(),
      listSites(),
    ])
    return { events, nodes, sites }
  },
})

const TYPE_OPTIONS = [
  { value: "funding", label: "Funding" },
  { value: "ma", label: "M&A" },
  { value: "model_release", label: "Model Release" },
  { value: "paper", label: "Paper" },
]

function StudioEvents() {
  const { events, nodes, sites } = Route.useLoaderData()
  const navigate = useNavigate()

  const [type, setType] = useState("funding")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [siteId, setSiteId] = useState("")
  const [layerId, setLayerId] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date))

  const add = async () => {
    setError(null)
    if (!title.trim()) return setError("Title is required.")
    if (!date) return setError("Date is required.")
    setSaving(true)
    try {
      await upsertEvent({
        data: {
          type: type as "funding" | "ma" | "model_release" | "paper",
          date,
          title: title.trim(),
          details: details || null,
          siteId: siteId || null,
          layerId: layerId || null,
          sourceUrl: sourceUrl || null,
        },
      })
      setTitle("")
      setDetails("")
      setSourceUrl("")
      navigate({ to: "/studio/events" })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string, label: string) => {
    if (!confirm(`Delete event "${label}"?`)) return
    await deleteEvent({ data: id })
    navigate({ to: "/studio/events" })
  }

  return (
    <div className="space-y-8">
      {/* Add form */}
      <section aria-label="Add event">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add event
        </h2>
        <div className="rounded-xl border bg-card p-4 space-y-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Type">
              <Select value={type} onChange={setType} options={TYPE_OPTIONS} />
            </Field>
            <Field label="Date">
              <TextInput type="date" value={date} onChange={setDate} />
            </Field>
            <Field label="Title">
              <TextInput value={title} onChange={setTitle} placeholder="Series B raised…" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Related site">
              <Select
                value={siteId}
                onChange={setSiteId}
                options={[
                  { value: "", label: "— none —" },
                  ...[...sites]
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((s) => ({ value: s.slug, label: s.title })),
                ]}
              />
            </Field>
            <Field label="Layer">
              <Select
                value={layerId}
                onChange={setLayerId}
                options={[
                  { value: "", label: "— none —" },
                  ...nodes
                    .filter((n) => n.type === "layer")
                    .map((n) => ({ value: n.slug, label: n.title })),
                ]}
              />
            </Field>
            <Field label="Source URL">
              <TextInput value={sourceUrl} onChange={setSourceUrl} placeholder="https://…" />
            </Field>
          </div>
          <Field label="Details">
            <TextArea value={details} onChange={setDetails} rows={2} />
          </Field>
          <button
            onClick={add}
            disabled={saving}
            className="inline-flex items-center h-9 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Adding…" : "Add event"}
          </button>
        </div>
      </section>

      {/* List */}
      <section aria-label="All events">
        <h2 className="text-lg font-semibold mb-4">
          All events{" "}
          <span className="text-sm font-normal text-muted-foreground">({events.length})</span>
        </h2>
        <div className="rounded-xl border bg-card divide-y">
          {sorted.map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-3 text-sm">
              <Zap className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <span className="text-muted-foreground tabular-nums shrink-0">{event.date}</span>
              <span className="font-medium min-w-0 truncate">{event.title}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-secondary shrink-0">
                {TYPE_OPTIONS.find((t) => t.value === event.type)?.label ?? event.type}
              </span>
              <button
                onClick={() => remove(event.id, event.title)}
                aria-label={`Delete ${event.title}`}
                className="ml-auto p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="py-10 text-center text-muted-foreground text-sm">
              No events yet — add the first one above.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
