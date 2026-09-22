import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}

const jsonArray = (name: string) =>
  text(name, { mode: "json" }).$type<string[]>().notNull().default([])

export const articles = sqliteTable("articles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  body: text("body").notNull().default(""),
  layers: jsonArray("layers"),
  tags: jsonArray("tags"),
  related: jsonArray("related"),
  date: text("date"),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  ...timestamps,
})

export const nodes = sqliteTable("nodes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  body: text("body").notNull().default(""),
  type: text("type", { enum: ["layer", "dimension"] })
    .notNull()
    .default("layer"),
  color: text("color").notNull().default("#6b7280"),
  edges: jsonArray("edges"),
  tags: jsonArray("tags"),
  ...timestamps,
})

export const sites = sqliteTable("sites", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  body: text("body").notNull().default(""),
  layers: jsonArray("layers"),
  tags: jsonArray("tags"),
  url: text("url"),
  type: text("type"),
  ...timestamps,
})

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
