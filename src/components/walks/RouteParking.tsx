import { Car } from "@phosphor-icons/react/dist/ssr";
import type { ParkingInfo } from "@/lib/walks/parking";

/**
 * ルート詳細の「駐車場」可視セクション（2026-09-02）。
 * 「〇〇 駐車場」で来た読者に、画面上でも見出し付きで答えるための枠。
 * 見た目は PetInfoGrid（犬連れメモ）のカードをそのまま踏襲する。
 *
 * ⚠️ 料金・金額は書かない（「無料」「有料」の別も書かない）。台数も足さない。
 *    表示するのは DB の pet_info.parking とコース構造だけ。
 */
export default function RouteParking({ info }: { info: ParkingInfo }) {
  if (!info.parkingText && !info.structureText) return null;

  return (
    <section style={{ marginBottom: 48 }}>
      <h2
        style={{
          fontFamily: "var(--font-ww-serif)",
          fontSize: 28,
          fontWeight: 600,
          color: "var(--color-ww-text)",
          letterSpacing: "0.01em",
          marginBottom: 20,
        }}
      >
        {info.placeName}の駐車場
      </h2>
      <div
        style={{
          backgroundColor: "var(--color-ww-bg-secondary)",
          borderRadius: "var(--radius-ww-md)",
          padding: 24,
          display: "flex",
          flexDirection: "row",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <Car
          size={24}
          weight="regular"
          color="var(--color-ww-accent)"
          style={{ flexShrink: 0, marginTop: 2 }}
        />
        <div style={{ flex: 1 }}>
          {info.parkingText && (
            <p
              style={{
                fontFamily: "var(--font-ww-sans)",
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.7,
                color: "var(--color-ww-text)",
                whiteSpace: "pre-line",
              }}
            >
              {info.parkingText}
            </p>
          )}
          {info.structureText && (
            <p
              style={{
                fontFamily: "var(--font-ww-sans)",
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.7,
                color: "var(--color-ww-text-secondary)",
                marginTop: info.parkingText ? 8 : 0,
              }}
            >
              {info.structureText}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
