"use client";

import { useState, useMemo } from "react";
import type { RouteWithArea, OfficialRoute, Season } from "@/types/walks";
import {
  Flower,
  Sun,
  Leaf,
  Snowflake,
  ShoppingCart,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import RouteCard from "./RouteCard";

const SEASON_CONFIG: { key: Season; label: string; icon: Icon }[] = [
  { key: "spring", label: "春", icon: Flower },
  { key: "summer", label: "夏", icon: Sun },
  { key: "autumn", label: "秋", icon: Leaf },
  { key: "winter", label: "冬", icon: Snowflake },
];

interface SeasonFilterProps {
  routes: (RouteWithArea | OfficialRoute)[];
}

export default function SeasonFilter({ routes }: SeasonFilterProps) {
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [cartOnly, setCartOnly] = useState(false);

  const filteredRoutes = useMemo(() => {
    let result = routes;
    if (activeSeason) {
      result = result.filter((r) => {
        const tags = r.pet_info?.best_season_tags;
        if (!tags || !Array.isArray(tags)) return true;
        return tags.includes(activeSeason);
      });
    }
    if (cartOnly) {
      result = result.filter((r) => r.cart_friendly === true);
    }
    return result;
  }, [routes, activeSeason, cartOnly]);

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
          return (
            <button
              key={key}
              onClick={() => setActiveSeason(isActive ? null : key)}
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
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <IconComp size={16} weight={isActive ? "fill" : "regular"} />
              {label}
            </button>
          );
        })}

        <button
          onClick={() => setCartOnly(!cartOnly)}
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
            cursor: "pointer",
            transition: "all 0.15s ease",
            marginLeft: 4,
          }}
        >
          <ShoppingCart size={16} weight={cartOnly ? "fill" : "regular"} />
          カート走行可
        </button>
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
            {filteredRoutes.length}件
          </span>
        </p>
      )}

      {/* ルート一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoutes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
        {filteredRoutes.length === 0 && (
          <p
            className="col-span-full text-center py-12"
            style={{
              fontSize: 15,
              color: "var(--color-ww-text-tertiary)",
            }}
          >
            条件に合うコースが見つかりませんでした
          </p>
        )}
      </div>
    </div>
  );
}
