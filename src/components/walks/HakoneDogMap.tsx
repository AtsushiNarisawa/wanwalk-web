"use client";

/**
 * 箱根 犬連れおでかけマップβ の地図（Leaflet）。
 *
 * 既存 RouteMap.tsx（単一ルート密結合）は流用せず、DESIGN_TOKENS の DivIcon + Phosphor
 * パターンだけを継承した独立コンポーネント。施設を 4 グループ色分けピンで表示する。
 *
 * - 初期表示は「全 hakone 施設」の fitBounds（マウント時 1 回・仙石原中心化しない）。
 * - フィルタ変更では再フィットせず、表示するピンだけ絞る（視点が飛ばないように）。
 * - ピンクリックで onSelectPlace を呼び、親がカードへスクロールする。
 */
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { DirectoryGroup, DirectoryPlace } from "@/types/directory";
import {
  DIRECTORY_GROUPS,
  DIRECTORY_CATEGORY_LABELS,
  buildOutboundUrl,
  formatDirectoryDogChips,
  groupOfPlace,
  isConditional,
} from "@/lib/walks/directory-groups";
import { trackEvent } from "@/lib/analytics";

const PIN_SIZE = 32;
const GLYPH_SIZE = 17;
const OUTLINE = "#FFFFFF";
const FIT_PADDING: [number, number] = [48, 48];
const FALLBACK_ZOOM = 13;

// グループごとの「色丸 + 白アイコングリフ」ピン。色で群を、グリフで種別を二重表現する。
function buildGroupIcon(group: DirectoryGroup): L.DivIcon {
  const def = DIRECTORY_GROUPS[group];
  return L.divIcon({
    className: "wanwalk-directory-marker",
    html: `<div style="width:${PIN_SIZE}px;height:${PIN_SIZE}px;border-radius:9999px;background:${def.color};border:2px solid ${OUTLINE};box-shadow:0 0 0 1px rgba(42,42,42,0.12);display:flex;align-items:center;justify-content:center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="${GLYPH_SIZE}" height="${GLYPH_SIZE}" fill="${OUTLINE}"><path d="${def.iconPath}"/></svg>
    </div>`,
    iconSize: [PIN_SIZE, PIN_SIZE],
    iconAnchor: [PIN_SIZE / 2, PIN_SIZE / 2],
  });
}

// マウント時に全施設の範囲へフィット（1 回だけ）。
function FitAllOnMount({ points }: { points: [number, number][] }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || points.length === 0) return;
    done.current = true;
    if (points.length === 1) {
      map.setView(points[0], FALLBACK_ZOOM);
    } else {
      map.fitBounds(points, { padding: FIT_PADDING });
    }
  }, [map, points]);
  return null;
}

interface HakoneDogMapProps {
  places: DirectoryPlace[]; // 全 hakone 施設（範囲計算に使用）
  activeGroups: DirectoryGroup[]; // 表示する群
  onSelectPlace?: (id: string) => void;
}

export default function HakoneDogMap({
  places,
  activeGroups,
  onSelectPlace,
}: HakoneDogMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // SSR 非対応の Leaflet 描画を mounted まで遅延する意図的ガード。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{
          height: 460,
          backgroundColor: "var(--color-ww-bg-secondary)",
          borderRadius: "var(--radius-ww-md)",
          color: "var(--color-ww-text-tertiary)",
        }}
      >
        地図を読み込み中...
      </div>
    );
  }

  const allPoints = places
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => [p.lat, p.lng] as [number, number]);

  // 初期 center は施設分布に依存させない（中立性）: 施設座標の重心だと密度の高い
  // 仙石原＝DogHub 所在へ寄るため、固定の箱根中心で初期化する。全域フィットは
  // FitAllOnMount が担うので、初期中心が施設データに依存する経路を残さない。
  const center: [number, number] = [35.232, 139.05];

  const activeSet = new Set(activeGroups);
  const visible = places.filter(
    (p) => p.lat != null && p.lng != null && activeSet.has(groupOfPlace(p))
  );

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        height: 460,
        borderRadius: "var(--radius-ww-md)",
        border: "1px solid var(--color-ww-border-subtle)",
      }}
    >
      <MapContainer
        center={center}
        zoom={FALLBACK_ZOOM}
        className="w-full h-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitAllOnMount points={allPoints} />
        {visible.map((place) => {
          const group = groupOfPlace(place);
          const def = DIRECTORY_GROUPS[group];
          const chips = formatDirectoryDogChips(place.dog_policy, place.category);
          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={buildGroupIcon(group)}
            >
              <Popup>
                <div
                  style={{
                    fontFamily: "var(--font-ww-sans)",
                    minWidth: 180,
                    maxWidth: 240,
                    lineHeight: 1.5,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: def.color,
                      marginBottom: 2,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {def.label}
                    <span style={{ color: "var(--color-ww-text-tertiary)", fontWeight: 400 }}>
                      {" / "}
                      {DIRECTORY_CATEGORY_LABELS[place.category]}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--color-ww-text)",
                      marginBottom: 6,
                    }}
                  >
                    {place.name}
                  </div>
                  {(chips.length > 0 || isConditional(place.dog_policy)) && (
                    <div style={{ fontSize: 11, color: "var(--color-ww-text-secondary)", marginBottom: 8 }}>
                      {isConditional(place.dog_policy) ? "条件付き犬連れ可" : "犬連れ可"}
                      {chips.length > 0 ? ` ・ ${chips.join(" / ")}` : ""}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {onSelectPlace && (
                      <button
                        type="button"
                        onClick={() => onSelectPlace(place.id)}
                        style={{
                          appearance: "none",
                          border: "1px solid var(--color-ww-border-strong)",
                          background: "var(--color-ww-bg)",
                          color: "var(--color-ww-text)",
                          borderRadius: 8,
                          padding: "5px 10px",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        詳細を見る
                      </button>
                    )}
                    {place.official_url && (
                      <a
                        href={buildOutboundUrl(place.official_url)}
                        target="_blank"
                        rel="noopener nofollow"
                        onClick={() => {
                          trackEvent("outbound_click", {
                            place: place.utm_slug ?? undefined,
                            group,
                            category: place.category,
                            surface: "hakone_dogmap",
                            channel: "web_map_popup",
                          });
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          border: "1px solid var(--color-ww-border-subtle)",
                          background: "var(--color-ww-bg)",
                          color: "var(--color-ww-accent)",
                          borderRadius: 8,
                          padding: "5px 10px",
                          fontSize: 12,
                          fontWeight: 500,
                          textDecoration: "none",
                        }}
                      >
                        公式サイト
                        <ArrowUpRight size={13} weight="regular" aria-hidden />
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
