"use client";

/**
 * 「Googleマップで駐車場までナビ」ボタン（RouteParking の下に置く）。
 * スマホでは Google マップのアプリが開く。クリックは GA4 parking_nav_click で計測。
 * ⚠️ 料金・台数は書かない。目的地は RouteParking が選んだ駐車場スポットの座標。
 */
import { NavigationArrow } from "@phosphor-icons/react/dist/ssr";
import { trackEvent } from "@/lib/analytics";

export default function ParkingNavButton({
  lat,
  lng,
  routeSlug,
  hasCardAbove,
}: {
  lat: number;
  lng: number;
  routeSlug: string;
  hasCardAbove: boolean;
}) {
  const href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("parking_nav_click", { route_slug: routeSlug })}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: hasCardAbove ? 16 : 0,
        padding: "12px 20px",
        minHeight: 44,
        border: "1px solid var(--color-ww-accent)",
        borderRadius: "var(--radius-ww-md)",
        backgroundColor: "transparent",
        color: "var(--color-ww-accent)",
        fontFamily: "var(--font-ww-sans)",
        fontSize: 15,
        fontWeight: 500,
        textDecoration: "none",
      }}
    >
      <NavigationArrow size={20} weight="regular" color="var(--color-ww-accent)" />
      Googleマップで駐車場までナビ
    </a>
  );
}
