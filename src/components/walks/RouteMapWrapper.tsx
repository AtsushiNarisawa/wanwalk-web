"use client";

import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("@/components/walks/RouteMap"), { ssr: false });

interface RouteMapWrapperProps {
  coordinates: [number, number][];
  startLat: number;
  startLng: number;
  routeName: string;
}

export default function RouteMapWrapper(props: RouteMapWrapperProps) {
  return <RouteMap {...props} />;
}
