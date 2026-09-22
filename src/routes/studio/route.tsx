import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import {
  LayoutDashboard,
  FileText,
  Building2,
  Network,
  Zap,
} from "lucide-react"

export const Route = createFileRoute("/studio")({
  component: StudioLayout,
})

const NAV = [
  { to: "/studio", label: "Overview", icon: LayoutDashboard },
  { to: "/studio/articles", label: "Articles", icon: FileText },
  { to: "/studio/sites", label: "Sites", icon: Building2 },
  { to: "/studio/nodes", label: "Nodes", icon: Network },
  { to: "/studio/events", label: "Events", icon: Zap },
] as const

function StudioLayout() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Studio</h1>
        <p className="text-muted-foreground text-sm">
          Author and curate the knowledge base
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
        <nav aria-label="Studio" className="lg:border-r lg:pr-4">
          <ul className="flex lg:flex-col gap-1 overflow-x-auto">
            {NAV.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  activeOptions={{ exact: to === "/studio" }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors hover:bg-accent text-muted-foreground [&.active]:bg-accent [&.active]:text-foreground [&.active]:font-medium"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
