import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getAllPublishedRoutes,
  getRouteBySlug,
  getRouteSpots,
  getRouteLineCoordinates,
  getRoutePinsWithPhotos,
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

// ISR: 30分ごとに再検証
export const revalidate = 1800;

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

  const distanceKm = (route.distance_meters / 1000).toFixed(1);
  const description =
    route.meta_description ??
    `${route.areas.name}の犬連れ散歩コース「${route.name}」。距離${distanceKm}km、所要${route.estimated_minutes}分。${route.description?.slice(0, 80) ?? ""}`;

  return {
    title: `${route.name} - ${route.areas.name}の犬連れ散歩コース`,
    description,
    alternates: {
      canonical: `/routes/${slug}`,
    },
    openGraph: {
      title: `${route.name} - ${route.areas.name}の犬連れ散歩コース`,
      description,
      images: [
        {
          url: `/api/og/${slug}`,
          width: 1200,
          height: 630,
          alt: `${route.name} - ${route.areas.name}`,
        },
      ],
    },
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

  const [spots, coordinates, pins] = await Promise.all([
    getRouteSpots(route.id),
    getRouteLineCoordinates(route.id),
    getRoutePinsWithPhotos(route.id),
  ]);

  const distanceKm = (route.distance_meters / 1000).toFixed(1);
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
        <Link href="/" style={{ color: "inherit" }}>散歩コース</Link>
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
            aspectRatio: "16 / 9",
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
          distanceKm={distanceKm}
          minutes={route.estimated_minutes}
          elevationGain={elevationGain}
          difficulty={route.difficulty_level}
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
        「{route.name}」は、{route.areas.name}にある距離{distanceKm}km・所要約{route.estimated_minutes}分の犬連れ散歩コースです。
        {difficultyLabels[route.difficulty_level]}コースで、
        {route.cart_friendly ? "カート走行可。" : ""}
        {petInfo?.parking ? `駐車場: ${petInfo.parking}。` : ""}
        {spots.length > 0 ? `コース上に${spots.length}件の犬連れスポットがあります。` : ""}
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
        />
      </section>

      {/* コースガイド（番号付きタイムライン） */}
      {spots.length > 0 && (
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
          <RouteTimeline spots={spots} />
        </section>
      )}

      {/* おすすめスポット（spots + pins 統合） */}
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
          おすすめスポット
        </h2>
        <FeaturedSpots spots={spots} pins={pins} />
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
      <RouteFeedback routeId={route.id} />

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
            "@type": "TouristTrip",
            name: route.name,
            description: route.description,
            touristType: ["犬連れ", "ペット同伴"],
            additionalType: "DogFriendlyRoute",
            image: route.thumbnail_url ?? undefined,
            geo: route.start_lat && route.start_lng
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
        }}
      />

      {/* FAQ構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `${route.name}は犬連れで散歩できますか？`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `はい、${route.name}は犬連れで散歩できるルートです。距離${distanceKm}km、所要約${route.estimated_minutes}分のコースです。${petInfo?.surface ? `路面は${petInfo.surface}です。` : ""}${petInfo?.others ?? "リード着用でお楽しみいただけます。"}`,
                },
              },
              {
                "@type": "Question",
                name: `${route.name}に駐車場はありますか？`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: petInfo?.parking ?? "詳細は現地でご確認ください。",
                },
              },
              {
                "@type": "Question",
                name: `${route.name}にトイレはありますか？`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: petInfo?.restroom ?? "詳細は現地でご確認ください。",
                },
              },
            ],
          }),
        }}
      />
    </article>
  );
}

