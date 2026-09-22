import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  getArticleBySlug,
  listArticles,
  listNodes,
  upsertArticle,
  deleteArticle,
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

export const Route = createFileRoute("/studio/articles/$slug")({
  component: ArticleEditor,
  loader: async ({ params }) => {
    const [article, nodes] = await Promise.all([
      params.slug === "new" ? Promise.resolve(null) : getArticleBySlug({ data: params.slug }),
      listNodes(),
    ])
    return { article, nodes }
  },
})

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function ArticleEditor() {
  const { article, nodes } = Route.useLoaderData()
  const navigate = useNavigate()
  const isNew = !article

  const [title, setTitle] = useState(article?.title ?? "")
  const [slug, setSlug] = useState(article?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [description, setDescription] = useState(article?.description ?? "")
  const [body, setBody] = useState(article?.body ?? "")
  const [layers, setLayers] = useState<string[]>(article?.layers ?? [])
  const [tags, setTags] = useState<string[]>(article?.tags ?? [])
  const [related, setRelated] = useState<string[]>(article?.related ?? [])
  const [date, setDate] = useState(article?.date ?? "")
  const [status, setStatus] = useState<"draft" | "published">(
    article?.status ?? "draft"
  )
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
    if (!title.trim()) {
      setError("Title is required.")
      return
    }
    if (!slug.trim()) {
      setError("Slug is required.")
      return
    }
    setSaving(true)
    try {
      await upsertArticle({
        data: {
          slug: slug.trim(),
          title: title.trim(),
          description,
          body,
          layers,
          tags,
          related,
          date: date || null,
          status,
        },
      })
      navigate({ to: "/studio/articles" })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
      setSaving(false)
    }
  }

  const remove = async () => {
    if (isNew) return
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    await deleteArticle({ data: slug })
    navigate({ to: "/studio/articles" })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/studio/articles"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All articles
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
            {saving ? "Saving…" : isNew ? "Create article" : "Save changes"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-8">
        {/* Metadata panel */}
        <aside className="space-y-4">
          <Field label="Title">
            <TextInput value={title} onChange={handleTitle} placeholder="Article title" />
          </Field>
          <Field label="Slug" hint={`URL: /articles/${slug || "…"}`}>
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
          <Field label="Layers">
            <ChipMultiSelect options={layerOptions} value={layers} onChange={setLayers} />
          </Field>
          <Field label="Tags">
            <TagInput value={tags} onChange={setTags} />
          </Field>
          <Field label="Related articles">
            <TagInput value={related} onChange={setRelated} placeholder="article slugs" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <TextInput type="date" value={date} onChange={setDate} />
            </Field>
            <Field label="Status">
              <Select
                value={status}
                onChange={(v) => setStatus(v as "draft" | "published")}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                ]}
              />
            </Field>
          </div>
        </aside>

        {/* Body editor */}
        <section aria-label="Article body">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium">Body (markdown)</h2>
            <div
              role="tablist"
              aria-label="Editor mode"
              className="flex rounded-full border p-0.5 text-xs"
            >
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
            <TextArea
              value={body}
              onChange={setBody}
              rows={24}
              mono
              placeholder="# Start writing…"
            />
          ) : (
            <div className="rounded-md border bg-card p-6 min-h-[600px]">
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
