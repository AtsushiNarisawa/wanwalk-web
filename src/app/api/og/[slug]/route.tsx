import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { wanwalkSupabase as supabase } from "@/lib/walks/supabase";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: route } = await supabase
    .from("official_routes")
    .select(
      "name, difficulty_level, distance_meters, estimated_minutes, thumbnail_url, areas(name)"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!route) {
    return new Response("Route not found", { status: 404 });
  }

  const areaName = (route.areas as unknown as { name: string })?.name ?? "";
  const distanceKm = (route.distance_meters / 1000).toFixed(1);
  const difficultyLabel =
    route.difficulty_level === "easy"
      ? "初級"
      : route.difficulty_level === "moderate"
        ? "中級"
        : "上級";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Background photo */}
        {route.thumbnail_url && (
          <img
            src={route.thumbnail_url}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
            }}
          />
        )}

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "630px",
            background: route.thumbnail_url
              ? "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%)"
              : "#2A2A2A",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "60px",
          }}
        >
          {/* Area name */}
          <div
            style={{
              fontSize: "28px",
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.08em",
              marginBottom: "12px",
              display: "flex",
            }}
          >
            {areaName}
          </div>

          {/* Route name */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.2,
              marginBottom: "20px",
              display: "flex",
            }}
          >
            {route.name}
          </div>

          {/* Green accent line */}
          <div
            style={{
              width: "80px",
              height: "4px",
              background: "#6B7F5B",
              marginBottom: "20px",
              display: "flex",
            }}
          />

          {/* Specs row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              fontSize: "24px",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <span style={{ display: "flex" }}>{difficultyLabel}</span>
            <span style={{ display: "flex", color: "rgba(255,255,255,0.5)" }}>|</span>
            <span style={{ display: "flex" }}>{distanceKm} km</span>
            <span style={{ display: "flex", color: "rgba(255,255,255,0.5)" }}>|</span>
            <span style={{ display: "flex" }}>約 {route.estimated_minutes} 分</span>
          </div>
        </div>

        {/* WanWalk branding - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.05em",
              display: "flex",
            }}
          >
            wanwalk.jp
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
