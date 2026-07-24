import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAreas, getAreaBySlug, getRoutesByAreaId } from "@/lib/walks/data";
import SeasonFilterControls from "@/components/walks/SeasonFilterControls";
import RouteCard from "@/components/walks/RouteCard";
import {
  filterRoutes,
  parseSeasonParam,
  parseCartParam,
} from "@/lib/walks/filter-routes";
import SupportedBadge from "@/components/walks/SupportedBadge";
import ShareMenu from "@/components/walks/ShareMenu";
import TrustByline from "@/components/walks/TrustByline";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import WalkInAppCTA from "@/components/walks/WalkInAppCTA";
import { buildOgMetadata } from "@/lib/walks/og-meta";
import { formatDistance } from "@/lib/walks/format";
import {
  ORG_REF,
  webPageSchema,
  breadcrumbSchema,
} from "@/lib/walks/structured-data";
import Link from "next/link";

// ISR: 24時間ごとに再検証（Vercel無料枠ISR Writes対策）
export const revalidate = 86400;

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

  const routes = await getRoutesByAreaId(area.id);
  const routeCount = routes.length;

  const ogImageBase =
    area.hero_image_url ??
    "https://jkpenklhrlbctebkpvax.supabase.co/storage/v1/object/public/route-photos/yamanakako-lakeside/refetch_20260422/01.jpg";
  const ogImageUrl = ogImageBase.includes("/render/image/")
    ? ogImageBase
    : ogImageBase.replace("/object/", "/render/image/") +
      "?width=1200&height=630&resize=cover&quality=80";

  const title = `${area.name}の犬連れ散歩コース${routeCount}本｜駐車場・カフェ情報つき`;
  // area.description は運転経路文（御殿場IC→国道…）を含み 116 全角に達するケースがあるため、
  // meta description は冒頭 70 文字に丸めて Google スニペット表示超過を防ぐ。
  const descPrefix = `${area.name}（${area.prefecture}）の犬連れ散歩コースを紹介。`;
  const descBody = (area.description ?? "").slice(0, 70);
  const description = `${descPrefix}${descBody}${descBody.length >= 70 ? "…" : ""}`;

  return {
    title,
    description,
    alternates: { canonical: `/areas/${slug}` },
    ...buildOgMetadata({
      title,
      description: `${area.name}（${area.prefecture}）の犬連れ散歩コースを紹介。`,
      path: `/areas/${slug}`,
      ogImage: ogImageUrl,
      ogImageAlt: `${area.name} - 犬と歩けるおすすめ散歩コース`,
    }),
  };
}

