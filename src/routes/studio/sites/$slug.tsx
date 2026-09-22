import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  getSiteBySlug,
  listNodes,
  upsertSite,
  deleteSite,
} from "~/lib/content"
import { Markdown } from "~/components/markdown"
import {
  Field,
  TextInput,
  TextArea,
  TagInput,
  ChipMultiSelect,
} from "~/components/studio/inputs"
import { useState } from "react"
import { ArrowLeft, Eye, PenLine, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/studio/sites/$slug")({
  component: SiteEditor,
  loader: async ({ params }) => {
    const [site, nodes] = await Promise.all([
      params.slug === "new" ? Promise.resolve(null) : getSiteBySlug({ data: params.slug }),
      listNodes(),
    ])
    return { site, nodes }
  },
})

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function SiteEditor() {
  const { site, nodes } = Route.useLoaderData()
  const navigate = useNavigate()
  const isNew = !site

  const [title, setTitle] = useState(site?.title ?? "")
  const [slug, setSlug] = useState(site?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [description, setDescription] = useState(site?.description ?? "")
  const [body, setBody] = useState(site?.body ?? "")
  const [layers, setLayers] = useState<string[]>(site?.layers ?? [])
  const [tags, setTags] = useState<string[]>(site?.tags ?? [])
  const [url, setUrl] = useState(site?.url ?? "")
  const [type, setType] = useState(site?.type ?? "")
  const [mode, setMode] = useState<"write" | "preview">("write")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const layerOptions = nodes
    .filter((n) => n.type === "layer")
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
      await upsertSite({
        data: {
          slug: slug.trim(),
          title: title.trim(),
          description,
          body,
          layers,
          tags,
          url: url || null,
          type: type || null,
        },
      })
      navigate({ to: "/studio/sites" })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
      setSaving(false)
    }
  }

  const remove = async () => {
    if (isNew) return
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    await deleteSite({ data: slug })
    navigate({ to: "/studio/sites" })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/studio/sites"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All sites
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
            {saving ? "Saving…" : isNew ? "Create site" : "Save changes"}
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
            <TextInput value={title} onChange={handleTitle} placeholder="Site name" />
          </Field>
          <Field label="Slug" hint={`URL: /sites/${slug || "…"}`}>
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
          <Field label="URL">
            <TextInput value={url} onChange={setUrl} placeholder="https://…" />
          </Field>
          <Field label="Type" hint="e.g. company, project, tool">
            <TextInput value={type} onChange={setType} placeholder="company" />
          </Field>
          <Field label="Layers">
            <ChipMultiSelect options={layerOptions} value={layers} onChange={setLayers} />
          </Field>
          <Field label="Tags">
            <TagInput value={tags} onChange={setTags} />
          </Field>
        </aside>

        <section aria-label="Site body">
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
            <TextArea value={body} onChange={setBody} rows={20} mono placeholder="Optional long-form description…" />
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
