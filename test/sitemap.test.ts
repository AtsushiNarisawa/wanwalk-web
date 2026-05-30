import { describe, it, expect, vi } from "vitest";

// sitemap は getAllSpotSlugs 等（is_published 済）に加え、isValidSlug で非ASCII/過長/不正 slug を
// 二重に除外する。万一 DB に不正 slug が混入してもサイトマップに出さない防御を固定する。
vi.mock("@/lib/walks/data", () => ({
  getAllPublishedRoutes: vi.fn(async () => [
    { slug: "route-ok", updated_at: "2026-05-01" },
    { slug: "ルート不正", updated_at: null },
  ]),
  getAreas: vi.fn(async () => [{ slug: "area-ok" }, { slug: null }]),
  getAllSpotSlugs: vi.fn(async () => ["spot-ok", "bad spot", "日本語"]),
  getSpotsByCategory: vi.fn(async () =>
    Array.from({ length: 35 }, (_, i) => ({ id: String(i) })),
  ),
}));
vi.mock("@/lib/news", () => ({
  getAllNewsArticles: vi.fn(async () => [
    { slug: "news-ok", publishedAt: "2026-05-20" },
  ]),
}));

import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("静的ページと有効 slug を含み、非ASCII/不正 slug を除外する", async () => {
    const urls = (await sitemap()).map((e) => e.url);

    expect(urls).toContain("https://wanwalk.jp");
    expect(urls).toContain("https://wanwalk.jp/about");
    expect(urls).toContain("https://wanwalk.jp/news");
    expect(urls).toContain("https://wanwalk.jp/routes/route-ok");
    expect(urls).toContain("https://wanwalk.jp/areas/area-ok");
    expect(urls).toContain("https://wanwalk.jp/spots/spot-ok");
    expect(urls).toContain("https://wanwalk.jp/news/news-ok");

    // 不正 slug は除外
    expect(urls.some((u) => u.includes("ルート不正"))).toBe(false);
    expect(urls.some((u) => u.includes("bad"))).toBe(false);
    expect(urls.some((u) => u.includes("日本語"))).toBe(false);
    // area slug null は除外（/areas/ だけの URL が出ない）
    expect(urls.some((u) => u === "https://wanwalk.jp/areas/")).toBe(false);
  });

  it("カテゴリページは件数からページネーション URL を生成（35件→page=2 まで）", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain("https://wanwalk.jp/spots/category/viewpoint");
    expect(urls).toContain("https://wanwalk.jp/spots/category/viewpoint?page=2");
    // 35 / 30 = 2 ページなので page=3 は無い
    expect(urls.some((u) => u.includes("viewpoint?page=3"))).toBe(false);
  });
});
