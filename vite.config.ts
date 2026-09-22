import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { defineConfig, type Plugin } from "vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import path from "path"
import { fileURLToPath } from "url"
import { createLocalD1 } from "./scripts/lib/local-d1.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Dev-only: expose a real local D1 database (miniflare) on
 * `globalThis.__env__.DB` so server functions can query it.
 * Migrations from ./drizzle are applied automatically on startup.
 */
function d1DevServer(): Plugin {
  return {
    name: "d1-dev-server",
    async configureServer(server) {
      const { mf, db } = await createLocalD1()
      ;(globalThis as Record<string, unknown>).__env__ = Object.assign(
        {},
        (globalThis as Record<string, unknown>).__env__,
        { DB: db }
      )
      console.log("[d1-dev] local D1 ready on globalThis.__env__.DB")

      return () => {
        server.httpServer?.on("close", () => {
          void mf.dispose()
        })
      }
    },
  }
}

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    tsconfigPaths: true,
  },
  plugins: [
    d1DevServer(),
    tailwindcss(),
    tanstackStart({
      srcDirectory: "src",
    }),
    viteReact(),
    nitro(),
  ],
})
