import configuration from "../../content-collections.ts";
import { GetTypeByName } from "@content-collections/core";

export type Article = GetTypeByName<typeof configuration, "articles">;
export declare const allArticles: Array<Article>;

export type Node = GetTypeByName<typeof configuration, "nodes">;
export declare const allNodes: Array<Node>;

export type Site = GetTypeByName<typeof configuration, "sites">;
export declare const allSites: Array<Site>;

export {};
