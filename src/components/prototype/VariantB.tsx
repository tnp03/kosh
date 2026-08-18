import { useState, useMemo } from "react"
import { Search, GitBranch, Link2, Clock, Star, PanelLeftClose, PanelLeft } from "lucide-react"

interface Page {
  id: string; title: string; icon: string; blocks: number; updated: string; status: "published" | "draft"
}
interface Block {
  id: string; type: string; content: string
}

// Simulated graph data — each page links to others
const graphLinks: Record<string, string[]> = {
  "1": ["2", "3", "5"],
  "2": ["1", "4"],
  "3": ["1", "5", "6"],
  "4": ["2"],
  "5": ["1", "3"],
  "6": ["3"],
}

function GraphView({ pages, selectedId, onSelect }: { pages: Page[]; selectedId: string; onSelect: (id: string) => void }) {
  // Simple force-directed-ish layout using fixed positions in a circle
  const positions = useMemo(() => {
    const cx = 150, cy = 120, r = 90
    return pages.map((p, i) => {
      const angle = (i / pages.length) * Math.PI * 2 - Math.PI / 2
      return { id: p.id, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), icon: p.icon, title: p.title }
    })
  }, [pages])

  const posMap = useMemo(() => Object.fromEntries(positions.map(p => [p.id, p])), [positions])

  return (
    <div className="relative w-full h-full bg-[#1e1e2e] overflow-hidden">
      <svg viewBox="0 0 300 240" className="w-full h-full">
        {/* Edges */}
        {Object.entries(graphLinks).map(([from, tos]) => {
          const fromPos = posMap[from]
          if (!fromPos) return null
          return tos.map(to => {
            const toPos = posMap[to]
            if (!toPos) return null
            return (
              <line
                key={`${from}-${to}`}
                x1={fromPos.x} y1={fromPos.y}
                x2={toPos.x} y2={toPos.y}
                stroke={from === selectedId || to === selectedId ? "#89b4fa" : "#45475a"}
                strokeWidth={from === selectedId || to === selectedId ? 1.5 : 0.8}
              />
            )
          })
        })}

        {/* Nodes */}
        {positions.map(p => (
          <g
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="cursor-pointer"
          >
            <circle
              cx={p.x} cy={p.y} r={p.id === selectedId ? 18 : 14}
              fill={p.id === selectedId ? "#89b4fa" : "#313244"}
              stroke={p.id === selectedId ? "#89b4fa" : "#585b70"}
              strokeWidth={p.id === selectedId ? 2 : 1}
            />
            <text
              x={p.x} y={p.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={p.id === selectedId ? 14 : 11}
              className="pointer-events-none select-none"
            >
              {p.icon}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export function VariantB({ pages, blocks }: { pages: Page[]; blocks: Block[] }) {
  const [selectedPage, setSelectedPage] = useState(pages[0])
  const [showGraph, setShowGraph] = useState(true)
  const [activeTab, setActiveTab] = useState<"editor" | "backlinks" | "outline">("editor")

  const backlinks = graphLinks[selectedPage.id] ?? []
  const linkedPages = backlinks.map(id => pages.find(p => p.id === id)).filter(Boolean)

  return (
    <div className="flex h-screen text-sm">
      {/* Graph sidebar */}
      {showGraph && (
        <aside className="w-64 border-r flex flex-col bg-[#1e1e2e]">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#313244]">
            <GitBranch className="h-4 w-4 text-[#89b4fa]" />
            <span className="text-[#cdd6f4] font-medium text-xs">Knowledge Graph</span>
            <button
              onClick={() => setShowGraph(false)}
              className="ml-auto p-1 rounded hover:bg-[#313244] text-[#6c7086]"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1">
            <GraphView pages={pages} selectedId={selectedPage.id} onSelect={(id) => {
              const p = pages.find(p => p.id === id)
              if (p) setSelectedPage(p)
            }} />
          </div>

          {/* Page list */}
          <div className="border-t border-[#313244] max-h-48 overflow-auto">
            <div className="p-2 space-y-0.5">
              {pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page)}
                  className={`flex items-center gap-2 w-full px-2 py-1 rounded text-xs ${
                    selectedPage.id === page.id
                      ? "bg-[#313244] text-[#cdd6f4]"
                      : "text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]/50"
                  }`}
                >
                  <span>{page.icon}</span>
                  <span className="flex-1 text-left truncate">{page.title}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Main area */}
      <main className="flex-1 flex flex-col">
        {/* Toolbar */}
        <header className="flex items-center gap-2 px-4 py-2 border-b bg-[#181825]">
          {!showGraph && (
            <button
              onClick={() => setShowGraph(true)}
              className="p-1.5 rounded hover:bg-[#313244] text-[#6c7086]"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}

          <div className="flex items-center gap-1 text-[#6c7086] text-xs">
            <span>{selectedPage.icon}</span>
            <span>{selectedPage.title}</span>
          </div>

          <div className="flex-1" />

          {/* Tabs */}
          <div className="flex gap-1 bg-[#1e1e2e] rounded-md p-0.5">
            {(["editor", "backlinks", "outline"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-xs capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-[#313244] text-[#cdd6f4]"
                    : "text-[#6c7086] hover:text-[#cdd6f4]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#6c7086] ml-2">
            <Clock className="h-3 w-3" />
            <span>{selectedPage.updated}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
              selectedPage.status === "published" ? "bg-[#a6e3a1]/20 text-[#a6e3a1]" : "bg-[#f9e2af]/20 text-[#f9e2af]"
            }`}>
              {selectedPage.status}
            </span>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto bg-[#11111b]">
          {activeTab === "editor" && (
            <div className="max-w-3xl mx-auto px-16 py-12">
              <div className="text-4xl mb-4">{selectedPage.icon}</div>
              <h1 className="text-3xl font-bold text-[#cdd6f4] mb-8">{selectedPage.title}</h1>

              <div className="space-y-4">
                {blocks.map(block => (
                  <div key={block.id} className="group">
                    {block.type === "heading" && (
                      <h2 className="text-xl font-semibold text-[#cdd6f4] mt-6 mb-2">{block.content}</h2>
                    )}
                    {block.type === "paragraph" && (
                      <p className="text-[#a6adc8] leading-relaxed">{block.content}</p>
                    )}
                    {block.type === "callout" && (
                      <div className="flex gap-3 p-3 rounded-lg bg-[#89b4fa]/10 border border-[#89b4fa]/20 text-sm text-[#cdd6f4]">
                        <span>💡</span>
                        <span>{block.content}</span>
                      </div>
                    )}
                    {block.type === "list" && (
                      <ul className="space-y-1 text-[#a6adc8]">
                        {block.content.split("\n").map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-[#89b4fa] shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {block.type === "code" && (
                      <pre className="p-4 rounded-lg bg-[#1e1e2e] border border-[#313244] text-xs font-mono text-[#a6e3a1] overflow-x-auto">
                        <code>{block.content}</code>
                      </pre>
                    )}
                    {block.type === "divider" && (
                      <hr className="my-4 border-[#313244]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "backlinks" && (
            <div className="max-w-3xl mx-auto px-16 py-12">
              <h2 className="text-lg font-semibold text-[#cdd6f4] mb-4 flex items-center gap-2">
                <Link2 className="h-4 w-4 text-[#89b4fa]" />
                Backlinks
              </h2>
              {linkedPages.length === 0 ? (
                <p className="text-[#6c7086] text-sm">No pages link to this one.</p>
              ) : (
                <div className="space-y-2">
                  {linkedPages.map(p => (
                    <button
                      key={p!.id}
                      onClick={() => { setSelectedPage(p!); setActiveTab("editor") }}
                      className="flex items-center gap-3 w-full p-3 rounded-lg bg-[#1e1e2e] border border-[#313244] hover:border-[#89b4fa]/30 transition-colors text-left"
                    >
                      <span className="text-xl">{p!.icon}</span>
                      <div>
                        <div className="text-[#cdd6f4] font-medium">{p!.title}</div>
                        <div className="text-[#6c7086] text-xs">{p!.updated}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "outline" && (
            <div className="max-w-3xl mx-auto px-16 py-12">
              <h2 className="text-lg font-semibold text-[#cdd6f4] mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-[#f9e2af]" />
                Outline
              </h2>
              <div className="space-y-2">
                {blocks.filter(b => b.type === "heading").map((block, i) => (
                  <div key={block.id} className="flex items-center gap-2 text-sm text-[#a6adc8] hover:text-[#cdd6f4] cursor-pointer">
                    <span className="text-[#6c7086] font-mono text-xs w-4">{i + 1}</span>
                    <span className="h-1 w-1 rounded-full bg-[#89b4fa]" />
                    {block.content}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 px-4 py-1.5 border-t bg-[#181825] text-[10px] text-[#6c7086]">
          <span>{selectedPage.blocks} blocks</span>
          <span>·</span>
          <span>{backlinks.length} backlinks</span>
          <span>·</span>
          <span>{graphLinks[selectedPage.id]?.length ?? 0} outgoing links</span>
          <div className="flex-1" />
          <span className="font-mono">variant B · obsidian graph</span>
        </div>
      </main>
    </div>
  )
}
