import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { Miniflare } from "miniflare"

const DRIZZLE_DIR = path.resolve(process.cwd(), "drizzle")

/**
 * Create a real local D1 database backed by miniflare, persisted to
 * `.wrangler/state/v3` (same location `wrangler dev` uses), and apply
 * any unapplied SQL migrations from ./drizzle.
 */
export async function createLocalD1() {
  const mf = new Miniflare({
    script: 'export default { fetch() { return new Response("ok") } }',
    modules: true,
    compatibilityDate: "2026-08-01",
    d1Databases: {
      DB: "local-kosh-db",
    },
    // Same location `wrangler dev` / `wrangler d1 execute --local` use,
    // so all tools share one local database.
    d1Persist: path.resolve(".wrangler/state/v3/d1"),
  })
  const db = await mf.getD1Database("DB")
  await applyMigrations(db)
  return { mf, db }
}

export async function applyMigrations(db) {
  await db.exec(
    "CREATE TABLE IF NOT EXISTS __migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)"
  )
  const appliedRows = await db.prepare("SELECT name FROM __migrations").all()
  const applied = new Set((appliedRows.results ?? []).map((r) => r.name))

  const files = readdirSync(DRIZZLE_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()

  for (const file of files) {
    if (applied.has(file)) continue
    const sql = readFileSync(path.join(DRIZZLE_DIR, file), "utf8")
    const statements = sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean)
    try {
      for (const stmt of statements) {
        await db.prepare(stmt).run()
      }
      await db
        .prepare("INSERT INTO __migrations (name, applied_at) VALUES (?, ?)")
        .bind(file, Date.now())
        .run()
      console.log(`[d1] applied migration ${file}`)
    } catch (err) {
      console.error(`[d1] migration ${file} failed:`, err.message)
    }
  }
}
