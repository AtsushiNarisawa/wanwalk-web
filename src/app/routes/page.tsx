import Link from "next/link";
import type { Metadata } from "next";
import { getAllPublishedRoutes, getAreasWithRouteCount } from "@/lib/walks/data";
import SeasonFilter from "@/components/walks/SeasonFilter";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "散歩コース一覧",
  description:
    "WanWalk掲載の全散歩コースを一覧で。箱根・鎌倉・伊豆など全エリアから、季節やカート走行可で絞り込めます。",
  alternates: {
    canonical: "/routes",
  },
  openGraph: {
    title: "散歩コース一覧 | WanWalk",
    description: "全エリアの愛犬散歩コースを一覧で。季節フィルター付き。",
    images: [
      {
        url: "https://jkpenklhrlbctebkpvax.supabase.co/storage/v1/render/image/public/route-photos/yamanakako-lakeside/refetch_20260422/01.jpg?width=1200&height=630&resize=cover&quality=80",
        width: 1200,
        height: 630,
        alt: "散歩コース一覧 | WanWalk",
      },
    ],
  },
};

export default async function RoutesIndexPage() {
  const [routes, areas] = await Promise.all([
    getAllPublishedRoutes(),
    getAreasWithRouteCount(),
  ]);
  const activeAreas = areas.filter((a) => a.route_count > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      <nav
        aria-label="パンくず"
        className="mb-6"
        style={{
          fontSize: 12,
          color: "var(--color-ww-text-secondary)",
        }}
      >
        <Link
          href="/"
          style={{ color: "var(--color-ww-text-secondary)" }}
        >
          ホーム
        </Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--color-ww-text)" }}>散歩コース一覧</span>
      </nav>

      <header className="mb-10">
        <h1
          className="ww-serif"
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 32,
            fontWeight: 700,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
            lineHeight: 1.3,
          }}
        >
          散歩コース一覧
        </h1>
        <p
          className="mt-3"
          style={{
            fontSize: 15,
            lineHeight: 1.75,
            color: "var(--color-ww-text-secondary)",
          }}
        >
          <span className="ww-numeric">{activeAreas.length}</span>エリアの
          <span className="ww-numeric">{routes.length}</span>コースから、季節やカート走行可で絞り込めます。
        </p>
      </header>

      <SeasonFilter routes={routes} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "WanWalk 犬連れ散歩コース一覧",
            description:
              "箱根・鎌倉・伊豆など、愛犬と歩きたくなる散歩コースを厳選。",
            numberOfItems: routes.length,
            itemListElement: routes.map((route, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://wanwalk.jp/routes/${route.slug}`,
              name: route.name,
            })),
          }),
        }}
      />
    </div>
  );
}
