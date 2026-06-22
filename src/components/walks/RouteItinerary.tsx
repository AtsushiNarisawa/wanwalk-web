"use client";

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
  Church,
  MapPin,
  ArrowRight,
  Flower,
  Sun,
  Leaf,
  Snowflake,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { NON_SEO_SPOT_CATEGORIES } from "@/types/walks";
import type { RouteSpot, SpotCategory, DogPolicy } from "@/types/walks";
import { trackEvent } from "@/lib/analytics";
import { formatSpotDistance } from "@/lib/walks/format";

// ──────────────────────────────────────────────────────────────────
// RouteItinerary: 「コースガイド（文字だけ）」と「おすすめスポット（写真は最下部）」を
// 1本の "歩く順の写真旅程" に統合したコンポーネント。
// - 見どころ系カテゴリ（viewpoint/cafe/restaurant/park/shop/dog_run/shrine_temple）で
//   写真 or 説明があるスポット → 写真カード（写真・名前・距離・説明・犬同伴バッジ・季節キャプション）
// - インフラ系（parking/restroom/water_station/landmark）→ 写真なしの小行（流れを切らない）
// - 季節キャプション（seasonal_notes）は「あるものだけ」表示（DB 68件・現状サイト未表示）
// ※ 構造化データ（page.tsx 側 itinerary/amenityFeature）とは独立。誠実性ルール: 季節は事実情報のみ。
// ──────────────────────────────────────────────────────────────────

// 写真カードで見せる「見どころ」カテゴリ（FeaturedSpots の FEATURED_CATEGORIES を踏襲）
const FEATURED_CATEGORIES = new Set<string>([
  "viewpoint",
  "cafe",
  "restaurant",
  "park",
  "shop",
  "dog_run",
  "shrine_temple",
]);

const CATEGORY_ICONS: Record<string, Icon> = {
  cafe: Coffee,
  restaurant: ForkKnife,
  park: Tree,
  dog_run: Dog,
  water_station: Drop,
  restroom: Toilet,
  parking: Car,
  viewpoint: Binoculars,
  shop: Storefront,
  shrine_temple: Church,
  landmark: MapPin,
};

// seasonal_notes のキー（spring/summer/autumn/winter ＋ 稀に newyear/sunset/all_year）→ 日本語ラベル・アイコン
const SEASON_NOTE_META: Record<string, { label: string; Icon: Icon }> = {
  spring: { label: "春", Icon: Flower },
  summer: { label: "夏", Icon: Sun },
  autumn: { label: "秋", Icon: Leaf },
  winter: { label: "冬", Icon: Snowflake },
  newyear: { label: "正月", Icon: Snowflake },
  sunset: { label: "夕暮れ", Icon: Sun },
  all_year: { label: "通年", Icon: Leaf },
};
const SEASON_NOTE_ORDER = ["spring", "summer", "autumn", "winter", "newyear", "sunset", "all_year"];

function isLinkable(spot: RouteSpot): boolean {
  if (!spot.slug) return false;
  if (spot.category && NON_SEO_SPOT_CATEGORIES.has(spot.category)) return false;
  return true;
}

const SIZE_LABELS: Record<string, string> = {
  all: "全犬種OK",
  small_medium: "中型犬以下",
  small_only: "小型犬のみ",
};

function DogPolicyBadge({ policy }: { policy: DogPolicy }) {
  const tags: string[] = [];
  if (policy.size) tags.push(SIZE_LABELS[policy.size] ?? policy.size);
  if (policy.indoor && policy.terrace) tags.push("店内・テラスOK");
  else if (policy.indoor) tags.push("店内OK");
  else if (policy.terrace) tags.push("テラスのみ");
  if (policy.leash_required) tags.push("リード必須");
  if (policy.carrier_required) tags.push("キャリー必須");
  if (policy.dog_fee && policy.dog_fee !== "無料") tags.push(policy.dog_fee);
  if (tags.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--color-ww-accent)",
            backgroundColor: "var(--color-ww-accent-soft)",
            padding: "3px 8px",
            borderRadius: "var(--radius-ww-sm)",
            lineHeight: 1.4,
          }}
        >
          {tag}
        </span>
      ))}
      {policy.notes && (
        <p
          style={{
            width: "100%",
            fontSize: 12,
            color: "var(--color-ww-text-secondary)",
            lineHeight: 1.6,
            marginTop: 2,
          }}
        >
          {policy.notes}
        </p>
      )}
    </div>
  );
}

