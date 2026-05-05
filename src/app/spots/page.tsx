import Link from "next/link";
import type { Metadata } from "next";
import {
  Coffee,
  ForkKnife,
  Tree,
  Dog,
  Drop,
  Toilet,
  Car,
  Binoculars,
  Storefront,
  CheckCircle,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { getAllSpots } from "@/lib/walks/data";
import type { SpotCategory } from "@/types/walks";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import SupportedBadge from "@/components/walks/SupportedBadge";

// ISR: 24時間ごとに再検証（Vercel無料枠ISR Writes対策）
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "犬連れスポット一覧 - 全国の愛犬と行ける場所",
  description:
    "カフェ・ドッグラン・公園・レストランなど、愛犬と一緒に行ける全国のスポットを紹介。犬種制限・テラス席・リード情報つき。",
  alternates: {
    canonical: "/spots",
  },
  openGraph: {
    title: "犬連れスポット一覧 | WanWalk",
    description:
      "カフェ・ドッグラン・公園など、愛犬と一緒に行ける全国のスポットを紹介。",
  },
};

const CATEGORY_CONFIG: Record<
  SpotCategory,
  { icon: Icon; label: string }
> = {
  cafe: { icon: Coffee, label: "カフェ" },
  restaurant: { icon: ForkKnife, label: "レストラン" },
  park: { icon: Tree, label: "公園・自然" },
  dog_run: { icon: Dog, label: "ドッグラン" },
  water_station: { icon: Drop, label: "水飲み場" },
  restroom: { icon: Toilet, label: "トイレ" },
  parking: { icon: Car, label: "駐車場" },
  viewpoint: { icon: Binoculars, label: "景観ポイント" },
  shop: { icon: Storefront, label: "ショップ" },
};

// SEO ランディング対象のカテゴリのみ表示（NON_SEO_SPOT_CATEGORIES は getAllSpots 側で除外済み）。
// cafe/restaurant/shop も 5/5 SEO 除外で一覧から外した（食べログ等と棲み分け・GSC 90日 0 click）。
const CATEGORY_ORDER: SpotCategory[] = [
  "viewpoint",
  "park",
  "dog_run",
];

export default async function SpotsListPage() {
  const spots = await getAllSpots();

  // Group by category
  const byCategory = new Map<SpotCategory, typeof spots>();
  for (const spot of spots) {
    const cat = (spot.category ?? "viewpoint") as SpotCategory;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(spot);
  }

  // Unique areas for stats
  const uniqueAreas = new Set(spots.map((s) => s.area_name));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* パンくず */}
      <nav
        style={{
          fontSize: 13,
          color: "var(--color-ww-text-tertiary)",
          marginBottom: 24,
        }}
      >
        <Link href="/" style={{ color: "inherit" }}>
          トップ
        </Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--color-ww-text-secondary)" }}>
          スポット一覧
        </span>
      </nav>

      <h1
        style={{
          fontFamily: "var(--font-ww-serif)",
          fontSize: 32,
          fontWeight: 700,
          color: "var(--color-ww-text)",
          letterSpacing: "0.01em",
          lineHeight: 1.35,
          marginBottom: 8,
        }}
      >
        犬連れスポット一覧
      </h1>
      <p
        style={{
          fontSize: 15,
          color: "var(--color-ww-text-secondary)",
          marginBottom: 32,
        }}
      >
        <span className="ww-numeric">{spots.length}</span>件のスポット・
        <span className="ww-numeric">{uniqueAreas.size}</span>エリア対応
      </p>

      {/* カテゴリ別アンカーナビ */}
      <div
        className="flex flex-wrap gap-2 mb-10"
        style={{ fontSize: 13 }}
      >
        {CATEGORY_ORDER.map((cat) => {
          const conf = CATEGORY_CONFIG[cat];
          const count = byCategory.get(cat)?.length ?? 0;
          if (count === 0) return null;
          const CatIcon = conf.icon;
          return (
            <a
              key={cat}
              href={`#cat-${cat}`}
              className="inline-flex items-center gap-1.5 transition-colors"
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-ww-sm)",
                border: "1px solid var(--color-ww-border-subtle)",
                color: "var(--color-ww-text-secondary)",
                backgroundColor: "var(--color-ww-bg)",
              }}
            >
              <CatIcon size={14} weight="regular" />
              {conf.label}
              <span className="ww-numeric" style={{ opacity: 0.6 }}>
                {count}
              </span>
            </a>
          );
        })}
      </div>

      {/* カテゴリ別セクション */}
      {CATEGORY_ORDER.map((cat) => {
        const catSpots = byCategory.get(cat);
        if (!catSpots || catSpots.length === 0) return null;
        const conf = CATEGORY_CONFIG[cat];
        const CatIcon = conf.icon;

        return (
          <section key={cat} id={`cat-${cat}`} className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <CatIcon
                size={20}
                weight="regular"
                style={{ color: "var(--color-ww-accent)" }}
              />
              <h2
                className="ww-serif"
                style={{
                  fontFamily: "var(--font-ww-serif)",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "var(--color-ww-accent)",
                }}
              >
                {conf.label}
              </h2>
              <span
                className="ww-numeric"
                style={{
                  fontSize: 13,
                  color: "var(--color-ww-text-tertiary)",
                }}
              >
                ({catSpots.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catSpots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/spots/${spot.slug}`}
                  className="group block transition-colors"
                  style={{
                    padding: 16,
                    backgroundColor: "var(--color-ww-bg)",
                    border: "1px solid var(--color-ww-border-subtle)",
                    borderRadius: "var(--radius-ww-md)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--color-ww-text)",
                      lineHeight: 1.5,
                      marginBottom: 6,
                    }}
                  >
                    {spot.name}
                  </p>
                  <div
                    className="flex items-center gap-3 flex-wrap"
                    style={{
                      fontSize: 12,
                      color: "var(--color-ww-text-secondary)",
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} weight="regular" />
                      {spot.area_name}
                    </span>
                    {spot.pet_friendly && (
                      <span
                        className="inline-flex items-center gap-1"
                        style={{ color: "var(--color-ww-accent)" }}
                      >
                        <CheckCircle size={12} weight="fill" />
                        犬連れOK
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-2"
                    style={{
                      fontSize: 12,
                      color: "var(--color-ww-text-tertiary)",
                    }}
                  >
                    {spot.route_name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <div className="py-8">
        <WalksAppCTA />
      </div>
      <SupportedBadge />

      {/* ItemList structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "WanWalk 犬連れスポット一覧",
            description:
              "全国の愛犬と行けるカフェ・公園・ドッグランなどのスポット情報",
            numberOfItems: spots.length,
            itemListElement: spots.slice(0, 100).map((spot, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://wanwalk.jp/spots/${spot.slug}`,
              name: spot.name,
            })),
          }),
        }}
      />
    </div>
  );
}
