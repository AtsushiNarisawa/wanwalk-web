import Link from "next/link";
import { getRoutesByAreaId } from "@/lib/walks/data";
import { formatDistanceOrDash } from "@/lib/walks/format";
import type { RouteWithArea } from "@/types/walks";

type Props = {
  currentRoute: RouteWithArea;
};

// 鎌倉内部リンク救済（2026-06-04）: 同エリアの全コースをテキストリンクで完全相互接続する。
// 背景: RelatedRoutes は同エリアを total_walks 降順で上位4本だけリンクする（rich-get-richer）ため、
// total_walks=0 の高表示ページ（例: 鎌倉「源氏山公園 周回」461表示/13.9位）が兄弟ルートから
// サイト内リンクをほとんど受け取れず2ページ目に沈んでいた。本コンポーネントが全兄弟への
// ランドマーク名入りアンカーリンクを保証し、内部 authority を均等配分する（カニバリの差別化にも効く）。
// Server Component（テキストのみ）＝ hydration/LCP コストほぼ0。
//
// 表示条件: 兄弟が5本以上（=エリア6本以上）のときだけ描画する。
// 兄弟が4本以下なら RelatedRoutes の4枠（maxCount=4）で全兄弟を網羅済みのため冗長になる。
// 実質の受益は鎌倉(9本)・伊豆(6本)＋今後6本以上に育つエリア。
export default async function AreaRouteLinks({ currentRoute }: Props) {
  const all = await getRoutesByAreaId(currentRoute.area_id);
  const siblings = all.filter((r) => r.id !== currentRoute.id);
  if (siblings.length < 5) return null;

  const areaName = currentRoute.areas.name;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${areaName}の散歩コース一覧`,
    itemListElement: siblings.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://wanwalk.jp/routes/${r.slug}`,
      name: r.name,
    })),
  };

  return (
    <nav
      aria-labelledby="area-route-links-heading"
      style={{
        marginTop: 48,
        paddingTop: 40,
        borderTop: "1px solid var(--color-ww-border-subtle)",
      }}
    >
      <h2
        id="area-route-links-heading"
        style={{
          fontFamily: "var(--font-ww-serif)",
          fontSize: 24,
          fontWeight: 600,
          color: "var(--color-ww-text)",
          letterSpacing: "0.01em",
          marginBottom: 20,
        }}
      >
        {areaName}のすべての散歩コース
      </h2>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "16px 24px",
        }}
      >
        {siblings.map((r) => {
          const dist = formatDistanceOrDash(r.distance_meters);
          const meta =
            dist !== "—" ? `${dist}・約${r.estimated_minutes}分` : `約${r.estimated_minutes}分`;
          return (
            <li key={r.id}>
              <Link
                href={`/routes/${r.slug}`}
                style={{
                  fontFamily: "var(--font-ww-sans)",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "var(--color-ww-accent)",
                  textDecoration: "none",
                  lineHeight: 1.5,
                }}
              >
                {r.name}
              </Link>
              <span
                style={{
                  display: "block",
                  fontSize: 12.5,
                  color: "var(--color-ww-text-secondary)",
                  marginTop: 2,
                }}
              >
                {meta}
              </span>
            </li>
          );
        })}
      </ul>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
    </nav>
  );
}
