"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Polygon, Circle, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RouteSpot, DogPolicy, RouteType } from "@/types/walks";

// DESIGN_TOKENS.md §12-A
const ACCENT = "#6B7F5B";
const ACCENT_HOVER = "#556649";
const OUTLINE = "#FFFFFF";
const LINE_WEIGHT = 5;
const LINE_OUTLINE_WEIGHT = 7;
const LINE_OPACITY = 0.95;
const FIT_PADDING: [number, number] = [40, 40];
const MARKER_SIZE = 28;
const SPOT_MARKER_SIZE = 24;
const FALLBACK_ZOOM = 15;

// 9カテゴリのアイコン定義（Phosphor Icons SVG paths — Regular weight）
const CATEGORY_ICONS: Record<string, { svg: string; label: string; color: string }> = {
  cafe: {
    svg: `<path d="M80,56V192a32,32,0,0,0,32,32h72a32,32,0,0,0,32-32V56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="48" y1="224" x2="208" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M216,96h8a32,32,0,0,1,0,64h-8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>`,
    label: "カフェ",
    color: "#8B6914",
  },
  restaurant: {
    svg: `<line x1="80" y1="40" x2="80" y2="88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="80" y1="128" x2="80" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M80,128a40,40,0,0,1-40-40V40H120V88A40,40,0,0,1,80,128Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M176,40c0,48,0,88-16,88s-16-40-16-88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="176" y1="128" x2="176" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>`,
    label: "レストラン",
    color: "#A84A3D",
  },
  park: {
    svg: `<path d="M132,188V132L96,88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M128,128a60,60,0,1,1,60-60" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="128" y1="68" x2="128" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="96" y1="224" x2="160" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>`,
    label: "公園",
    color: "#5B7F6B",
  },
  dog_run: {
    svg: `<circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="128 72 128 128 184 128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>`,
    label: "ドッグラン",
    color: "#6B7F5B",
  },
  water_station: {
    svg: `<path d="M128,24S48,88,48,144a80,80,0,0,0,160,0C208,88,128,24,128,24Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>`,
    label: "水飲み場",
    color: "#5B728A",
  },
  restroom: {
    svg: `<line x1="128" y1="32" x2="128" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><circle cx="80" cy="56" r="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M112,224V168l-32-56H48l32,56v56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><circle cx="176" cy="56" r="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M144,112h64l-16,56H164l12,56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>`,
    label: "トイレ",
    color: "#6B6B6B",
  },
  parking: {
    svg: `<rect x="40" y="40" width="176" height="176" rx="8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M104,168V88h36a28,28,0,0,1,0,56H104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>`,
    label: "駐車場",
    color: "#6B6B6B",
  },
  viewpoint: {
    svg: `<circle cx="128" cy="104" r="32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M128,24A80,80,0,0,1,208,104c0,72-80,128-80,128S48,176,48,104A80,80,0,0,1,128,24Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>`,
    label: "景観ポイント",
    color: "#B8905C",
  },
  shop: {
    svg: `<path d="M48,128V208a8,8,0,0,0,8,8H200a8,8,0,0,0,8-8V128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M32,96l16-56H208l16,56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M32,96a32,32,0,0,0,64,0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M96,96a32,32,0,0,0,64,0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M160,96a32,32,0,0,0,64,0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>`,
    label: "ショップ",
    color: "#8B6914",
  },
};

const DEFAULT_ICON = CATEGORY_ICONS.viewpoint;

function buildPinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "wanwalk-route-marker",
    html: `<div style="width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;border-radius:9999px;background:${color};border:2px solid ${OUTLINE};box-shadow:0 0 0 1px rgba(42,42,42,0.08);"></div>`,
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
  });
}