export default async function AreaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string; cart?: string }>;
}) {
  const { slug } = await params;
  const { season: rawSeason, cart: rawCart } = await searchParams;
  const season = parseSeasonParam(rawSeason);
  const cartOnly = parseCartParam(rawCart);

  const area = await getAreaBySlug(slug);
  if (!area) notFound();

  const routes = await getRoutesByAreaId(area.id);
  const filteredRoutes = filterRoutes(routes, season, cartOnly);

  // 可視FAQ＋JSON-LD FAQPage の共通ソース。area.faq（手書き）があれば優先し、
  // 無いエリアは routes から自動生成にフォールバックする（全エリアで可視FAQが出る）。
  const faqItems: { q: string; a: string }[] =
    area.faq && area.faq.length > 0
      ? area.faq
      : routes.length > 0
        ? [
            {
              q: `${area.name}で犬と散歩できる場所はありますか？`,
              a: `はい、${area.name}には${routes.length}本の犬連れ散歩コースがあります。${routes
                .slice(0, 3)
                .map((r) => `「${r.name}」`)
                .join("・")}など、愛犬と楽しめるルートを紹介しています。`,
            },
            {
              q: `${area.name}の犬連れおすすめルートは？`,
              a: `${area.name}のおすすめは${
                routes[0]
                  ? `「${routes[0].name}」（距離${formatDistance(routes[0].distance_meters)}・所要${routes[0].estimated_minutes}分）`
                  : ""
              }です。すべてのルートに駐車場情報・犬連れスポット・体験ストーリーが完備されています。`,
            },
          ]
        : [];

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
        <Link href="/areas" style={{ color: "inherit" }}>エリア一覧</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--color-ww-text-secondary)" }}>{area.name}</span>
      </nav>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 8,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 32,
            fontWeight: 700,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
            lineHeight: 1.35,
            margin: 0,
            flex: 1,
          }}
        >
          {area.name}で犬と歩けるおすすめ散歩コース
        </h1>
        <ShareMenu
          url={`https://wanwalk.jp/areas/${slug}`}
          text={`${area.name}（${area.prefecture}）で犬と歩けるおすすめ散歩ルート`}
          title={`${area.name} | WanWalk`}
          size="sm"
        />
      </div>
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

      <div style={{ marginBottom: 24 }}>
        <TrustByline scopeNote="このエリアの犬連れ散歩コースを、駐車場や犬同伴ルールまで確認して掲載しています。" />
      </div>

      <WalkInAppCTA
        sourcePage="area_detail"
        placement="area_detail_walk"
        title="このエリアの散歩をアプリで歩く"
        subcopy="GPSで現在地を確認しながら、愛犬との散歩を記録できます。"
      />

      {routes.length > 0 ? (
        <div style={{ marginBottom: 48 }}>
          <SeasonFilterControls
            activeSeason={season}
            cartOnly={cartOnly}
            filteredCount={filteredRoutes.length}
            basePath={`/areas/${slug}`}
            sourcePage="area_detail"
            areaSlug={area.slug}
          />
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
            {filteredRoutes.map((route, index) => (
              <li key={route.id} className="ww-route-li">
                <RouteCard
                  route={route}
                  sourcePage="area_detail"
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

      {/* 可視FAQ（JSON-LD FAQPage と同一ソース） */}
      {faqItems.length > 0 && (
        <section
          aria-labelledby="area-faq-heading"
          style={{ marginBottom: 48, maxWidth: 768 }}
        >
          <h2
            id="area-faq-heading"
            className="ww-serif"
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 24,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              letterSpacing: "0.01em",
              marginBottom: 16,
            }}
          >
            {area.name}の犬連れ散歩 よくある質問
          </h2>
          {faqItems.map((item, i) => (
            <div
              key={i}
              style={{
                borderTop: "1px solid var(--color-ww-border-subtle)",
                padding: "20px 0",
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--color-ww-text)",
                  margin: "0 0 8px",
                }}
              >
                {item.q}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "var(--color-ww-text-secondary)",
                  margin: 0,
                }}
              >
                {item.a}
              </p>
            </div>
          ))}
        </section>
      )}

      <WalksAppCTA sourcePage="area_detail" />

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
            author: ORG_REF,
            publisher: ORG_REF,
            containsPlace: routes.map((route) => ({
              "@type": "TouristTrip",
              name: route.name,
              description: route.description,
              url: `https://wanwalk.jp/routes/${route.slug}`,
            })),
          }),
        }}
      />

      {/* FAQ構造化データ（GEO/AIO最適化）。可視FAQ（faqItems）と同一ソースで内容一致を保証 */}
      {faqItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.a,
                },
              })),
            }),
          }}
        />
      )}

      {/* WebPage（発行者 author/publisher） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webPageSchema({
              path: `/areas/${area.slug}`,
              name: `${area.name}の犬連れ散歩コース`,
              description: area.description,
              primaryImage: area.hero_image_url ?? null,
            })
          ),
        }}
      />

      {/* パンくず構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "トップ", path: "/" },
              { name: "エリア一覧", path: "/areas" },
              { name: area.name, path: `/areas/${area.slug}` },
            ])
          ),
        }}
      />
    </div>
  );
}
