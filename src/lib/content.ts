import { createServerFn } from "@tanstack/react-start"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "./db"
import { articles, nodes, sites, events } from "./db/schema"

export type ArticleContent = typeof articles.$inferSelect
export type NodeContent = typeof nodes.$inferSelect
export type SiteContent = typeof sites.$inferSelect

// ---------- queries ----------

export const listArticles = createServerFn({ method: "GET" })
  .validator(
    z.object({
      status: z.enum(["draft", "published"]).optional(),
      limit: z.number().optional(),
    }).optional()
  )
  .handler(async ({ data }): Promise<ArticleContent[]> => {
    const db = getDb()
    if (!db) return []
    let query = db.select().from(articles).$dynamic()
    if (data?.status) query = query.where(eq(articles.status, data.status))
    query = query.orderBy(desc(articles.date), desc(articles.createdAt))
    if (data?.limit) query = query.limit(data.limit)
    return await query
  })

export const getArticleBySlug = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data: slug }): Promise<ArticleContent | null> => {
    const db = getDb()
    if (!db) return null
    const rows = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1)
    return rows[0] ?? null
  })

export const listNodes = createServerFn({ method: "GET" }).handler(
  async (): Promise<NodeContent[]> => {
    const db = getDb()
    if (!db) return []
    return await db.select().from(nodes).orderBy(nodes.title)
  }
)

export const getNodeBySlug = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data: slug }): Promise<NodeContent | null> => {
    const db = getDb()
    if (!db) return null
    const rows = await db.select().from(nodes).where(eq(nodes.slug, slug)).limit(1)
    return rows[0] ?? null
  })

export const listSites = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContent[]> => {
    const db = getDb()
    if (!db) return []
    return await db.select().from(sites).orderBy(sites.title)
  }
)

export const getSiteBySlug = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data: slug }): Promise<SiteContent | null> => {
    const db = getDb()
    if (!db) return null
    const rows = await db.select().from(sites).where(eq(sites.slug, slug)).limit(1)
    return rows[0] ?? null
  })

export interface SearchDoc {
  slug: string
  title: string
  description: string
  tags: string[]
}

export const searchDocs = createServerFn({ method: "GET" }).handler(
  async (): Promise<SearchDoc[]> => {
    const db = getDb()
    if (!db) return []
    const rows = await db
      .select({
        slug: articles.slug,
        title: articles.title,
        description: articles.description,
        tags: articles.tags,
      })
      .from(articles)
      .where(eq(articles.status, "published"))
    return rows
  }
)

// ---------- mutations ----------

const articleInput = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  body: z.string().default(""),
  layers: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
  date: z.string().nullish(),
  status: z.enum(["draft", "published"]).default("draft"),
})

export const upsertArticle = createServerFn({ method: "POST" })
  .validator(articleInput)
  .handler(async ({ data }) => {
    const db = getDb()
    if (!db) throw new Error("No database binding")
    const values = { ...data, date: data.date ?? null, updatedAt: new Date() }
    await db
      .insert(articles)
      .values(values)
      .onConflictDoUpdate({ target: articles.slug, set: values })
  })

export const deleteArticle = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: slug }) => {
    const db = getDb()
    if (!db) throw new Error("No database binding")
    await db.delete(articles).where(eq(articles.slug, slug))
  })

const nodeInput = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  body: z.string().default(""),
  type: z.enum(["layer", "dimension"]).default("layer"),
  color: z.string().default("#6b7280"),
  edges: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
})

export const upsertNode = createServerFn({ method: "POST" })
  .validator(nodeInput)
  .handler(async ({ data }) => {
    const db = getDb()
    if (!db) throw new Error("No database binding")
    const values = { ...data, updatedAt: new Date() }
    await db
      .insert(nodes)
      .values(values)
      .onConflictDoUpdate({ target: nodes.slug, set: values })
  })

export const deleteNode = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: slug }) => {
    const db = getDb()
    if (!db) throw new Error("No database binding")
    await db.delete(nodes).where(eq(nodes.slug, slug))
  })

const siteInput = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  body: z.string().default(""),
  layers: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  url: z.string().nullish(),
  type: z.string().nullish(),
})

export const upsertSite = createServerFn({ method: "POST" })
  .validator(siteInput)
  .handler(async ({ data }) => {
    const db = getDb()
    if (!db) throw new Error("No database binding")
    const values = {
      ...data,
      url: data.url ?? null,
      type: data.type ?? null,
      updatedAt: new Date(),
    }
    await db
      .insert(sites)
      .values(values)
      .onConflictDoUpdate({ target: sites.slug, set: values })
  })

export const deleteSite = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: slug }) => {
    const db = getDb()
    if (!db) throw new Error("No database binding")
    await db.delete(sites).where(eq(sites.slug, slug))
  })

const eventInput = z.object({
  type: z.enum(["funding", "ma", "model_release", "paper"]),
  date: z.string().min(1),
  title: z.string().min(1),
  details: z.string().nullish(),
  siteId: z.string().nullish(),
  layerId: z.string().nullish(),
  sourceUrl: z.string().nullish(),
})

export const upsertEvent = createServerFn({ method: "POST" })
  .validator(eventInput)
  .handler(async ({ data }) => {
    const db = getDb()
    if (!db) throw new Error("No database binding")
    await db.insert(events).values({
      type: data.type,
      date: data.date,
      title: data.title,
      details: data.details ?? null,
      siteId: data.siteId ?? null,
      layerId: data.layerId ?? null,
      sourceUrl: data.sourceUrl ?? null,
    })
  })

export const deleteEvent = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: id }) => {
    const db = getDb()
    if (!db) throw new Error("No database binding")
    await db.delete(events).where(eq(events.id, id))
  })
