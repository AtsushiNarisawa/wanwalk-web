import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getAllPublishedRoutes,
  getRouteBySlug,
  getRouteSpots,
  getRouteLineCoordinates,
  getRouteAreaInfo,
} from "@/lib/walks/data";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import SupportedBadge from "@/components/walks/SupportedBadge";
import RouteFeedback from "@/components/walks/RouteFeedback";
import RouteMapWrapper from "@/components/walks/RouteMapWrapper";
import SpecBar from "@/components/walks/SpecBar";
import PetInfoGrid from "@/components/walks/PetInfoGrid";
import RouteActions from "@/components/walks/RouteActions";
import RouteTimeline from "@/components/walks/RouteTimeline";
import FeaturedSpots from "@/components/walks/FeaturedSpots";
import RelatedRoutes from "@/components/walks/RelatedRoutes";
import { buildOgMetadata } from "@/lib/walks/og-meta";
import { formatDistance } from "@/lib/walks/format";

// ISR: 24時間ごとに再検証（Vercel無料枠ISR Writes対策）
export const revalidate = 86400;

type FaqEntry = { "@type": "Question"; name: string; acceptedAnswer: { "@type": "Answer"; text: string } };

function buildRouteFaq(
  route: import("@/types/walks").RouteWithArea,
  spots: import("@/types/walks").RouteSpot[],
  distanceLabel: string,
  isArea: boolean
): FaqEntry[] {
  const petInfo = route.pet_info;
  const requiredSpots = spots.filter((s) => !s.is_optional);
  // インフラ系（駐車場・トイレ・給水・ランドマーク）は pet_friendly=false でも実害なし（教訓 B-Z+β）→ NG列挙から除外
  const INFRA_CATEGORIES = new Set(["parking", "restroom", "water_station", "landmark"]);
  const visitableSpots = requiredSpots.filter((s) => !INFRA_CATEGORIES.has(s.category ?? ""));
  const okCount = visitableSpots.filter((s) => s.pet_friendly === true).length;
  const ngSpots = visitableSpots.filter((s) => s.pet_friendly === false);
  const ngNames = ngSpots.slice(0, 2).map((s) => s.name);

  // Q1: 犬連れ可否（pet_friendly比率で動的）
  const sizeLabel = isArea
    ? `滞在目安は約${route.estimated_minutes}分の園内散策コース`
    : `距離${distanceLabel}・所要約${route.estimated_minutes}分のコース`;
  let q1Answer: string;
  if (visitableSpots.length === 0) {
    q1Answer = `はい、${route.name}は犬連れで散歩できる${isArea ? "施設" : "ルート"}です。${sizeLabel}です。リード着用でお楽しみください。`;
  } else if (ngSpots.length === 0) {
    q1Answer = `はい、${route.name}は犬連れで楽しめます。${sizeLabel}で、コース上の見どころスポット${visitableSpots.length}箇所すべてが犬連れOKです。リード着用でお楽しみください。`;
  } else if (ngSpots.length < visitableSpots.length / 2) {
    q1Answer = `はい、${route.name}の散歩自体は犬連れOKです。${sizeLabel}で、${okCount}箇所のスポットを愛犬と楽しめます。ただし${ngNames.join("・")}は内部・境内が犬同伴不可のため、外観・門前からの拝観でお楽しみください。`;
  } else {
    q1Answer = `${route.name}のコース散歩自体は犬連れで歩けます（${sizeLabel}）。ただし${ngNames.join("・")}など内部・境内が犬同伴不可のスポットがあります。門前・参道・外観からの散策をお楽しみください。`;
  }

  // Q2: 駐車場
  const parkingSpots = spots
    .filter((s) => s.category === "parking")
    .map((s) => s.name)
    .filter((n, i, arr) => arr.indexOf(n) === i);
  let q2Answer: string;
  if (petInfo?.parking) {
    const supplement = parkingSpots.length > 0 ? `（コース上の駐車場目印: ${parkingSpots.slice(0, 2).join("・")}）` : "";
    q2Answer = `${petInfo.parking}。${supplement}`.trim();
  } else if (parkingSpots.length > 0) {
    q2Answer = `コース上の駐車場目印: ${parkingSpots.slice(0, 2).join("・")}。詳細は現地でご確認ください。`;
  } else {
    q2Answer = "公式の駐車場情報は登録されていません。最寄りの有料駐車場をご利用ください。";
  }

  // Q3: ベストシーズン（DB値をそのまま使用・CEO監修済）
  const q3Answer = petInfo?.best_season
    ? `${route.name}のベストシーズンは、${petInfo.best_season}です。`
    : `${route.name}は通年で犬連れ散歩を楽しめます。`;

  // Q4: カート走行可否（cart_notes 冒頭の結論語と前置きの重複を避ける + 末尾に句点を補う）
  const cartNotes = route.cart_notes?.trim() ?? "";
  const cleanedCartNotes = cartNotes.replace(/^カート(非推奨|推奨)。?\s*/, "").trim();
  const ensurePunct = (s: string) => (s && !/[。．\.!?！？、]$/.test(s) ? `${s}。` : s);
  const cartTail = ensurePunct(cartNotes) || "舗装メインで走行可能です。";
  const cleanedCartTail = ensurePunct(cleanedCartNotes) || "段差や未舗装区間が多いため、";
  const q4Answer = route.cart_friendly
    ? `はい、${route.name}はベビーカーやペットカートで散歩できます。${cartTail}`
    : `${route.name}はベビーカー・ペットカートでの散歩には向きません。${cleanedCartTail}抱っこ移動やキャリーバッグをご検討ください。`;

  // Q5: 犬連れOKカフェ・レストラン（0件なら省略）
  const dogOkCafes = spots.filter(
    (s) => (s.category === "cafe" || s.category === "restaurant") && s.pet_friendly === true
  );
  const faqs: FaqEntry[] = [
    { "@type": "Question", name: `${route.name}は犬連れで散歩できますか？`, acceptedAnswer: { "@type": "Answer", text: q1Answer } },
    { "@type": "Question", name: `${route.name}に駐車場はありますか？`, acceptedAnswer: { "@type": "Answer", text: q2Answer } },
    { "@type": "Question", name: `${route.name}のベストシーズンはいつですか？`, acceptedAnswer: { "@type": "Answer", text: q3Answer } },
    { "@type": "Question", name: `${route.name}はベビーカーやペットカートで歩けますか？`, acceptedAnswer: { "@type": "Answer", text: q4Answer } },
  ];

  if (dogOkCafes.length > 0) {
    const terraceOnly = dogOkCafes.every((s) => s.dog_policy?.indoor === false && s.dog_policy?.terrace === true);
    const indoorOk = dogOkCafes.some((s) => s.dog_policy?.indoor === true);
    const styleNote = terraceOnly
      ? "テラス席のみペット同伴可"
      : indoorOk
        ? "店内・テラスとも犬同伴OKの店舗あり"
        : "ペット同伴可（席種は店舗により異なる）";
    const sample = dogOkCafes[0].name;
    const countText = dogOkCafes.length === 1 ? `1店` : `${dogOkCafes.length}店`;
    const q5Answer = `はい、${route.name}沿いには犬連れOKのカフェ・飲食スポットが${countText}あります（例: ${sample}）。${styleNote}。最新の同伴ルールは各店舗に直接ご確認ください。`;
    faqs.push({
      "@type": "Question",
      name: `${route.name}沿いに犬連れで入れるカフェ・レストランはありますか？`,
      acceptedAnswer: { "@type": "Answer", text: q5Answer },
    });
  }

  return faqs;
}

