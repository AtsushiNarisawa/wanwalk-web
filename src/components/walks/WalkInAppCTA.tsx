import { DeviceMobile } from "@phosphor-icons/react/dist/ssr";
import AppStoreBadge from "./AppStoreBadge";
import type { SourcePage } from "@/lib/analytics";

type Props = {
  sourcePage?: SourcePage;
};

/**
 * ルート詳細の文脈付き Web→App 導線 CTA（Cross統一 ③）。
 * 最下部の汎用 WalksAppCTA とは別物で、ヘッダー直下に置く小型の横型ストリップ。
 * 計測は既存 AppStoreBadge の app_store_badge_click を流用し placement で区別する。
 */
export default function WalkInAppCTA({ sourcePage = "route_detail" }: Props) {
  return (
    <section
      className="walk-in-app-cta"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        backgroundColor: "var(--color-ww-bg-secondary)",
        border: "1px solid var(--color-ww-border-subtle)",
        borderRadius: "var(--radius-ww-md)",
        padding: "16px 20px",
        marginBottom: 32,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          minWidth: 0,
          flex: "1 1 auto",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            width: 40,
            height: 40,
            color: "var(--color-ww-accent)",
          }}
        >
          <DeviceMobile size={24} weight="regular" />
        </span>
        <div style={{ minWidth: 0 }}>
          <p
            className="ww-serif"
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1.4,
              color: "var(--color-ww-text)",
              marginBottom: 2,
            }}
          >
            このルートをアプリで歩く
          </p>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--color-ww-text-secondary)",
            }}
          >
            GPSで現在地を確認しながら、歩いた距離や時間を記録できます。
          </p>
        </div>
      </div>

      <AppStoreBadge
        sourcePage={sourcePage}
        placement="route_detail_walk"
        height={44}
        className="walk-in-app-cta__badge"
      />

      <style>{`
        @media (max-width: 639px) {
          .walk-in-app-cta { flex-direction: column; align-items: flex-start; gap: 14px; }
          .walk-in-app-cta__badge { align-self: flex-start; }
        }
      `}</style>
    </section>
  );
}
