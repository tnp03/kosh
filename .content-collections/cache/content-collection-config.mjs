// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";
var articles = defineCollection({
  name: "articles",
  directory: "content/articles",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    layers: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    date: z.string().optional(),
    content: z.string()
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    const slug = document._meta.path.replace(/\\/g, "/");
    return {
      ...document,
      mdx,
      slug
    };
  }
});
var nodes = defineCollection({
  name: "nodes",
  directory: "content/nodes",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(["layer", "dimension"]),
    color: z.string().default("#6b7280"),
    edges: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([])
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    const slug = document._meta.path.replace(/\\/g, "/");
    return {
      ...document,
      mdx,
      slug
    };
  }
});
var sites = defineCollection({
  name: "sites",
  directory: "content/sites",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    layers: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    url: z.string().optional(),
    type: z.string().optional()
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    const slug = document._meta.path.replace(/\\/g, "/");
    return {
      ...document,
      mdx,
      slug
    };
  }
});
var content_collections_default = defineConfig({
  content: [articles, nodes, sites]
});
export {
  content_collections_default as default
};
