import { createServerFn } from "@tanstack/react-start"
import { desc } from "drizzle-orm"
import { getDb } from "./db"
import { events } from "./db/schema"

export interface EventItem {
  id: string
  type: string
  date: string
  siteId: string | null
  layerId: string | null
  title: string
  details: string | null
  sourceUrl: string | null
}

export const fetchEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<EventItem[]> => {
    try {
      const db = getDb()
      if (!db) return []
      const rows = await db
        .select()
        .from(events)
        .orderBy(desc(events.date))
        .limit(200)
      return rows.map((row) => ({
        id: row.id,
        type: row.type,
        date: row.date,
        siteId: row.siteId,
        layerId: row.layerId,
        title: row.title,
        details: row.details,
        sourceUrl: row.sourceUrl,
      }))
    } catch {
      return []
    }
  }
)
