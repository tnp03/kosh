import { useState } from "react"
import { X } from "lucide-react"

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}

const inputClass =
  "w-full h-9 px-3 rounded-md border bg-card text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      className={inputClass}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  mono = false,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
  mono?: boolean
  placeholder?: string
}) {
  return (
    <textarea
      rows={rows}
      className={`w-full px-3 py-2 rounded-md border bg-card text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring resize-y ${
        mono ? "font-mono text-xs leading-relaxed" : ""
      }`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <select
      className={`${inputClass} cursor-pointer`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

/** Comma-separated entry that produces a string array. */
export function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState("")

  const commit = () => {
    const parts = draft
      .split(",")
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean)
    if (parts.length === 0) return
    const next = [...new Set([...value, ...parts])]
    onChange(next)
    setDraft("")
  }

  return (
    <div>
      <input
        className={inputClass}
        value={draft}
        placeholder={placeholder ?? "Type and press Enter"}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            commit()
          } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={commit}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tag))}
                aria-label={`Remove ${tag}`}
                className="hover:text-destructive transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function ChipMultiSelect({
  options,
  value,
  onChange,
}: {
  options: Array<{ slug: string; title: string; color: string }>
  value: string[]
  onChange: (v: string[]) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt.slug)
        return (
          <button
            key={opt.slug}
            type="button"
            aria-pressed={active}
            onClick={() =>
              onChange(
                active ? value.filter((v) => v !== opt.slug) : [...value, opt.slug]
              )
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all cursor-pointer ${
              active ? "text-white" : "bg-card hover:shadow-sm"
            }`}
            style={
              active
                ? { backgroundColor: opt.color, borderColor: opt.color }
                : { borderColor: opt.color + "40" }
            }
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: opt.color }}
              aria-hidden="true"
            />
            {opt.title}
          </button>
        )
      })}
    </div>
  )
}
