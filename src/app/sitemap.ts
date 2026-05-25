import type { MetadataRoute } from "next";
import {
  getAllPublishedRoutes,
  getAreas,
  getAllSpotSlugs,
  getSpotsByCategory,
} from "@/lib/walks/data";
import { getAllNewsArticles } from "@/lib/news";

// /spots/category/{cat} の対象カテゴリ + ページネーション設定。
// 1 ページあたりの件数は /spots/category/[category]/page.tsx の PER_PAGE と揃える。
const CATEGORY_PAGES_PER = 30;
const CATEGORIES_FOR_SITEMAP = ["viewpoint", "park", "dog_run"] as const;

// ISR: 24時間ごとに再検証（Vercel無料枠ISR Writes対策）
export const revalidate = 86400;

// 非ASCII / 過長 slug は middleware で 410 Gone 化される。
// 万一 DB に混入してもサイトマップに出さないための防御フィルタ。
const VALID_SLUG = /^[a-z0-9][a-z0-9_-]*$/i;
const isValidSlug = (slug: string | null | undefined): slug is string =>
  typeof slug === "string" && slug.length <= 100 && VALID_SLUG.test(slug);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://wanwalk.jp";

  const [routes, areas, spotSlugs, newsArticles, ...categorySpotsArr] =
    await Promise.all([
      getAllPublishedRoutes(),
      getAreas(),
      getAllSpotSlugs(),
      getAllNewsArticles(),
      ...CATEGORIES_FOR_SITEMAP.map((cat) => getSpotsByCategory(cat)),
    ]);

  // カテゴリ別件数からページネーション URL を生成。
  // page=1 は /spots/category/{cat} の canonical なので page=2 以降のみ追加。
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES_FOR_SITEMAP.flatMap(
    (cat, i) => {
      const total = categorySpotsArr[i]?.length ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / CATEGORY_PAGES_PER));
      const urls: MetadataRoute.Sitemap = [
        {
          url: `${baseUrl}/spots/category/${cat}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        },
      ];
      for (let p = 2; p <= totalPages; p++) {
        urls.push({
          url: `${baseUrl}/spots/category/${cat}?page=${p}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.4,
        });
      }
      return urls;
    }
  );

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/areas`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/routes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/spots`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2026-04-20"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2026-04-20"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const routePages: MetadataRoute.Sitemap = routes
    .filter((route) => isValidSlug(route.slug))
    .map((route) => ({
      url: `${baseUrl}/routes/${route.slug}`,
      lastModified: route.updated_at ? new Date(route.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const areaPages: MetadataRoute.Sitemap = areas
    .filter((area) => isValidSlug(area.slug))
    .map((area) => ({
      url: `${baseUrl}/areas/${area.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const spotPages: MetadataRoute.Sitemap = spotSlugs
    .filter(isValidSlug)
    .map((slug) => ({
      url: `${baseUrl}/spots/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  const newsPages: MetadataRoute.Sitemap = newsArticles
    .filter((a) => isValidSlug(a.slug))
    .map((a) => ({
      url: `${baseUrl}/news/${a.slug}`,
      lastModified: new Date(a.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [
    ...staticPages,
    ...routePages,
    ...areaPages,
    ...categoryPages,
    ...spotPages,
    ...newsPages,
  ];
}
