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
}

export default function RouteTimeline({ spots }: RouteTimelineProps) {
  // コースガイドは「流れ・時間・距離の俯瞰」に特化。
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
