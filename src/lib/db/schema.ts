import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const events = sqliteTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: text("type", {
    enum: ["funding", "ma", "model_release", "paper"],
  }).notNull(),
  date: text("date").notNull(),
  siteId: text("site_id"),
  layerId: text("layer_id"),
  title: text("title").notNull(),
  details: text("details"),
  sourceUrl: text("source_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})
