import { useState } from "react"
import {
  FileText, Plus, Search, ChevronRight, MoreHorizontal,
  Type, List, Code, MessageSquare, Minus, Hash, Trash2
} from "lucide-react"

interface Page {
  id: string; title: string; icon: string; blocks: number; updated: string; status: "published" | "draft"
}
interface Block {
  id: string; type: string; content: string
}

const blockIcons: Record<string, typeof Type> = {
  heading: Type, paragraph: Type, list: List, code: Code,
  callout: MessageSquare, divider: Minus,
}

export function VariantA({ pages, blocks }: { pages: Page[]; blocks: Block[] }) {
  const [selectedPage, setSelectedPage] = useState(pages[0])
  const [treeOpen, setTreeOpen] = useState<Record<string, boolean>>({ workspace: true })
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null)

  return (
    <div className="flex h-screen text-sm">
      {/* Sidebar — Notion-style tree */}
      <aside className="w-60 border-r bg-muted/30 flex flex-col">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer">
            <span className="text-lg">🧠</span>
            <span className="font-semibold flex-1">Kosh Workspace</span>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2">
          <button
            onClick={() => setTreeOpen(o => ({ ...o, workspace: !o.workspace }))}
            className="flex items-center gap-1 w-full px-2 py-1 text-muted-foreground hover:text-foreground rounded"
          >
            <ChevronRight className={`h-3 w-3 transition-transform ${treeOpen.workspace ? "rotate-90" : ""}`} />
            <span className="text-xs font-medium uppercase tracking-wider">Pages</span>
          </button>

          {treeOpen.workspace && (
            <div className="ml-2 mt-0.5 space-y-0.5">
              {pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page)}
                  className={`flex items-center gap-2 w-full px-2 py-1 rounded transition-colors ${
                    selectedPage.id === page.id
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <span>{page.icon}</span>
                  <span className="flex-1 text-left truncate">{page.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    page.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {page.status === "published" ? "P" : "D"}
                  </span>
                </button>
              ))}
            </div>
          )}

          <button className="flex items-center gap-2 w-full px-2 py-1 mt-1 text-muted-foreground hover:text-foreground rounded">
            <Plus className="h-3 w-3" />
            <span className="text-xs">New page</span>
          </button>
        </div>

        {/* State surface */}
        <div className="border-t p-2 text-[10px] text-muted-foreground font-mono">
          <div>selected: {selectedPage.id}</div>
          <div>pages: {pages.length} · blocks: {selectedPage.blocks}</div>
        </div>
      </aside>

      {/* Main — Block editor */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-6 py-3 border-b">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search or jump to..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{selectedPage.blocks} blocks</span>
            <span>·</span>
            <span>{selectedPage.updated}</span>
          </div>
        </header>

        {/* Page header */}
        <div className="px-16 pt-12 pb-4">
          <div className="text-5xl mb-3">{selectedPage.icon}</div>
          <h1 className="text-4xl font-bold tracking-tight">{selectedPage.title}</h1>
        </div>

        {/* Blocks */}
        <div className="flex-1 overflow-auto px-16 pb-24">
          <div className="max-w-2xl space-y-1">
            {blocks.map(block => {
              const Icon = blockIcons[block.type] ?? Type
              return (
                <div
                  key={block.id}
                  className="group relative flex items-start gap-2 py-1 px-2 -mx-2 rounded hover:bg-muted/50"
                  onMouseEnter={() => setHoveredBlock(block.id)}
                  onMouseLeave={() => setHoveredBlock(null)}
                >
                  {/* Block handle */}
                  <div className={`flex items-center gap-1 pt-0.5 transition-opacity ${hoveredBlock === block.id ? "opacity-100" : "opacity-0"}`}>
                    <button className="p-0.5 rounded hover:bg-accent text-muted-foreground">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-0.5 rounded hover:bg-accent text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Block content */}
                  <div className="flex-1 min-w-0">
                    {block.type === "heading" && (
                      <h2 className="text-xl font-semibold mt-2">{block.content}</h2>
                    )}
                    {block.type === "paragraph" && (
                      <p className="text-muted-foreground leading-relaxed">{block.content}</p>
                    )}
                    {block.type === "callout" && (
                      <div className="flex gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm">
                        <span className="text-lg shrink-0">💡</span>
                        <span>{block.content}</span>
                      </div>
                    )}
                    {block.type === "list" && (
                      <ul className="space-y-1">
                        {block.content.split("\n").map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {block.type === "code" && (
                      <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
                        <code>{block.content}</code>
                      </pre>
                    )}
                    {block.type === "divider" && (
                      <hr className="my-3 border-muted" />
                    )}
                  </div>

                  {/* Delete on hover */}
                  {hoveredBlock === block.id && (
                    <button className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0 mt-0.5">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
