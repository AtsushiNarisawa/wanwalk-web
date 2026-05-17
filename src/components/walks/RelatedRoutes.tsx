import { getRelatedRoutes } from "@/lib/walks/data";
import RouteCard from "./RouteCard";
import type { RouteWithArea } from "@/types/walks";

type Props = {
  currentRoute: RouteWithArea;
};

// Phase 2-B Step 5-B: 関連ルート表示（同エリア + 同季節タグ + cart + 距離 4 軸）
// - ルート詳細ページ末尾に表示・直帰率改善目的（41%→35% 目標）
// - 上位 4 件をスコア順で。同エリア優先、fallback で他軸補填。
// - 該当 0 件なら何も描画しない（早期 return）
export default async function RelatedRoutes({ currentRoute }: Props) {
  const related = await getRelatedRoutes(currentRoute, 4);
  if (related.length === 0) return null;

  // セクションタイトル: 同エリアの related が 1 件でもあれば「{エリア}の他の散歩ルート」、それ以外は「似た条件のルート」
  const sameAreaCount = related.filter((r) => r.area_id === currentRoute.area_id).length;
  const heading = sameAreaCount > 0
    ? `${currentRoute.areas.name}の他の散歩ルート`
    : "似た条件のルート";

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: heading,
    itemListElement: related.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://wanwalk.jp/routes/${r.slug}`,
      name: r.name,
    })),
  };

  return (
    <section
      style={{
        marginTop: 64,
        paddingTop: 48,
        borderTop: "1px solid var(--color-ww-border-subtle)",
      }}
      aria-labelledby="related-routes-heading"
    >
      <h2
        id="related-routes-heading"
        style={{
          fontFamily: "var(--font-ww-serif)",
          fontSize: 28,
          fontWeight: 600,
          color: "var(--color-ww-text)",
          letterSpacing: "0.01em",
          marginBottom: 24,
        }}
      >
        {heading}
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {related.map((route) => (
          <RouteCard key={route.id} route={route} sourcePage="route_detail" />
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
    </section>
  );
}
