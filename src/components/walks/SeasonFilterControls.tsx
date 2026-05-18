"use client";

import Link from "next/link";
import {
  Flower,
  Sun,
  Leaf,
  Snowflake,
  ShoppingCart,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import type { Season } from "@/types/walks";
import { trackEvent, type SourcePage } from "@/lib/analytics";

const SEASON_CONFIG: { key: Season; label: string; icon: Icon }[] = [
  { key: "spring", label: "春", icon: Flower },
  { key: "summer", label: "夏", icon: Sun },
  { key: "autumn", label: "秋", icon: Leaf },
  { key: "winter", label: "冬", icon: Snowflake },
];

type Props = {
  activeSeason: Season | null;
  cartOnly: boolean;
  filteredCount: number;
  basePath: string;
  sourcePage?: SourcePage;
  areaSlug?: string;
};

function buildHref(
  basePath: string,
  next: { season: Season | null; cart: boolean },
): string {
  const params = new URLSearchParams();
  if (next.season) params.set("season", next.season);
  if (next.cart) params.set("cart", "1");
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function SeasonFilterControls({
  activeSeason,
  cartOnly,
  filteredCount,
  basePath,
  sourcePage,
  areaSlug,
}: Props) {
  const handleSeasonClick = (key: Season, willActivate: boolean) => {
    if (willActivate) {
      trackEvent("filter_apply_season", {
        season: key,
        source_page: sourcePage,
        area_slug: areaSlug,
      });
    }
  };

  const handleCartClick = (willActivate: boolean) => {
    if (willActivate) {
      trackEvent("filter_apply_cart", {
        source_page: sourcePage,
        area_slug: areaSlug,
      });
    }
  };

  const seasonLabel = activeSeason
    ? SEASON_CONFIG.find((s) => s.key === activeSeason)?.label
    : null;

  return (
    <div>
      {/* フィルターUI */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        {SEASON_CONFIG.map(({ key, label, icon: IconComp }) => {
          const isActive = activeSeason === key;
          const nextSeason: Season | null = isActive ? null : key;
          return (
            <Link
              key={key}
              href={buildHref(basePath, { season: nextSeason, cart: cartOnly })}
              onClick={() => handleSeasonClick(key, !isActive)}
              scroll={false}
              prefetch={false}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: "var(--radius-ww-md)",
                border: `1px solid ${isActive ? "var(--color-ww-accent)" : "var(--color-ww-border-subtle)"}`,
                backgroundColor: isActive
                  ? "var(--color-ww-accent-soft)"
                  : "var(--color-ww-bg)",
                color: isActive
                  ? "var(--color-ww-accent)"
                  : "var(--color-ww-text-secondary)",
                fontFamily: "var(--font-ww-sans)",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                textDecoration: "none",
              }}
            >
              <IconComp size={16} weight={isActive ? "fill" : "regular"} />
              {label}
            </Link>
          );
        })}

        <Link
          href={buildHref(basePath, { season: activeSeason, cart: !cartOnly })}
          onClick={() => handleCartClick(!cartOnly)}
          scroll={false}
          prefetch={false}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: "var(--radius-ww-md)",
            border: `1px solid ${cartOnly ? "var(--color-ww-accent)" : "var(--color-ww-border-subtle)"}`,
            backgroundColor: cartOnly
              ? "var(--color-ww-accent-soft)"
              : "var(--color-ww-bg)",
            color: cartOnly
              ? "var(--color-ww-accent)"
              : "var(--color-ww-text-secondary)",
            fontFamily: "var(--font-ww-sans)",
            fontSize: 14,
            fontWeight: cartOnly ? 600 : 400,
            marginLeft: 4,
            textDecoration: "none",
          }}
        >
          <ShoppingCart size={16} weight={cartOnly ? "fill" : "regular"} />
          カート走行可
        </Link>
      </div>

      {/* フィルター結果ラベル */}
      {(activeSeason || cartOnly) && (
        <p
          style={{
            fontSize: 14,
            color: "var(--color-ww-text-secondary)",
            marginBottom: 16,
          }}
        >
          {seasonLabel ? `${seasonLabel}におすすめ` : ""}
          {seasonLabel && cartOnly ? " · " : ""}
          {cartOnly ? "カート走行可" : ""}
          {" "}
          <span
            style={{
              fontFeatureSettings: '"tnum"',
              color: "var(--color-ww-accent)",
              fontWeight: 600,
            }}
          >
            {filteredCount}件
          </span>
        </p>
      )}
    </div>
  );
}
