import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { VariantA } from "~/components/prototype/VariantA"
import { VariantB } from "~/components/prototype/VariantB"
import { VariantC } from "~/components/prototype/VariantC"
import { PrototypeSwitcher } from "~/components/prototype/PrototypeSwitcher"

const VARIANTS = ["A", "B", "C"] as const
const VARIANT_NAMES: Record<string, string> = {
  A: "Notion Block Editor",
  B: "Obsidian Graph + Split",
  C: "Blog-First CMS",
}

export const Route = createFileRoute("/prototype/admin-studio")({
  component: PrototypePage,
  validateSearch: (search: Record<string, unknown>) => ({
    variant: (String(search.variant) || "A") as "A" | "B" | "C",
  }),
})

// PROTOTYPE — mock data, not production
const mockPages = [
  { id: "1", title: "Getting Started with AI Ecosystem", icon: "🧠", blocks: 12, updated: "2h ago", status: "published" as const },
  { id: "2", title: "Foundation Models Overview", icon: "🤖", blocks: 8, updated: "1d ago", status: "draft" as const },
  { id: "3", title: "RAG Architecture Guide", icon: "📚", blocks: 15, updated: "3d ago", status: "published" as const },
  { id: "4", title: "Agent Frameworks Compared", icon: "⚙️", blocks: 6, updated: "1w ago", status: "draft" as const },
  { id: "5", title: "Vector Database Deep Dive", icon: "🔍", blocks: 20, updated: "2w ago", status: "published" as const },
  { id: "6", title: "Fine-tuning Best Practices", icon: "🎯", blocks: 9, updated: "3w ago", status: "draft" as const },
]

const mockBlocks = [
  { id: "b1", type: "heading", content: "Introduction to AI Ecosystem" },
  { id: "b2", type: "paragraph", content: "The AI ecosystem is a complex network of hardware, software, models, and applications that work together to create intelligent systems." },
  { id: "b3", type: "callout", content: "This guide covers the major layers of the AI stack from silicon to applications." },
  { id: "b4", type: "heading", content: "The Stack" },
  { id: "b5", type: "list", content: "Silicon & Chips\nInfrastructure\nFoundation Models\nApplications" },
  { id: "b6", type: "code", content: "const ecosystem = ['silicon', 'infra', 'models', 'apps']" },
  { id: "b7", type: "paragraph", content: "Each layer builds on the one below it, creating a dependency chain that shapes the entire industry." },
  { id: "b8", type: "divider", content: "" },
  { id: "b9", type: "heading", content: "Key Players" },
  { id: "b10", type: "paragraph", content: "NVIDIA dominates silicon, while OpenAI, Anthropic, and Meta lead foundation models." },
]

function PrototypePage() {
  const { variant } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const setVariant = (v: string) => {
    navigate({ search: (prev) => ({ ...prev, variant: v }), replace: true })
  }

  return (
    <div className="min-h-screen bg-background">
      {variant === "A" && <VariantA pages={mockPages} blocks={mockBlocks} />}
      {variant === "B" && <VariantB pages={mockPages} blocks={mockBlocks} />}
      {variant === "C" && <VariantC pages={mockPages} blocks={mockBlocks} />}

      <PrototypeSwitcher
        variants={VARIANTS}
        names={VARIANT_NAMES}
        current={variant}
        onChange={setVariant}
      />
    </div>
  )
}
