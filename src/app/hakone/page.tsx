import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapTrifold, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getHakoneAreasWithRoutes } from "@/lib/walks/data";
import RouteCard from "@/components/walks/RouteCard";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import SupportedBadge from "@/components/walks/SupportedBadge";
import GoogleMapEmbed from "@/components/walks/GoogleMapEmbed";
import HakoneHubRefTracker from "@/components/walks/HakoneHubRefTracker";
import { buildOgMetadata } from "@/lib/walks/og-meta";

/**
 * 箱根 愛犬さんぽマップ（DMOバナー着地点・公開 indexable ハブ）。
 *
 * - group_key='hakone' の5サブエリア × 公開ルート18本を地理順に並べる「歩く」入口。
 * - 「立ち寄る」（犬連れスポット）は /hakone/dog-map の1枚に集約し相互リンク。
 * - 階層は増やさない（/hakone と /hakone/dog-map の2枚のみ。エリア詳細は既存 /areas/[slug]）。
 *
 * レンダリング: ISR（revalidate=86400）。プレス/バナーの流入スパイクを CDN で受ける。
 * ?ref= の着地計測はクライアントの HakoneHubRefTracker（useSearchParams）が担うため
 * force-dynamic にしない（CDN キャッシュ・SEO を維持）。
 */
export const revalidate = 86400;

// /hakone/dog-map は ?k= 秘密キー付きでのみ閲覧可（A6・CEOゲートで一般公開）。
// 一般公開までは素リンクが 404 になるため、相互リンクカードを env フラグで封じる。
// 公開時に Vercel env で NEXT_PUBLIC_HAKONE_DOGMAP_PUBLIC=true を立てる（コード変更不要）。
const HAKONE_DOGMAP_PUBLIC =
  process.env.NEXT_PUBLIC_HAKONE_DOGMAP_PUBLIC === "true";

function toOgImage(heroBase: string | null | undefined): string | undefined {
  if (!heroBase) return undefined; // buildOgMetadata が共通 fallback を使う
  return heroBase.includes("/render/image/")
    ? heroBase
    : heroBase.replace("/object/", "/render/image/") +
        "?width=1200&height=630&resize=cover&quality=80";
}

export async function generateMetadata(): Promise<Metadata> {
  const areas = await getHakoneAreasWithRoutes();
  const totalRoutes = areas.reduce((n, a) => n + a.routes.length, 0);
  const heroBase =
    areas.find((a) => a.area.slug === "hakone-ashinoko")?.area.hero_image_url ??
    areas[0]?.area.hero_image_url ??
    null;

  const title = `箱根 愛犬さんぽマップ｜犬連れで歩ける散歩コース${totalRoutes}本`;
  const description = `箱根（神奈川県）で愛犬と歩ける散歩コース${totalRoutes}本を、箱根湯本・宮ノ下・強羅・仙石原・芦ノ湖の5エリアからご紹介。各コースに駐車場・犬連れスポット・体験ストーリー付き。箱根町・箱根DMOと連携した公式版です。`;

  return {
    title,
    description,
    alternates: { canonical: "/hakone" },
    ...buildOgMetadata({
      title,
      description,
      path: "/hakone",
      ogImage: toOgImage(heroBase),
      ogImageAlt: "箱根 愛犬さんぽマップ - 犬と歩けるおすすめ散歩コース",
    }),
  };
}

