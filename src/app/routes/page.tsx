import Link from "next/link";
import type { Metadata } from "next";
import { getAllPublishedRoutes, getAreasWithRouteCount } from "@/lib/walks/data";
import SeasonFilterControls from "@/components/walks/SeasonFilterControls";
import RouteCard from "@/components/walks/RouteCard";
import SavedRoutesLink from "@/components/walks/SavedRoutesLink";
import {
  filterRoutes,
  parseSeasonParam,
  parseCartParam,
} from "@/lib/walks/filter-routes";
import { buildOgMetadata } from "@/lib/walks/og-meta";
import { getSiteStats } from "@/lib/walks/stats";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const { routeCount } = await getSiteStats();
  return {
    title: `犬連れ散歩コース${routeCount}本｜全国エリア別一覧`,
    description:
      "WanWalk掲載の全散歩コースを一覧で。箱根・鎌倉・伊豆など全エリアから、季節やカート走行可で絞り込めます。",
    alternates: { canonical: "/routes" },
    ...buildOgMetadata({
      title: `犬連れ散歩コース${routeCount}本｜全国エリア別一覧 | WanWalk`,
      description: "全エリアの愛犬散歩コースを一覧で。季節フィルター付き。",
      path: "/routes",
      ogImageAlt: `犬連れ散歩コース${routeCount}本 | WanWalk`,
    }),
  };
}

export default async function RoutesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string; cart?: string }>;
}) {
  const { season: rawSeason, cart: rawCart } = await searchParams;
  const season = parseSeasonParam(rawSeason);
  const cartOnly = parseCartParam(rawCart);

  const [routes, areas] = await Promise.all([
    getAllPublishedRoutes(),
    getAreasWithRouteCount(),
  ]);
  const activeAreas = areas.filter((a) => a.route_count > 0);
  const filteredRoutes = filterRoutes(routes, season, cartOnly);

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
          <span className="ww-numeric">{routes.length}</span>ルートから、季節やカート走行可で絞り込めます。
        </p>
        <div className="mt-3">
          <SavedRoutesLink />
        </div>
      </header>

      <SeasonFilterControls
        activeSeason={season}
        cartOnly={cartOnly}
        filteredCount={filteredRoutes.length}
        basePath="/routes"
        sourcePage="routes_list"
      />

      <ul
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0"
      >
        {filteredRoutes.map((route, index) => (
          <li key={route.id} className="ww-route-li">
            <RouteCard
              route={route}
              sourcePage="routes_list"
              priority={index === 0}
            />
          </li>
        ))}
        {filteredRoutes.length === 0 && (
          <li
            className="col-span-full text-center py-12 list-none"
            style={{
              fontSize: 15,
              color: "var(--color-ww-text-tertiary)",
            }}
          >
            条件に合うルートが見つかりませんでした
          </li>
        )}
      </ul>

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