// 季節キャプション（あるものだけ・最大2件）。誠実性: 季節の見どころ情報という事実のみを記載。
function SeasonalCaptions({ notes }: { notes: Record<string, string> | null }) {
  if (!notes) return null;
  const entries = SEASON_NOTE_ORDER.filter((k) => notes[k] && notes[k].trim())
    .slice(0, 2)
    .map((k) => ({ key: k, text: notes[k].trim() }));
  if (entries.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
      {entries.map(({ key, text }) => {
        const meta = SEASON_NOTE_META[key] ?? { label: key, Icon: Leaf };
        const SeasonIcon = meta.Icon;
        return (
          <div
            key={key}
            style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
          >
            <SeasonIcon
              size={15}
              weight="regular"
              style={{ color: "var(--color-ww-accent)", flexShrink: 0, marginTop: 3 }}
            />
            <span
              style={{
                fontFamily: "var(--font-ww-sans)",
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--color-ww-text-secondary)",
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--color-ww-text)" }}>
                {meta.label}の見頃
              </span>
              {" · "}
              {text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface RouteItineraryProps {
  spots: RouteSpot[];
  isArea?: boolean;
  routeSlug?: string;
}

type Surface = "title" | "photo" | "detail_cta" | "timeline" | "area_highlight";

function trackSpotClick(spot: RouteSpot, routeSlug: string | undefined, surface: Surface) {
  trackEvent("spot_card_click", {
    spot_slug: spot.slug ?? undefined,
    spot_category: spot.category ?? undefined,
    route_slug: routeSlug,
    source_page: "route_detail",
    surface,
  });
}

export default function RouteItinerary({ spots, isArea = false, routeSlug }: RouteItineraryProps) {
  if (isArea) {
    return <AreaItinerary spots={spots} routeSlug={routeSlug} />;
  }
  return <LineItinerary spots={spots} routeSlug={routeSlug} />;
}

// ── line型: 歩く順（distance_from_start）の番号付き写真旅程 ──────────────
function LineItinerary({ spots, routeSlug }: { spots: RouteSpot[]; routeSlug?: string }) {
  const sorted = [...spots]
    .filter((s) => !s.is_optional)
    .sort((a, b) => (a.distance_from_start ?? 0) - (b.distance_from_start ?? 0));

  // 立ち寄りスポット（任意・off-route）: 写真 or 説明がある見どころのみ、番号なしで末尾に。
  const optional = [...spots]
    .filter((s) => s.is_optional)
    .filter((s) => s.category && FEATURED_CATEGORIES.has(s.category))
    .filter((s) => s.photo_url || s.description)
    .sort((a, b) => (a.spot_order ?? 0) - (b.spot_order ?? 0));

  const usedPhotos = new Set<string>();

  return (
    <div>
      {sorted.map((spot, i) => {
        const isLast = i === sorted.length - 1 && optional.length === 0;
        const number = String(i + 1).padStart(2, "0");
        const isFeatured = !!spot.category && FEATURED_CATEGORIES.has(spot.category);

        let photoUrl = spot.photo_url;
        if (photoUrl && usedPhotos.has(photoUrl)) photoUrl = null;
        if (photoUrl) usedPhotos.add(photoUrl);

        const asCard = isFeatured && (!!photoUrl || !!spot.description);

        return (
          <div key={spot.id} style={{ display: "flex", gap: 16 }}>
            {/* 縦ライン + 番号 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 36,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "9999px",
                  border: "2px solid var(--color-ww-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-ww-mono, Inter, monospace)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-ww-accent)",
                  backgroundColor: "var(--color-ww-bg)",
                  flexShrink: 0,
                }}
              >
                {number}
              </div>
              {!isLast && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 20,
                    backgroundColor: "var(--color-ww-border-subtle)",
                  }}
                />
              )}
            </div>

            {/* コンテンツ */}
            <div style={{ paddingBottom: isLast ? 0 : asCard ? 36 : 20, flex: 1, minWidth: 0 }}>
              {asCard ? (
                <SpotCard spot={spot} photoUrl={photoUrl} routeSlug={routeSlug} showDistance />
              ) : (
                <SpotRow spot={spot} routeSlug={routeSlug} showDistance />
              )}
            </div>
          </div>
        );
      })}

      {optional.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <h3
            style={{
              fontFamily: "var(--font-ww-sans)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "var(--color-ww-text-secondary)",
              textTransform: "uppercase",
              margin: "0 0 16px",
            }}
          >
            立ち寄りスポット（任意）
          </h3>
          {optional.map((spot) => {
            let photoUrl = spot.photo_url;
            if (photoUrl && usedPhotos.has(photoUrl)) photoUrl = null;
            if (photoUrl) usedPhotos.add(photoUrl);
            return (
              <div key={spot.id} style={{ paddingBottom: 28 }}>
                <SpotCard spot={spot} photoUrl={photoUrl} routeSlug={routeSlug} showDistance={false} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── area型: 順序なしの写真カード（番号・距離なし。is_optional は視覚で区別） ──
function AreaItinerary({ spots, routeSlug }: { spots: RouteSpot[]; routeSlug?: string }) {
  const ordered = [...spots].sort((a, b) => {
    if (a.is_optional !== b.is_optional) return a.is_optional ? 1 : -1;
    return (a.spot_order ?? 0) - (b.spot_order ?? 0);
  });

  const usedPhotos = new Set<string>();

  return (
    <div>
      {ordered.map((spot, i) => {
        const isFeatured = !!spot.category && FEATURED_CATEGORIES.has(spot.category);
        let photoUrl = spot.photo_url;
        if (photoUrl && usedPhotos.has(photoUrl)) photoUrl = null;
        if (photoUrl) usedPhotos.add(photoUrl);
        const asCard = isFeatured && (!!photoUrl || !!spot.description);
        const isLast = i === ordered.length - 1;

        return (
          <div
            key={spot.id}
            style={{
              paddingBottom: isLast ? 0 : asCard ? 36 : 16,
              marginBottom: isLast ? 0 : asCard ? 36 : 12,
              borderBottom: isLast ? "none" : "1px solid var(--color-ww-border-subtle)",
            }}
          >
            {asCard ? (
              <SpotCard spot={spot} photoUrl={photoUrl} routeSlug={routeSlug} showDistance={false} />
            ) : (
              <SpotRow spot={spot} routeSlug={routeSlug} showDistance={false} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 写真カード（見どころ） ──────────────────────────────────────────
function SpotCard({
  spot,
  photoUrl,
  routeSlug,
  showDistance,
}: {
  spot: RouteSpot;
  photoUrl: string | null;
  routeSlug?: string;
  showDistance: boolean;
}) {
  const linkable = isLinkable(spot);
  const hasPhoto = !!photoUrl;
  const objectPosition =
    spot.photo_metadata?.image_position === "top"
      ? "center top"
      : spot.photo_metadata?.image_position === "bottom"
        ? "center bottom"
        : "center";

  return (
    <article>
      {/* 見出し（名前 + 距離） */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: hasPhoto ? 12 : 8 }}>
        <h3
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: 20,
            fontWeight: 600,
            color: "var(--color-ww-text)",
            lineHeight: 1.45,
            margin: 0,
            minWidth: 0,
          }}
        >
          {linkable ? (
            <Link
              href={`/spots/${spot.slug}`}
              onClick={() => trackSpotClick(spot, routeSlug, "title")}
              className="ww-spot-link"
              style={{ color: "inherit" }}
            >
              {spot.name}
            </Link>
          ) : (
            spot.name
          )}
        </h3>
        {showDistance && spot.distance_from_start != null && (
          <span
            style={{
              fontFamily: "var(--font-ww-mono, Inter, monospace)",
              fontSize: 12,
              color: "var(--color-ww-text-tertiary)",
              fontFeatureSettings: '"tnum"',
              marginLeft: "auto",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {formatSpotDistance(spot.distance_from_start)}
          </span>
        )}
      </div>

      {/* 写真（あるときだけ） */}
      {hasPhoto &&
        (linkable ? (
          <Link
            href={`/spots/${spot.slug}`}
            onClick={() => trackSpotClick(spot, routeSlug, "photo")}
            className="group"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "var(--radius-ww-sm)",
              backgroundColor: "var(--color-ww-bg-secondary)",
              aspectRatio: "16 / 9",
              width: "100%",
              marginBottom: 14,
              display: "block",
            }}
          >
            <Image
              src={photoUrl!}
              alt={spot.name}
              fill
              sizes="(max-width: 896px) 100vw, 860px"
              style={{ objectPosition }}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>
        ) : (
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "var(--radius-ww-sm)",
              backgroundColor: "var(--color-ww-bg-secondary)",
              aspectRatio: "16 / 9",
              width: "100%",
              marginBottom: 14,
            }}
          >
            <Image
              src={photoUrl!}
              alt={spot.name}
              fill
              sizes="(max-width: 896px) 100vw, 860px"
              style={{ objectPosition }}
              className="object-cover"
            />
          </div>
        ))}

      {/* 説明 */}
      {spot.description && (
        <p
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.75,
            color: "var(--color-ww-text-secondary)",
            margin: 0,
            whiteSpace: "pre-line",
          }}
        >
          {spot.description}
        </p>
      )}

      {/* 季節キャプション（あるものだけ） */}
      <SeasonalCaptions notes={spot.seasonal_notes} />

      {/* 犬同伴ポリシー */}
      {spot.dog_policy && <DogPolicyBadge policy={spot.dog_policy} />}

      {/* 詳細リンク */}
      {linkable && (
        <Link
          href={`/spots/${spot.slug}`}
          onClick={() => trackSpotClick(spot, routeSlug, "detail_cta")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 14,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-ww-accent)",
            letterSpacing: "0.02em",
          }}
          className="hover:underline underline-offset-4"
        >
          スポット詳細を見る
          <ArrowRight size={14} weight="regular" />
        </Link>
      )}
    </article>
  );
}

// ── 小行（インフラ系・写真なし見どころ） ──────────────────────────────
function SpotRow({
  spot,
  routeSlug,
  showDistance,
}: {
  spot: RouteSpot;
  routeSlug?: string;
  showDistance: boolean;
}) {
  const category = (spot.category ?? "viewpoint") as SpotCategory;
  const IconComponent = CATEGORY_ICONS[category] ?? MapPin;
  const linkable = isLinkable(spot);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 36 }}>
      <IconComponent
        size={16}
        weight="regular"
        style={{ color: "var(--color-ww-text-tertiary)", flexShrink: 0 }}
      />
      {linkable ? (
        <Link
          href={`/spots/${spot.slug}`}
          onClick={() => trackSpotClick(spot, routeSlug, "timeline")}
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: 15,
            fontWeight: 500,
            color: "var(--color-ww-text)",
            lineHeight: 1.4,
            textDecorationLine: "underline",
            textDecorationColor: "var(--color-ww-border-subtle)",
            textDecorationThickness: "1px",
            textUnderlineOffset: "3px",
            transition: "color 150ms ease",
          }}
          className="hover:!text-[color:var(--color-ww-accent)]"
        >
          {spot.name}
        </Link>
      ) : (
        <span
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: 15,
            fontWeight: 500,
            color: "var(--color-ww-text)",
            lineHeight: 1.4,
          }}
        >
          {spot.name}
        </span>
      )}
      {showDistance && spot.distance_from_start != null && (
        <span
          style={{
            fontFamily: "var(--font-ww-mono, Inter, monospace)",
            fontSize: 12,
            color: "var(--color-ww-text-tertiary)",
            fontFeatureSettings: '"tnum"',
            marginLeft: "auto",
            flexShrink: 0,
          }}
        >
          {formatSpotDistance(spot.distance_from_start)}
        </span>
      )}
    </div>
  );
}