export default async function HakoneHubPage() {
  const areasWithRoutes = await getHakoneAreasWithRoutes();
  const totalRoutes = areasWithRoutes.reduce((n, a) => n + a.routes.length, 0);
  const allRoutes = areasWithRoutes.flatMap((a) => a.routes);
  const heroImage =
    areasWithRoutes.find((a) => a.area.slug === "hakone-ashinoko")?.area
      .hero_image_url ??
    areasWithRoutes[0]?.area.hero_image_url ??
    null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* ?ref= 着地計測（バナー/QR・クライアント側で1回だけ送信） */}
      <HakoneHubRefTracker />

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
          箱根 愛犬さんぽマップ
        </span>
      </nav>

      {/* ヒーロー */}
      <header>
        <h1
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 1.35,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
            margin: "0 0 16px",
          }}
        >
          箱根 愛犬さんぽマップ
        </h1>
        <p
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: 16,
            lineHeight: 1.85,
            color: "var(--color-ww-text-secondary)",
            maxWidth: 760,
            margin: "0 0 24px",
          }}
        >
          箱根（神奈川県）で愛犬と歩ける散歩コースは
          <span className="ww-numeric">{totalRoutes}</span>本。
          箱根湯本・宮ノ下・強羅・仙石原・芦ノ湖の5エリアから、駐車場・犬連れスポット・体験ストーリー付きでご紹介します。
          箱根町・箱根DMOと連携した公式版です。
        </p>
      </header>

      {heroImage && (
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: "16 / 9",
            borderRadius: "var(--radius-ww-md)",
            backgroundColor: "var(--color-ww-bg-secondary)",
            marginBottom: 16,
          }}
        >
          <Image
            src={heroImage}
            alt="箱根 愛犬さんぽマップ"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
          />
        </div>
      )}

      {/* このハブは WanWalk 自体（既存ルートの一覧）＝「Supported by 箱根DMO」。
          DMO 主体の「公式」は犬連れ施設のエリアマップ（/hakone/dog-map）側に置く。 */}
      <SupportedBadge />

      {/* 箱根エリアマップ（C5: Google由来サムネと同一ページに Googleマップを同時表示） */}
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 28,
            fontWeight: 600,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
            marginBottom: 16,
          }}
        >
          箱根エリアマップ
        </h2>
        <GoogleMapEmbed
          query="箱根"
          title="箱根エリアの地図（Googleマップ）"
          zoom={11}
          height={360}
          caption="箱根5エリアの位置（地図：Googleマップ）"
        />
      </section>

      {/* 立ち寄りスポットへの相互導線（A6・?k 解除まで env フラグで非表示） */}
      {HAKONE_DOGMAP_PUBLIC && (
        <Link
          href="/hakone/dog-map"
          className="group flex items-center gap-4 transition-colors"
          style={{
            border: "1px solid var(--color-ww-border-subtle)",
            borderRadius: "var(--radius-ww-md)",
            padding: "20px 24px",
            marginBottom: 48,
            backgroundColor: "var(--color-ww-bg-secondary)",
            color: "var(--color-ww-text)",
          }}
        >
          <span
            className="inline-flex items-center justify-center shrink-0"
            style={{ width: 44, height: 44, color: "var(--color-ww-accent)" }}
          >
            <MapTrifold size={28} weight="regular" />
          </span>
          <span style={{ flex: 1 }}>
            <span
              className="ww-serif"
              style={{
                display: "block",
                fontFamily: "var(--font-ww-serif)",
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              箱根の犬連れスポットを地図で見る
            </span>
            <span
              style={{ fontSize: 13, color: "var(--color-ww-text-secondary)" }}
            >
              泊まる・食べる・遊ぶ・温泉。施設から歩けるルートも一緒にご案内します。
            </span>
          </span>
          <ArrowRight
            size={20}
            weight="regular"
            style={{ color: "var(--color-ww-accent)" }}
          />
        </Link>
      )}

      {/* エリア × コース（地理順・湯本→宮ノ下→強羅→仙石原→芦ノ湖） */}
      {areasWithRoutes.map(({ area, routes }, areaIndex) => (
        <section key={area.id} style={{ marginBottom: 48 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-ww-serif)",
                fontSize: 28,
                fontWeight: 600,
                color: "var(--color-ww-text)",
                letterSpacing: "0.01em",
                margin: 0,
              }}
            >
              {area.name}
              <span
                className="ww-numeric"
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: "var(--color-ww-text-tertiary)",
                  marginLeft: 12,
                }}
              >
                {routes.length}コース
              </span>
            </h2>
            <Link
              href={`/areas/${area.slug}`}
              className="shrink-0 inline-flex items-center gap-1"
              style={{
                fontSize: 13,
                color: "var(--color-ww-accent)",
                whiteSpace: "nowrap",
              }}
            >
              エリア詳細
              <ArrowRight size={14} weight="regular" />
            </Link>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
            {routes.map((route, routeIndex) => (
              <li key={route.id} className="ww-route-li">
                <RouteCard
                  route={{ ...route, areas: area }}
                  sourcePage="hakone_hub"
                  placement="hakone_hub_route"
                  priority={areaIndex === 0 && routeIndex === 0 && !heroImage}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* アプリ訴求（箱根ハブ起点の DL を placement で区別。既存 walks_app_cta 命名に合わせ _cta） */}
      <WalksAppCTA sourcePage="hakone_hub" placement="hakone_hub_cta" />

      {/* 構造化データ: TouristDestination（5エリアの公開ルートを TouristTrip で内包） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            name: "箱根 愛犬さんぽマップ",
            description: `箱根で愛犬と歩ける散歩コース${totalRoutes}本（箱根湯本・宮ノ下・強羅・仙石原・芦ノ湖）。`,
            touristType: ["犬連れ", "ペット同伴"],
            url: "https://wanwalk.jp/hakone",
            containsPlace: allRoutes.map((route) => ({
              "@type": "TouristTrip",
              name: route.name,
              description: route.description,
              url: `https://wanwalk.jp/routes/${route.slug}`,
            })),
          }),
        }}
      />

      {/* 構造化データ: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "トップ",
                item: "https://wanwalk.jp",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "箱根 愛犬さんぽマップ",
                item: "https://wanwalk.jp/hakone",
              },
            ],
          }),
        }}
      />
    </div>
  );
}
