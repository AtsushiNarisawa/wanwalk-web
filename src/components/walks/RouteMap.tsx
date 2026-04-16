"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// DESIGN_TOKENS.md §12-A
const ACCENT = "#6B7F5B";
const ACCENT_HOVER = "#556649";
const OUTLINE = "#FFFFFF";
const LINE_WEIGHT = 5;
const LINE_OUTLINE_WEIGHT = 7;
const LINE_OPACITY = 0.95;
const FIT_PADDING: [number, number] = [40, 40];
const MARKER_SIZE = 28;
const FALLBACK_ZOOM = 15;

function buildPinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "wanwalk-route-marker",
    html: `<div style="width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;border-radius:9999px;background:${color};border:2px solid ${OUTLINE};box-shadow:0 0 0 1px rgba(42,42,42,0.08);"></div>`,
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
  });
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
}

export default function RouteMap({ coordinates, startLat, startLng }: RouteMapProps) {
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

  const hasLine = coordinates.length > 0;
  const start = hasLine ? coordinates[0] : ([startLat, startLng] as [number, number]);
  const goal = hasLine ? coordinates[coordinates.length - 1] : null;
  const sameStartGoal =
    !goal || (start[0] === goal[0] && start[1] === goal[1]);

  // FitBounds が走る前の初期 center / zoom（一瞬だけ表示される）
  const initialCenter: [number, number] = hasLine
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
        {hasLine && <FitBoundsOnMount coordinates={coordinates} />}
        {hasLine && (
          <>
            {/* 白アウトライン（下） */}
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
            {/* 深緑メインライン（上） */}
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
        <Marker position={start} icon={buildPinIcon(ACCENT)} />
        {!sameStartGoal && goal && (
          <Marker position={goal} icon={buildPinIcon(ACCENT_HOVER)} />
        )}
      </MapContainer>
    </div>
  );
}
