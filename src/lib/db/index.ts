import { drizzle } from "drizzle-orm/d1"
import * as schema from "./schema"

type D1Database = Awaited<
  ReturnType<import("miniflare").Miniflare["getD1Database"]>
>

let _d1: D1Database | null = null
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

/**
 * Resolve the D1 binding from the environment.
 * - Dev: set by the miniflare vite shim on `globalThis.__env__.DB`
 * - Prod: Cloudflare injects the binding (wiring verified at deploy time)
 */
export function resolveD1(): D1Database | null {
  if (_d1) return _d1
  const globalEnv = (globalThis as Record<string, unknown>).__env__ as
    | { DB?: D1Database }
    | undefined
  const processEnv = process.env as unknown as Record<string, unknown>
  _d1 = globalEnv?.DB ?? (processEnv.DB as D1Database | undefined) ?? null
  return _d1
}

/** Returns a drizzle client, or null when no D1 binding is available. */
export function getDb() {
  const d1 = resolveD1()
  if (!d1) return null
  if (!_db) {
    _db = drizzle(d1, { schema })
  }
  return _db
}
