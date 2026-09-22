/**
 * Seed the local D1 database from the MDX files in content/.
 * Usage: pnpm db:seed
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { createLocalD1 } from "./lib/local-d1.mjs"

const CONTENT_DIR = path.resolve(process.cwd(), "content")

const COLLECTIONS = [
  { table: "articles", dir: "articles" },
  { table: "nodes", dir: "nodes" },
  { table: "sites", dir: "sites" },
]

function walkMdx(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walkMdx(full))
    else if (entry.endsWith(".mdx")) out.push(full)
  }
  return out
}

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return { data: {}, body: raw }
  const data: Record<string, unknown> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":")
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        data[key] = JSON.parse(value)
      } catch {
        data[key] = []
      }
    } else if (/^".*"$/.test(value) || /^'.*'$/.test(value)) {
      data[key] = value.slice(1, -1)
    } else {
      data[key] = value
    }
  }
  return { data, body: raw.slice(match[0].length) }
}

function asArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (typeof v === "string" && v.length > 0) return [v]
  return []
}

function upsertStatements(table: string, slug: string, data: Record<string, unknown>, body: string) {
  const now = Date.now()
  const id = crypto.randomUUID()
  const str = (key: string, fallback = "") =>
    typeof data[key] === "string" ? (data[key] as string) : fallback
  const base = {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    body,
    layers: JSON.stringify(asArray(data.layers)),
    tags: JSON.stringify(asArray(data.tags)),
  }

  if (table === "articles") {
    return {
      sql: `INSERT INTO articles (id, slug, title, description, body, layers, tags, related, date, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
              title=excluded.title, description=excluded.description, body=excluded.body,
              layers=excluded.layers, tags=excluded.tags, related=excluded.related,
              date=excluded.date, status=excluded.status, updated_at=excluded.updated_at`,
      args: [
        id, base.slug, base.title, base.description, base.body, base.layers, base.tags,
        JSON.stringify(asArray(data.related)),
        data.date ?? null,
        "published",
        now, now,
      ],
    }
  }

  if (table === "nodes") {
    return {
      sql: `INSERT INTO nodes (id, slug, title, description, body, type, color, edges, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
              title=excluded.title, description=excluded.description, body=excluded.body,
              type=excluded.type, color=excluded.color, edges=excluded.edges,
              tags=excluded.tags, updated_at=excluded.updated_at`,
      args: [
        id, base.slug, base.title, base.description, base.body,
        data.type === "dimension" ? "dimension" : "layer",
        data.color ?? "#6b7280",
        JSON.stringify(asArray(data.edges)),
        base.tags,
        now, now,
      ],
    }
  }

  return {
    sql: `INSERT INTO sites (id, slug, title, description, body, layers, tags, url, type, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(slug) DO UPDATE SET
            title=excluded.title, description=excluded.description, body=excluded.body,
            layers=excluded.layers, tags=excluded.tags, url=excluded.url,
            type=excluded.type, updated_at=excluded.updated_at`,
    args: [
      id, base.slug, base.title, base.description, base.body,
      base.layers, base.tags,
      data.url ?? null,
      data.type ?? null,
      now, now,
    ],
  }
}

async function main() {
  const { mf, db } = await createLocalD1()
  let total = 0

  for (const { table, dir } of COLLECTIONS) {
    const absDir = path.join(CONTENT_DIR, dir)
    const files = walkMdx(absDir)
    for (const file of files) {
      const raw = readFileSync(file, "utf8")
      const { data, body } = parseFrontmatter(raw)
      const slug = path.basename(file).replace(/\.mdx$/, "")
      const { sql, args } = upsertStatements(table, slug, data, body.trim())
      await db.prepare(sql).bind(...args).run()
      total++
    }
    console.log(`[seed] ${table}: ${files.length} documents`)
  }

  console.log(`[seed] done — ${total} documents upserted`)
  await mf.dispose()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
