import Link from "next/link";
import { NON_SEO_SPOT_CATEGORIES } from "@/types/walks";
import type { RouteSpot, SpotCategory } from "@/types/walks";
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
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";

// SEO対象カテゴリかつ slug がある場合のみ詳細ページにリンクできる
function isLinkable(spot: RouteSpot): boolean {
  if (!spot.slug) return false;
  if (spot.category && NON_SEO_SPOT_CATEGORIES.has(spot.category)) return false;
  return true;
}

const CATEGORY_ICONS: Record<SpotCategory, Icon> = {
  cafe: Coffee,
  restaurant: ForkKnife,
  park: Tree,
  dog_run: Dog,
  water_station: Drop,
  restroom: Toilet,
  parking: Car,
  viewpoint: Binoculars,
  shop: Storefront,
};

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

interface RouteTimelineProps {
  spots: RouteSpot[];
  isArea?: boolean;
}

export default function RouteTimeline({ spots, isArea = false }: RouteTimelineProps) {
  // area型: 全スポット並列（番号・距離なし、is_optional は視覚区別）
  if (isArea) {
    return <AreaHighlights spots={spots} />;
  }

  // line型: コースガイドは「流れ・時間・距離の俯瞰」に特化。
  // ピン由来の補助spots（is_optional=true）は FeaturedSpots 側で表示する。
  const sorted = [...spots]
    .filter((s) => !s.is_optional)
    .sort(
      (a, b) => (a.distance_from_start ?? 0) - (b.distance_from_start ?? 0)
    );

  return (
    <div>
      {sorted.map((spot, i) => {
        const category = (spot.category ?? "viewpoint") as SpotCategory;
        const IconComponent = CATEGORY_ICONS[category] ?? MapPin;
        const isLast = i === sorted.length - 1;
        const number = String(i + 1).padStart(2, "0");

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
            <div
              style={{
                paddingBottom: isLast ? 0 : 20,
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 36,
                }}
              >
                <IconComponent
                  size={16}
                  weight="regular"
                  style={{ color: "var(--color-ww-text-tertiary)", flexShrink: 0 }}
                />
                {isLinkable(spot) ? (
                  <Link
                    href={`/spots/${spot.slug}`}
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
                {spot.distance_from_start != null && (
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
                    {formatDistance(spot.distance_from_start)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// area型: 番号・距離なしの見どころ一覧。is_optionalは視覚で区別
function AreaHighlights({ spots }: { spots: RouteSpot[] }) {
  const ordered = [...spots].sort((a, b) => {
    if (a.is_optional !== b.is_optional) return a.is_optional ? 1 : -1;
    return (a.spot_order ?? 0) - (b.spot_order ?? 0);
  });

  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 12,
      }}
    >
      {ordered.map((spot) => {
        const category = (spot.category ?? "viewpoint") as SpotCategory;
        const IconComponent = CATEGORY_ICONS[category] ?? MapPin;
        const isOptional = spot.is_optional;
        return (
          <li
            key={spot.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: "var(--radius-ww-sm)",
              backgroundColor: isOptional
                ? "transparent"
                : "var(--color-ww-bg-secondary)",
              border: isOptional
                ? "1px dashed var(--color-ww-border-subtle)"
                : "1px solid transparent",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: isOptional ? 24 : 32,
                height: isOptional ? 24 : 32,
                borderRadius: "9999px",
                backgroundColor: isOptional
                  ? "var(--color-ww-bg)"
                  : "var(--color-ww-bg)",
                border: `1.5px solid ${
                  isOptional
                    ? "var(--color-ww-border-subtle)"
                    : "var(--color-ww-accent)"
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconComponent
                size={isOptional ? 13 : 16}
                weight="regular"
                style={{
                  color: isOptional
                    ? "var(--color-ww-text-tertiary)"
                    : "var(--color-ww-accent)",
                }}
              />
            </span>
            {isLinkable(spot) ? (
              <Link
                href={`/spots/${spot.slug}`}
                style={{
                  fontFamily: "var(--font-ww-sans)",
                  fontSize: isOptional ? 13 : 15,
                  fontWeight: isOptional ? 400 : 500,
                  color: isOptional
                    ? "var(--color-ww-text-tertiary)"
                    : "var(--color-ww-text)",
                  lineHeight: 1.4,
                  flex: 1,
                  minWidth: 0,
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
                  fontSize: isOptional ? 13 : 15,
                  fontWeight: isOptional ? 400 : 500,
                  color: isOptional
                    ? "var(--color-ww-text-tertiary)"
                    : "var(--color-ww-text)",
                  lineHeight: 1.4,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {spot.name}
              </span>
            )}
            {isOptional && (
              <span
                style={{
                  fontFamily: "var(--font-ww-sans)",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  color: "var(--color-ww-text-tertiary)",
                  textTransform: "uppercase",
                  padding: "2px 6px",
                  borderRadius: 4,
                  border: "1px solid var(--color-ww-border-subtle)",
                  flexShrink: 0,
                }}
              >
                Optional
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
