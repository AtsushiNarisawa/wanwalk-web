import Link from "next/link";
import type { Metadata } from "next";
import { getAreasWithRouteCount } from "@/lib/walks/data";
import SupportedBadge from "@/components/walks/SupportedBadge";
import AreaCard from "@/components/walks/AreaCard";

// ISR: 30分ごとに再検証
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "エリア一覧 - 犬と歩ける散歩コース | DogHub",
  description:
    "箱根・鎌倉・湘南・横浜など、愛犬と一緒に楽しめる散歩コースのあるエリア一覧。犬連れに必要な情報つきで紹介。",
};

export default async function AreasPage() {
  const areas = await getAreasWithRouteCount();

  const byPrefecture = areas.reduce<Record<string, (typeof areas)[number][]>>(
    (acc, area) => {
      const pref = area.prefecture;
      if (!acc[pref]) acc[pref] = [];
      acc[pref].push(area);
      return acc;
    },
    {}
  );

  const prefOrder = ["神奈川県", "東京都"];
  const sortedPrefs = [
    ...prefOrder.filter((p) => byPrefecture[p]),
    ...Object.keys(byPrefecture)
      .filter((p) => !prefOrder.includes(p))
      .sort(),
  ];

  return (
    <div
      className="mx-auto"
      style={{
        maxWidth: 1200,
        padding: "48px 16px",
      }}
    >
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
        <Link href="/" style={{ color: "inherit" }}>
          散歩コース
        </Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--color-ww-text-secondary)" }}>
          エリア一覧
        </span>
      </nav>

      <h1
        style={{
          fontFamily: "var(--font-ww-serif)",
          fontSize: 36,
          fontWeight: 700,
          lineHeight: 1.35,
          color: "var(--color-ww-text)",
          marginBottom: 12,
          letterSpacing: "0.01em",
        }}
      >
        エリア一覧
      </h1>
      <p
        style={{
          color: "var(--color-ww-text-secondary)",
          fontSize: 16,
          lineHeight: 1.75,
          marginBottom: 48,
        }}
      >
        愛犬と歩ける散歩コースを都道府県別にご紹介します。
      </p>

      {sortedPrefs.map((pref) => (
        <section key={pref} style={{ marginTop: 64 }}>
          <h2
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 24,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              letterSpacing: "0.02em",
              marginBottom: 24,
              paddingBottom: 12,
              borderBottom: "1px solid var(--color-ww-border-subtle)",
            }}
          >
            {pref}
          </h2>
          <div
            className="grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              columnGap: 32,
              rowGap: 40,
            }}
          >
            {byPrefecture[pref].map((area) => (
              <AreaCard
                key={area.id}
                slug={area.slug}
                name={area.name}
                routeCount={area.route_count}
                heroImageUrl={area.hero_image_url ?? null}
              />
            ))}
          </div>
        </section>
      ))}

      <div style={{ marginTop: 64 }}>
        <SupportedBadge />
      </div>
    </div>
  );
}