function buildSpotIcon(category: string): L.DivIcon {
  const cat = CATEGORY_ICONS[category] ?? DEFAULT_ICON;
  const s = SPOT_MARKER_SIZE;
  return L.divIcon({
    className: "wanwalk-spot-marker",
    html: `<div style="width:${s}px;height:${s}px;border-radius:var(--radius-ww-md,8px);background:${OUTLINE};border:2px solid ${cat.color};display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 1px rgba(42,42,42,0.06);">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="14" height="14" style="color:${cat.color};">${cat.svg}</svg>
    </div>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
  });
}

function formatDogPolicySummary(policy: DogPolicy): string {
  const parts: string[] = [];
  if (policy.size === "all") parts.push("全犬種OK");
  else if (policy.size === "small_medium") parts.push("中型犬以下");
  else if (policy.size === "small_only") parts.push("小型犬のみ");
  if (policy.indoor) parts.push("店内OK");
  if (policy.terrace) parts.push("テラスOK");
  if (policy.leash_required) parts.push("リード必須");
  if (policy.carrier_required) parts.push("キャリー必須");
  return parts.join(" / ");
}

// 半径円の外周上を8方位にサンプリング（fitBounds計算用）
function circleBoundary(
  lat: number,
  lng: number,
  radiusM: number
): [number, number][] {
  const R = 6378137; // 地球半径 [m]
  const d = radiusM / R;
  const points: [number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const brng = (i * Math.PI * 2) / 8;
    const lat1 = (lat * Math.PI) / 180;
    const lng1 = (lng * Math.PI) / 180;
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(d) +
        Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
    );
    const lng2 =
      lng1 +
      Math.atan2(
        Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
        Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
      );
    points.push([(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI]);
  }
  return points;
}

function FitBoundsOnMount({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      map.fitBounds(coordinates, { padding: FIT_PADDING });
    }
  }, [map, coordinates]);
  return null;
}

interface RouteMapProps {
  coordinates: [number, number][];
  startLat: number;
  startLng: number;
  routeName: string;
  spots?: RouteSpot[];
  routeType?: RouteType;
  areaPolygon?: [number, number][] | null;
  areaCenterLat?: number | null;
  areaCenterLng?: number | null;
  areaRadiusM?: number | null;
}

export default function RouteMap({
  coordinates,
  startLat,
  startLng,
  spots = [],
  routeType = "line",
  areaPolygon = null,
  areaCenterLat = null,
  areaCenterLng = null,
  areaRadiusM = null,
}: RouteMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
        地図を読み込み中...
      </div>
    );
  }

  const isArea = routeType === "area";
  const hasPolygon = isArea && areaPolygon && areaPolygon.length >= 3;
  const hasCircle =
    isArea &&
    !hasPolygon &&
    areaCenterLat != null &&
    areaCenterLng != null &&
    areaRadiusM != null;

  const hasLine = !isArea && coordinates.length > 0;
  const start = hasLine ? coordinates[0] : ([startLat, startLng] as [number, number]);
  const goal = hasLine ? coordinates[coordinates.length - 1] : null;
  const sameStartGoal =
    !goal || (start[0] === goal[0] && start[1] === goal[1]);

  const spotsWithCoords = spots.filter(
    (s) => s.lat != null && s.lng != null
  );

  // fitBounds用: ルートタイプ別に境界点を集める
  const boundaryPoints: [number, number][] = isArea
    ? hasPolygon
      ? areaPolygon!
      : hasCircle
        ? circleBoundary(areaCenterLat!, areaCenterLng!, areaRadiusM!)
        : []
    : coordinates;

  const allPoints: [number, number][] = [
    ...boundaryPoints,
    ...spotsWithCoords.map((s) => [s.lat!, s.lng!] as [number, number]),
  ];

  const initialCenter: [number, number] = isArea
    ? areaCenterLat != null && areaCenterLng != null
      ? [areaCenterLat, areaCenterLng]
      : [startLat, startLng]
    : hasLine
      ? [
          coordinates.reduce((sum, c) => sum + c[0], 0) / coordinates.length,
          coordinates.reduce((sum, c) => sum + c[1], 0) / coordinates.length,
        ]
      : [startLat, startLng];

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-100">
      <MapContainer
        center={initialCenter}
        zoom={FALLBACK_ZOOM}
        className="w-full h-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {allPoints.length > 0 && <FitBoundsOnMount coordinates={allPoints} />}
        {hasLine && (
          <>
            <Polyline
              positions={coordinates}
              pathOptions={{
                color: OUTLINE,
                weight: LINE_OUTLINE_WEIGHT,
                opacity: LINE_OPACITY,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Polyline
              positions={coordinates}
              pathOptions={{
                color: ACCENT,
                weight: LINE_WEIGHT,
                opacity: LINE_OPACITY,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}
        {hasPolygon && (
          <Polygon
            positions={areaPolygon!}
            pathOptions={{
              color: ACCENT,
              weight: 1.5,
              opacity: 0.6,
              fillColor: ACCENT,
              fillOpacity: 0.2,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}
        {hasCircle && (
          <Circle
            center={[areaCenterLat!, areaCenterLng!]}
            radius={areaRadiusM!}
            pathOptions={{
              color: ACCENT,
              weight: 1.5,
              opacity: 0.6,
              fillColor: ACCENT,
              fillOpacity: 0.2,
            }}
          />
        )}
        {/* スポットマーカー */}
        {spotsWithCoords.map((spot) => {
          const cat = CATEGORY_ICONS[spot.category ?? ""] ?? DEFAULT_ICON;
          const policySummary = spot.dog_policy
            ? formatDogPolicySummary(spot.dog_policy)
            : null;
          return (
            <Marker
              key={spot.id}
              position={[spot.lat!, spot.lng!]}
              icon={buildSpotIcon(spot.category ?? "")}
            >
              <Popup>
                <div style={{ fontFamily: "var(--font-ww-sans)", minWidth: 160, maxWidth: 220, lineHeight: 1.5 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: cat.color, marginBottom: 2, letterSpacing: "0.05em" }}>
                    {cat.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#2A2A2A", marginBottom: policySummary ? 6 : 0 }}>
                    {spot.name}
                  </div>
                  {policySummary && (
                    <div style={{
                      fontSize: 11,
                      color: "#6B7F5B",
                      backgroundColor: "#E8EDE1",
                      padding: "3px 6px",
                      borderRadius: 4,
                      display: "inline-block",
                    }}>
                      {policySummary}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        {/* Start / Goal マーカー（area型ではspotsのみ表示するため非表示） */}
        {!isArea && <Marker position={start} icon={buildPinIcon(ACCENT)} />}
        {!isArea && !sameStartGoal && goal && (
          <Marker position={goal} icon={buildPinIcon(ACCENT_HOVER)} />
        )}
      </MapContainer>
    </div>
  );
}
