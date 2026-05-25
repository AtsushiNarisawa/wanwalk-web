import fs from "node:fs/promises";
import path from "node:path";

export type NewsArticleMetadata = {
  title: string;
  description: string;
  publishedAt: string;
  category: string;
  heroImage?: string;
  heroImageAlt?: string;
};

export type NewsArticleSummary = NewsArticleMetadata & {
  slug: string;
};

const NEWS_DIR = path.join(process.cwd(), "src/content/news");

export async function getAllNewsSlugs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(NEWS_DIR);
    return entries
      .filter((name) => name.endsWith(".mdx"))
      .map((name) => name.replace(/\.mdx$/, ""));
  } catch {
    return [];
  }
}

export async function getNewsMetadata(
  slug: string,
): Promise<NewsArticleMetadata | null> {
  try {
    const mod = await import(`@/content/news/${slug}.mdx`);
    if (!mod?.metadata) return null;
    return mod.metadata as NewsArticleMetadata;
  } catch {
    return null;
  }
}

export async function getAllNewsArticles(): Promise<NewsArticleSummary[]> {
  const slugs = await getAllNewsSlugs();
  const articles = await Promise.all(
    slugs.map(async (slug) => {
      const meta = await getNewsMetadata(slug);
      if (!meta) return null;
      return { slug, ...meta };
    }),
  );
  return articles
    .filter((a): a is NewsArticleSummary => a !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function formatPublishedDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
