import { drizzle } from "drizzle-orm/d1"
import * as schema from "./schema"

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb(env: { DB: D1Database }) {
  if (!_db) {
    _db = drizzle(env.DB, { schema })
  }
  return _db
}

export type Database = ReturnType<typeof getDb>