export async function generateStaticParams() {
  try {
    const routes = await getAllPublishedRoutes();
    return routes.filter((r) => r.slug && typeof r.slug === "string").map((r) => ({ slug: r.slug }));
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
  const route = await getRouteBySlug(slug);
  if (!route) return {};

  const isArea = route.route_type === "area";
  const distanceLabel = formatDistance(route.distance_meters);
  const description =
    route.meta_description ??
    (isArea
      ? `${route.areas.name}の犬連れ散策コース「${route.name}」。園内散策、滞在目安${route.estimated_minutes}分。${route.description?.slice(0, 80) ?? ""}`
      : `${route.areas.name}の犬連れ散歩コース「${route.name}」。距離${distanceLabel}、所要${route.estimated_minutes}分。${route.description?.slice(0, 80) ?? ""}`);

  const sizeHint = isArea
    ? `${route.estimated_minutes}分散策`
    : `${distanceLabel}・${route.estimated_minutes}分`;
  // GSC 末尾切れ対策: route.name が「本体 説明」形式のルートで title が SERP の表示幅を超える場合、
  // 説明部分を省略する。slug ごとに明示指定（一律閾値だと「河口湖 もみじ回廊…」等が「河口湖」だけになり致命的）。
  const TITLE_SHORTEN_SLUGS = new Set<string>(["odawara-castle-saigoji"]);
  const displayName = TITLE_SHORTEN_SLUGS.has(slug)
    ? route.name.split(" ")[0]
    : route.name;
  const title = `${displayName}｜${route.areas.name} 犬連れ散歩 ${sizeHint}`;
  const ogImage = `https://wanwalk.jp/api/og/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/routes/${slug}` },
    ...buildOgMetadata({
      title,
      description,
      path: `/routes/${slug}`,
      ogImage,
      ogImageAlt: `${route.name} - ${route.areas.name}`,
    }),
  };
}

