"use client";

import dynamic from "next/dynamic";
import type { RouteSpot } from "@/types/walks";

const RouteMap = dynamic(() => import("@/components/walks/RouteMap"), { ssr: false });

interface RouteMapWrapperProps {
  coordinates: [number, number][];
  startLat: number;
  startLng: number;
  routeName: string;
  spots?: RouteSpot[];
}

export default function RouteMapWrapper(props: RouteMapWrapperProps) {
  return <RouteMap {...props} />;
}
