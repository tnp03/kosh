import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/articles")({
  component: ArticlesLayout,
})

function ArticlesLayout() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Outlet />
    </div>
  )
}
