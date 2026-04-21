"use client";

import dynamic from "next/dynamic";
import type { RouteSpot, RouteType } from "@/types/walks";

const RouteMap = dynamic(() => import("@/components/walks/RouteMap"), { ssr: false });

interface RouteMapWrapperProps {
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

export default function RouteMapWrapper(props: RouteMapWrapperProps) {
  return <RouteMap {...props} />;
}