const difficultyLabels = { easy: "初級", moderate: "中級", hard: "上級" };
const levelDotColors = {
  easy: "var(--color-ww-level-easy)",
  moderate: "var(--color-ww-level-moderate)",
  hard: "var(--color-ww-level-hard)",
};

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) notFound();

  const [spots, coordinates, areaInfo] = await Promise.all([
    getRouteSpots(route.id),
    getRouteLineCoordinates(route.id),
    getRouteAreaInfo(route.id),
  ]);

  const isArea = route.route_type === "area";
  const distanceLabel = formatDistance(route.distance_meters);
  const petInfo = route.pet_info;
  const elevationGainFromPet = petInfo?.elevation_gain
    ? Number(String(petInfo.elevation_gain).replace(/[^0-9.-]/g, "")) || null
    : null;
  const elevationGain = route.elevation_gain_meters ?? elevationGainFromPet;

  return (
    <article
      className="mx-auto"
      style={{ maxWidth: 896, padding: "32px 16px" }}
    >
      {/* パンくず */}
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
        <Link
          href={`/areas/${route.areas.slug}`}
          style={{ color: "inherit" }}
        >
          {route.areas.name}
        </Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--color-ww-text-secondary)" }}>
          {route.name}
        </span>
      </nav>

      {/* ヒーロー画像 */}
      {route.thumbnail_url && (
        <div
          className="relative overflow-hidden mb-8"
          style={{
            aspectRatio: "4 / 3",
            borderRadius: "var(--radius-ww-sm)",
            backgroundColor: "var(--color-ww-bg-secondary)",
          }}
        >
          <Image
            src={route.thumbnail_url}
            alt={route.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      )}

      {/* タイトル・エリア */}
      <header>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-ww-sans)",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-ww-text-secondary)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "9999px",
                backgroundColor: levelDotColors[route.difficulty_level],
                display: "inline-block",
              }}
            />
            {difficultyLabels[route.difficulty_level]}
          </span>
          <Link
            href={`/areas/${route.areas.slug}`}
            style={{
              fontSize: 13,
              color: "var(--color-ww-text-secondary)",
            }}
          >
            {route.areas.name}
          </Link>
          </div>
          <RouteActions
            routeId={route.id}
            routeSlug={route.slug}
            routeName={route.name}
            areaName={route.areas.name}
          />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 1.35,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
          }}
        >
          {route.name}
        </h1>

        {/* 施策③: 4点スペックバー */}
        <SpecBar
          distanceLabel={distanceLabel}
          minutes={route.estimated_minutes}
          elevationGain={elevationGain}
          difficulty={route.difficulty_level}
          isArea={isArea}
        />
      </header>

      {/* 直接回答型冒頭文（AI Overview / GEO最適化） */}
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.8,
          color: "var(--color-ww-text-secondary)",
          marginBottom: 32,
          padding: "16px 20px",
          backgroundColor: "var(--color-ww-bg-secondary)",
          borderRadius: "var(--radius-ww-md)",
        }}
      >
        {isArea ? (
          <>
            「{route.name}」は、{route.areas.name}にある園内散策コースです。
            滞在目安は約{route.estimated_minutes}分、
            {difficultyLabels[route.difficulty_level]}コースで、
            {route.cart_friendly ? "カート走行可。" : ""}
            {petInfo?.parking ? `駐車場: ${petInfo.parking}。` : ""}
            {spots.length > 0 ? `園内に${spots.length}件の見どころがあります。` : ""}
          </>
        ) : (
          <>
            「{route.name}」は、{route.areas.name}にある距離{distanceLabel}・所要約{route.estimated_minutes}分の犬連れ散歩コースです。
            {difficultyLabels[route.difficulty_level]}コースで、
            {route.cart_friendly ? "カート走行可。" : ""}
            {petInfo?.parking ? `駐車場: ${petInfo.parking}。` : ""}
            {spots.length > 0 ? `コース上に${spots.length}件の犬連れスポットがあります。` : ""}
          </>
        )}
      </p>

      {/* 体験ストーリー */}
      {route.description && (
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 28,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              letterSpacing: "0.01em",
              marginBottom: 20,
            }}
          >
            このコースの体験
          </h2>
          <p
            style={{
              fontFamily: "var(--font-ww-sans)",
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.85,
              color: "var(--color-ww-text)",
              whiteSpace: "pre-line",
            }}
          >
            {route.description}
          </p>
        </section>
      )}

      {/* ルートマップ */}
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 28,
            fontWeight: 600,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
            marginBottom: 20,
          }}
        >
          ルートマップ
        </h2>
        <RouteMapWrapper
          coordinates={coordinates}
          startLat={route.start_lat}
          startLng={route.start_lng}
          routeName={route.name}
          spots={spots}
          routeType={route.route_type}
          areaPolygon={areaInfo?.area_polygon ?? null}
          areaCenterLat={areaInfo?.area_center_lat ?? null}
          areaCenterLng={areaInfo?.area_center_lng ?? null}
          areaRadiusM={areaInfo?.area_radius_m ?? null}
        />
      </section>

      {/* コースガイド（line型のみ。area型は順序がないため見どころ1本に統合） */}
      {!isArea && spots.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 28,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              letterSpacing: "0.01em",
              marginBottom: 24,
            }}
          >
            コースガイド
          </h2>
          <RouteTimeline spots={spots} isArea={false} routeSlug={route.slug} />
        </section>
      )}

      {/* おすすめスポット（line型）/ 見どころ（area型） */}
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 28,
            fontWeight: 600,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
            marginBottom: 24,
          }}
        >
          {isArea ? "見どころ" : "おすすめスポット"}
        </h2>
        <FeaturedSpots spots={spots} routeSlug={route.slug} />
      </section>

      {/* 犬連れメモ（施策④ アイコングリッド） */}
      {petInfo && (
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 28,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              letterSpacing: "0.01em",
              marginBottom: 20,
            }}
          >
            犬連れメモ
          </h2>
          <PetInfoGrid petInfo={petInfo} />
        </section>
      )}

      {/* コミュニティノート + フィードバック */}
      <RouteFeedback routeId={route.id} routeSlug={route.slug} />

      {/* ギャラリー */}
      {route.gallery_images && route.gallery_images.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 28,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              letterSpacing: "0.01em",
              marginBottom: 20,
            }}
          >
            ギャラリー
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            {route.gallery_images.map((img, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: "1 / 1",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "var(--radius-ww-sm)",
                  backgroundColor: "var(--color-ww-bg-secondary)",
                }}
              >
                <Image
                  src={img}
                  alt={`${route.name} の写真 ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 関連ルート（Phase 2-B Step 5-B・直帰率改善 41%→35% 目標） */}
      <RelatedRoutes currentRoute={route} />

      {/* CTA */}
      <div style={{ marginTop: 48 }}>
        <WalksAppCTA />
      </div>
      <SupportedBadge />

      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": isArea ? "TouristAttraction" : "TouristTrip",
            name: route.name,
            description: route.description,
            touristType: ["犬連れ", "ペット同伴"],
            additionalType: isArea ? "DogFriendlyArea" : "DogFriendlyRoute",
            image: route.thumbnail_url ?? undefined,
            // area型は施設中心座標、line型は出発地点
            geo:
              isArea && areaInfo?.area_center_lat != null && areaInfo?.area_center_lng != null
                ? {
                    "@type": "GeoCoordinates",
                    latitude: areaInfo.area_center_lat,
                    longitude: areaInfo.area_center_lng,
                  }
                : route.start_lat && route.start_lng
                  ? {
                      "@type": "GeoCoordinates",
                      latitude: route.start_lat,
                      longitude: route.start_lng,
                    }
                  : undefined,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "JPY",
              availability: "https://schema.org/InStock",
            },
            // area型: 順序なし見どころList / line型: 番号付きitinerary
            ...(isArea
              ? {
                  amenityFeature: spots
                    .filter((s) => s.lat != null && s.lng != null)
                    .map((spot) => ({
                      "@type": "LocationFeatureSpecification",
                      name: spot.name,
                      value: spot.description ?? undefined,
                    })),
                }
              : {
                  itinerary: {
                    "@type": "ItemList",
                    itemListElement: spots.map((spot, i) => ({
                      "@type": "ListItem",
                      position: i + 1,
                      name: spot.name,
                      description: spot.description,
                      ...(spot.lat && spot.lng
                        ? {
                            item: {
                              "@type": "Place",
                              name: spot.name,
                              geo: {
                                "@type": "GeoCoordinates",
                                latitude: spot.lat,
                                longitude: spot.lng,
                              },
                            },
                          }
                        : {}),
                    })),
                  },
                }),
          }),
        }}
      />

      {/* FAQ構造化データ（ルート固有・動的生成） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: buildRouteFaq(route, spots, distanceLabel, isArea),
          }),
        }}
      />
    </article>
  );
}

