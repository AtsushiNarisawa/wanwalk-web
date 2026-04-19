import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
  MapPin,
  Path,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { getAllSpotSlugs, getSpotBySlug } from "@/lib/walks/data";
import type { SpotCategory, DogPolicy } from "@/types/walks";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import SupportedBadge from "@/components/walks/SupportedBadge";

export const revalidate = 1800;

const CATEGORY_CONFIG: Record<SpotCategory, { icon: Icon; label: string }> = {
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

const SIZE_LABELS: Record<string, string> = {
  all: "全犬種OK",
  small_medium: "中型犬以下",
  small_only: "小型犬のみ",
};

export async function generateStaticParams() {
  try {
    const slugs = await getAllSpotSlugs();
    return slugs.map((slug) => ({ slug }));
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
  const spot = await getSpotBySlug(slug);
  if (!spot) return {};

  const cat = spot.category
    ? CATEGORY_CONFIG[spot.category as SpotCategory]?.label
    : "";
  const dogFriendly = spot.pet_friendly ? "犬連れOK" : "";
  const desc = `${spot.area_name}の${cat}「${spot.name}」。${dogFriendly}${spot.description?.slice(0, 80) ?? ""}`;

  return {
    title: `${spot.name} - ${spot.area_name}の犬連れスポット`,
    description: desc,
    openGraph: {
      title: `${spot.name} - ${spot.area_name}の犬連れスポット`,
      description: desc,
      images: spot.photo_url ? [spot.photo_url] : undefined,
    },
  };
}

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);
  if (!spot) notFound();

  const catConfig = spot.category
    ? CATEGORY_CONFIG[spot.category as SpotCategory]
    : null;
  const CatIcon = catConfig?.icon;
  const policy = spot.dog_policy as DogPolicy | null;

  // FAQ items for structured data
  const faqItems: { q: string; a: string }[] = [];
  if (spot.pet_friendly) {
    faqItems.push({
      q: `${spot.name}は犬連れで入れますか？`,
      a: policy
        ? `はい、${spot.name}は犬連れで利用できます。${policy.size ? `対象: ${SIZE_LABELS[policy.size] ?? policy.size}。` : ""}${policy.terrace ? "テラス席あり。" : ""}${policy.leash_required ? "リード必須。" : ""}${policy.notes ?? ""}`
        : `はい、${spot.name}は犬連れで利用可能です。詳しい条件は現地でご確認ください。`,
    });
    if (policy?.size === "all") {
      faqItems.push({
        q: `${spot.name}は大型犬も利用できますか？`,
        a: `はい、${spot.name}は全犬種に対応しています。`,
      });
    }
    if (policy?.terrace) {
      faqItems.push({
        q: `${spot.name}にテラス席はありますか？`,
        a: `はい、${spot.name}にはテラス席があり、愛犬と一緒に利用できます。`,
      });
    }
  }

  return (
    <>
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
          <Link href="/" style={{ color: "inherit" }}>
            トップ
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/spots" style={{ color: "inherit" }}>
            スポット一覧
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link
            href={`/areas/${spot.area_slug}`}
            style={{ color: "inherit" }}
          >
            {spot.area_name}
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--color-ww-text-secondary)" }}>
            {spot.name}
          </span>
        </nav>

        {/* 写真 */}
        {spot.photo_url && (
          <div
            className="relative overflow-hidden mb-8"
            style={{
              aspectRatio: "16 / 9",
              borderRadius: "var(--radius-ww-sm)",
              backgroundColor: "var(--color-ww-bg-secondary)",
            }}
          >
            <Image
              src={spot.photo_url}
              alt={spot.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        {/* カテゴリバッジ + タイトル */}
        <header style={{ marginBottom: 32 }}>
          {catConfig && CatIcon && (
            <div
              className="inline-flex items-center gap-2 mb-4"
              style={{
                fontSize: 13,
                color: "var(--color-ww-accent)",
                backgroundColor: "var(--color-ww-accent-soft)",
                padding: "6px 14px",
                borderRadius: "var(--radius-ww-sm)",
                fontWeight: 500,
              }}
            >
              <CatIcon size={16} weight="regular" />
              {catConfig.label}
            </div>
          )}

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
            {spot.name}
          </h1>

          <div
            className="flex items-center gap-3 flex-wrap"
            style={{ fontSize: 14, color: "var(--color-ww-text-secondary)" }}
          >
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} weight="regular" />
              <Link
                href={`/areas/${spot.area_slug}`}
                style={{ color: "inherit" }}
              >
                {spot.area_name}
              </Link>
            </span>
            {spot.pet_friendly && (
              <span
                className="inline-flex items-center gap-1"
                style={{
                  color: "var(--color-ww-accent)",
                  fontWeight: 500,
                }}
              >
                <CheckCircle size={14} weight="fill" />
                犬連れOK
              </span>
            )}
          </div>
        </header>

        {/* 説明文 */}
        {spot.description && (
          <section style={{ marginBottom: 32 }}>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: "var(--color-ww-text)",
              }}
            >
              {spot.description}
            </p>
          </section>
        )}

        {/* 犬連れ情報 */}
        {policy && (
          <section
            style={{
              marginBottom: 32,
              padding: 24,
              backgroundColor: "var(--color-ww-bg-tertiary)",
              borderRadius: "var(--radius-ww-md)",
            }}
          >
            <h2
              className="ww-serif"
              style={{
                fontFamily: "var(--font-ww-serif)",
                fontSize: 18,
                fontWeight: 600,
                color: "var(--color-ww-text)",
                marginBottom: 16,
              }}
            >
              犬連れ情報
            </h2>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              style={{ fontSize: 14 }}
            >
              {policy.size && (
                <InfoRow
                  label="対象犬種"
                  value={SIZE_LABELS[policy.size] ?? policy.size}
                />
              )}
              {policy.indoor !== undefined && (
                <InfoRow
                  label="店内"
                  value={policy.indoor ? "同伴可" : "不可"}
                  ok={policy.indoor}
                />
              )}
              {policy.terrace !== undefined && (
                <InfoRow
                  label="テラス席"
                  value={policy.terrace ? "あり" : "なし"}
                  ok={policy.terrace}
                />
              )}
              {policy.leash_required !== undefined && (
                <InfoRow
                  label="リード"
                  value={policy.leash_required ? "必須" : "不要"}
                />
              )}
              {policy.carrier_required !== undefined && (
                <InfoRow
                  label="キャリー"
                  value={policy.carrier_required ? "必須" : "不要"}
                />
              )}
              {policy.dog_fee && (
                <InfoRow label="犬料金" value={policy.dog_fee} />
              )}
              {policy.notes && (
                <div
                  className="sm:col-span-2"
                  style={{ color: "var(--color-ww-text-secondary)" }}
                >
                  {policy.notes}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 基本情報 */}
        <section style={{ marginBottom: 32 }}>
          <h2
            className="ww-serif"
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 18,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              marginBottom: 16,
            }}
          >
            基本情報
          </h2>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            style={{ fontSize: 14 }}
          >
            {spot.opening_hours && (
              <InfoRow label="営業時間" value={spot.opening_hours} />
            )}
            {spot.phone && <InfoRow label="電話" value={spot.phone} />}
            {spot.price_range && (
              <InfoRow label="価格帯" value={spot.price_range} />
            )}
            {spot.website_url && (
              <div className="flex items-start gap-2">
                <span
                  style={{
                    color: "var(--color-ww-text-secondary)",
                    minWidth: 80,
                  }}
                >
                  公式サイト
                </span>
                <a
                  href={spot.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-ww-accent)" }}
                >
                  公式サイトを見る
                </a>
              </div>
            )}
          </div>
        </section>

        {/* このスポットを通るルート */}
        <section style={{ marginBottom: 32 }}>
          <h2
            className="ww-serif"
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 18,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              marginBottom: 16,
            }}
          >
            このスポットを通るルート
          </h2>
          <Link
            href={`/routes/${spot.route_slug}`}
            className="group flex items-center justify-between transition-colors"
            style={{
              padding: "16px 20px",
              backgroundColor: "var(--color-ww-bg-secondary)",
              border: "1px solid var(--color-ww-border-subtle)",
              borderRadius: "var(--radius-ww-md)",
            }}
          >
            <div className="flex items-center gap-3">
              <Path
                size={20}
                weight="regular"
                style={{ color: "var(--color-ww-accent)" }}
              />
              <div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--color-ww-text)",
                  }}
                >
                  {spot.route_name}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-ww-text-secondary)",
                  }}
                >
                  {spot.area_name}
                </p>
              </div>
            </div>
            <ArrowRight
              size={16}
              weight="regular"
              style={{ color: "var(--color-ww-text-tertiary)" }}
            />
          </Link>
        </section>

        {/* Tips */}
        {spot.tips && (
          <section
            style={{
              marginBottom: 32,
              padding: 20,
              backgroundColor: "var(--color-ww-bg-secondary)",
              borderRadius: "var(--radius-ww-md)",
              border: "1px solid var(--color-ww-border-subtle)",
            }}
          >
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.75,
                color: "var(--color-ww-text-secondary)",
              }}
            >
              {spot.tips}
            </p>
          </section>
        )}

        <div className="py-8">
          <WalksAppCTA />
        </div>
        <SupportedBadge />
      </article>

      {/* JSON-LD: LocalBusiness / TouristAttraction */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type":
              spot.category === "cafe" || spot.category === "restaurant"
                ? "Restaurant"
                : spot.category === "shop"
                  ? "Store"
                  : "TouristAttraction",
            name: spot.name,
            description: spot.description ?? undefined,
            ...(spot.lat && spot.lng
              ? {
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: spot.lat,
                    longitude: spot.lng,
                  },
                }
              : {}),
            ...(spot.photo_url ? { image: spot.photo_url } : {}),
            ...(spot.opening_hours
              ? { openingHours: spot.opening_hours }
              : {}),
            ...(spot.phone ? { telephone: spot.phone } : {}),
            ...(spot.website_url ? { url: spot.website_url } : {}),
            ...(spot.pet_friendly
              ? { additionalProperty: { "@type": "PropertyValue", name: "犬連れ", value: "可" } }
              : {}),
          }),
        }}
      />

      {/* FAQ structured data */}
      {faqItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.a,
                },
              })),
            }),
          }}
        />
      )}
    </>
  );
}

function InfoRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <span
        style={{
          color: "var(--color-ww-text-secondary)",
          minWidth: 80,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        className="inline-flex items-center gap-1"
        style={{ color: "var(--color-ww-text)", fontWeight: 500 }}
      >
        {ok !== undefined &&
          (ok ? (
            <CheckCircle
              size={14}
              weight="fill"
              style={{ color: "var(--color-ww-success)" }}
            />
          ) : (
            <XCircle
              size={14}
              weight="fill"
              style={{ color: "var(--color-ww-text-tertiary)" }}
            />
          ))}
        {value}
      </span>
    </div>
  );
}
