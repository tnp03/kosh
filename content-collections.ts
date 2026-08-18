import { defineCollection, defineConfig } from "@content-collections/core"
import { compileMDX } from "@content-collections/mdx"
import { z } from "zod"

const articles = defineCollection({
  name: "articles",
  directory: "content/articles",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(["models", "tools", "concepts", "research"]),
    tags: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    date: z.string().optional(),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document)
    const slug = document._meta.fileName.replace(/\.mdx$/, "")
    return {
      ...document,
      mdx,
      slug,
    }
  },
})

export default defineConfig({
  content: [articles],
})
