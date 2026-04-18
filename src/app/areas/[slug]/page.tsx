import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAreas, getAreaBySlug, getRoutesByAreaId } from "@/lib/walks/data";
import SeasonFilter from "@/components/walks/SeasonFilter";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import SupportedBadge from "@/components/walks/SupportedBadge";
import Link from "next/link";

// ISR: 30分ごとに再検証
export const revalidate = 1800;

export async function generateStaticParams() {
  try {
    const areas = await getAreas();
    return areas.filter((a) => a.slug && typeof a.slug === "string").map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = await getAreaBySlug(slug);
  if (!area) return {};

  return {
    title: `${area.name}で犬と歩けるおすすめ散歩コース`,
    description: `${area.name}（${area.prefecture}）の犬連れ散歩コースを紹介。${area.description ?? ""}`,
    openGraph: {
      title: `${area.name}で犬と歩けるおすすめ散歩コース`,
      description: `${area.name}（${area.prefecture}）の犬連れ散歩コースを紹介。`,
    },
  };
}

export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = await getAreaBySlug(slug);
  if (!area) notFound();

  const routes = await getRoutesByAreaId(area.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <nav
        style={{
          fontSize: 13,
          color: "var(--color-ww-text-tertiary)",
          marginBottom: 24,
        }}
      >
        <Link href="/" style={{ color: "inherit" }}>トップ</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <Link href="/" style={{ color: "inherit" }}>散歩コース</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <Link href="/areas" style={{ color: "inherit" }}>エリア一覧</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--color-ww-text-secondary)" }}>{area.name}</span>
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
        {area.name}で犬と歩けるおすすめ散歩コース
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--color-ww-text-secondary)",
          marginBottom: 8,
        }}
      >
        {area.prefecture}
      </p>
      {area.description && (
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.75,
            color: "var(--color-ww-text-secondary)",
            marginBottom: 32,
            maxWidth: 768,
          }}
        >
          {area.description}
        </p>
      )}

      {routes.length > 0 ? (
        <div style={{ marginBottom: 48 }}>
          <SeasonFilter routes={routes} />
        </div>
      ) : (
        <div
          className="text-center py-16"
          style={{ color: "var(--color-ww-text-tertiary)" }}
        >
          <p>このエリアにはまだ公開ルートがありません。</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>近日公開予定です</p>
        </div>
      )}

      <WalksAppCTA />
      <SupportedBadge />

      {/* 構造化データ: TouristDestination */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            name: area.name,
            description: area.description ?? `${area.name}の犬連れ散歩コース`,
            touristType: ["犬連れ", "ペット同伴"],
            containsPlace: routes.map((route) => ({
              "@type": "TouristTrip",
              name: route.name,
              description: route.description,
              url: `https://wanwalk.jp/routes/${route.slug}`,
            })),
          }),
        }}
      />
    </div>
  );
}
