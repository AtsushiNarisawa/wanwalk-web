import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { wanwalkSupabase as supabase } from "@/lib/walks/supabase";

export const runtime = "edge";

const CATEGORY_LABELS: Record<string, string> = {
  cafe: "カフェ",
  restaurant: "レストラン",
  park: "公園・自然",
  dog_run: "ドッグラン",
  water_station: "水飲み場",
  restroom: "トイレ",
  parking: "駐車場",
  viewpoint: "景観ポイント",
  shop: "ショップ",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: spot } = await supabase
    .from("route_spots")
    .select(
      "name, category, photo_url, pet_friendly, official_routes!inner(name, areas!inner(name))"
    )
    .eq("slug", slug)
    .limit(1)
    .single();

  if (!spot) {
    return new Response("Spot not found", { status: 404 });
  }

  const route = spot.official_routes as unknown as {
    name: string;
    areas: { name: string };
  };
  const areaName = route?.areas?.name ?? "";
  const categoryLabel = spot.category
    ? CATEGORY_LABELS[spot.category] ?? ""
    : "";
  const dogOk = spot.pet_friendly ? "犬連れOK" : "";

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
        {spot.photo_url && (
          <img
            src={spot.photo_url}
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
            background: spot.photo_url
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
          {/* Category + Dog-friendly badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            {categoryLabel && (
              <div
                style={{
                  fontSize: "22px",
                  color: "#FFFFFF",
                  backgroundColor: "rgba(107, 127, 91, 0.85)",
                  padding: "6px 16px",
                  borderRadius: "6px",
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                {categoryLabel}
              </div>
            )}
            {dogOk && (
              <div
                style={{
                  fontSize: "22px",
                  color: "#FFFFFF",
                  backgroundColor: "rgba(107, 127, 91, 0.65)",
                  padding: "6px 16px",
                  borderRadius: "6px",
                  fontWeight: 500,
                  display: "flex",
                }}
              >
                {dogOk}
              </div>
            )}
          </div>

          {/* Area name */}
          <div
            style={{
              fontSize: "26px",
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.08em",
              marginBottom: "10px",
              display: "flex",
            }}
          >
            {areaName}
          </div>

          {/* Spot name */}
          <div
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.25,
              marginBottom: "20px",
              display: "flex",
            }}
          >
            {spot.name}
          </div>

          {/* Green accent line */}
          <div
            style={{
              width: "80px",
              height: "4px",
              background: "#6B7F5B",
              marginBottom: "16px",
              display: "flex",
            }}
          />

          {/* Route name */}
          <div
            style={{
              fontSize: "20px",
              color: "rgba(255,255,255,0.75)",
              display: "flex",
            }}
          >
            {route?.name}
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
