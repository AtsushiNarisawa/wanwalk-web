import type { MetadataRoute } from "next";
import { getAllPublishedRoutes, getAreas, getAllSpotSlugs } from "@/lib/walks/data";

// ISR: 24時間ごとに再検証（Vercel無料枠ISR Writes対策）
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://wanwalk.jp";

  const [routes, areas, spotSlugs] = await Promise.all([
    getAllPublishedRoutes(),
    getAreas(),
    getAllSpotSlugs(),
  ]);

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

  const routePages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}/routes/${route.slug}`,
    lastModified: route.updated_at ? new Date(route.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const areaPages: MetadataRoute.Sitemap = areas.map((area) => ({
    url: `${baseUrl}/areas/${area.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const spotPages: MetadataRoute.Sitemap = spotSlugs.map((slug) => ({
    url: `${baseUrl}/spots/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...routePages, ...areaPages, ...spotPages];
}
