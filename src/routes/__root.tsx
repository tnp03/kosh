/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import * as React from "react"
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary"
import { NotFound } from "~/components/NotFound"
import { TooltipProvider } from "@/components/ui/tooltip"
import appCss from "~/styles/globals.css?url"
import { seo } from "~/utils/seo"
import { Button } from "@/components/ui/button"
import { Brain, Search } from "lucide-react"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "Kosh - AI Knowledge Base",
        description:
          "A comprehensive knowledge base for artificial intelligence concepts, models, tools, and research.",
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center px-4">
              <Link to="/" className="mr-6 flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="font-bold text-xl">Kosh</span>
              </Link>
              <nav className="flex items-center gap-1 text-sm">
                <Link
                  to="/dashboard"
                  className="px-3 py-1.5 rounded-full transition-colors hover:bg-accent text-foreground/60"
                  activeProps={{ className: "bg-foreground text-background font-medium" }}
                >
                  Dashboard
                </Link>
                <Link
                  to="/graph"
                  className="px-3 py-1.5 rounded-full transition-colors hover:bg-accent text-foreground/60"
                  activeProps={{ className: "bg-foreground text-background font-medium" }}
                >
                  Graph
                </Link>
                <Link
                  to="/articles"
                  className="px-3 py-1.5 rounded-full transition-colors hover:bg-accent text-foreground/60"
                  activeProps={{ className: "bg-foreground text-background font-medium" }}
                >
                  Articles
                </Link>
                <Link
                  to="/events"
                  className="px-3 py-1.5 rounded-full transition-colors hover:bg-accent text-foreground/60"
                  activeProps={{ className: "bg-foreground text-background font-medium" }}
                >
                  Events
                </Link>
              </nav>
              <div className="flex flex-1 items-center justify-end gap-2">
                <Link to="/search">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Search className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
          <footer className="border-t py-6">
            <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 text-sm text-muted-foreground">
              <span>Kosh - AI Knowledge Base</span>
              <nav className="flex items-center gap-4">
                <Link to="/graph" className="hover:text-foreground transition-colors">
                  Graph
                </Link>
                <Link to="/events" className="hover:text-foreground transition-colors">
                  Events
                </Link>
                <Link to="/studio" className="hover:text-foreground transition-colors">
                  Studio
                </Link>
              </nav>
            </div>
          </footer>
        </div>
        </TooltipProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
