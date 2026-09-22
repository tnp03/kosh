import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  getNodeBySlug,
  listNodes,
  upsertNode,
  deleteNode,
} from "~/lib/content"
import { Markdown } from "~/components/markdown"
import {
  Field,
  TextInput,
  TextArea,
  Select,
  TagInput,
  ChipMultiSelect,
} from "~/components/studio/inputs"
import { useState } from "react"
import { ArrowLeft, Eye, PenLine, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/studio/nodes/$slug")({
  component: NodeEditor,
  loader: async ({ params }) => {
    const [node, allNodes] = await Promise.all([
      params.slug === "new" ? Promise.resolve(null) : getNodeBySlug({ data: params.slug }),
      listNodes(),
    ])
    return { node, allNodes }
  },
})

const COLORS = [
  "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#059669",
  "#0891b2", "#2563eb", "#4f46e5", "#7c3aed", "#9333ea",
  "#db2777", "#64748b",
]

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function NodeEditor() {
  const { node, allNodes } = Route.useLoaderData()
  const navigate = useNavigate()
  const isNew = !node

  const [title, setTitle] = useState(node?.title ?? "")
  const [slug, setSlug] = useState(node?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [description, setDescription] = useState(node?.description ?? "")
  const [body, setBody] = useState(node?.body ?? "")
  const [type, setType] = useState<"layer" | "dimension">(node?.type ?? "layer")
  const [color, setColor] = useState(node?.color ?? "#6b7280")
  const [edges, setEdges] = useState<string[]>(node?.edges ?? [])
  const [tags, setTags] = useState<string[]>(node?.tags ?? [])
  const [mode, setMode] = useState<"write" | "preview">("write")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const edgeOptions = allNodes
    .filter((n) => n.slug !== slug)
    .map((n) => ({ slug: n.slug, title: n.title, color: n.color }))

  const handleTitle = (v: string) => {
    setTitle(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  const save = async () => {
    setError(null)
    if (!title.trim()) return setError("Title is required.")
    if (!slug.trim()) return setError("Slug is required.")
    setSaving(true)
    try {
      await upsertNode({
        data: {
          slug: slug.trim(),
          title: title.trim(),
          description,
          body,
          type,
          color,
          edges,
          tags,
        },
      })
      navigate({ to: "/studio/nodes" })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
      setSaving(false)
    }
  }

  const remove = async () => {
    if (isNew) return
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    await deleteNode({ data: slug })
    navigate({ to: "/studio/nodes" })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/studio/nodes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All nodes
        </Link>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button
              variant="ghost"
              size="sm"
              onClick={remove}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
            </Button>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center h-9 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving…" : isNew ? "Create node" : "Save changes"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-8">
        <aside className="space-y-4">
          <Field label="Title">
            <TextInput value={title} onChange={handleTitle} placeholder="Node title" />
          </Field>
          <Field label="Slug" hint={`URL: /nodes/${slug || "…"}`}>
            <TextInput
              value={slug}
              onChange={(v) => {
                setSlugTouched(true)
                setSlug(v)
              }}
              placeholder="url-slug"
            />
          </Field>
          <Field label="Description">
            <TextArea value={description} onChange={setDescription} rows={3} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select
                value={type}
                onChange={(v) => setType(v as "layer" | "dimension")}
                options={[
                  { value: "layer", label: "Layer" },
                  { value: "dimension", label: "Dimension" },
                ]}
              />
            </Field>
            <Field label="Color">
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Color ${c}`}
                    aria-pressed={color === c}
                    onClick={() => setColor(c)}
                    className={`h-6 w-6 rounded-full transition-transform cursor-pointer ${
                      color === c ? "ring-2 ring-offset-2 ring-ring scale-110" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </Field>
          </div>
          <Field label="Connected nodes" hint="Graph edges to other nodes">
            <ChipMultiSelect options={edgeOptions} value={edges} onChange={setEdges} />
          </Field>
          <Field label="Tags">
            <TagInput value={tags} onChange={setTags} />
          </Field>
        </aside>

        <section aria-label="Node body">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium">Body (markdown)</h2>
            <div role="tablist" aria-label="Editor mode" className="flex rounded-full border p-0.5 text-xs">
              {(["write", "preview"] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    mode === m ? "bg-secondary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {m === "write" ? (
                    <PenLine className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Eye className="h-3 w-3" aria-hidden="true" />
                  )}
                  {m === "write" ? "Write" : "Preview"}
                </button>
              ))}
            </div>
          </div>

          {mode === "write" ? (
            <TextArea value={body} onChange={setBody} rows={20} mono placeholder="Optional explainer content…" />
          ) : (
            <div className="rounded-md border bg-card p-6 min-h-[500px]">
              {body.trim() ? (
                <Markdown>{body}</Markdown>
              ) : (
                <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
