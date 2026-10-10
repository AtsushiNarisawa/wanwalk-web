import { DeviceMobile } from "@phosphor-icons/react/dist/ssr";
import AppStoreBadge from "./AppStoreBadge";
import AppWalkButton from "./AppWalkButton";
import type { SourcePage } from "@/lib/analytics";

type Props = {
  sourcePage?: SourcePage;
  /** GA4 app_store_badge_click の placement。ページ種別ごとに区別する。 */
  placement?: string;
  /** 見出し（ページ文脈に合わせて差し替え可）。 */
  title?: string;
  /** 補足コピー。 */
  subcopy?: string;
  /** カード下側の外余白(px)。既定32。直下の要素との間隔を詰めたいページだけ指定する。 */
  marginBottom?: number;
};

/**
 * 文脈付き Web→App 導線 CTA（Cross統一 ③ → Phase 1 でエリア/スポットへ横展開）。
 * 最下部の汎用 WalksAppCTA とは別物で、ページ上部の文脈内に置く小型の横型ストリップ。
 * 主役は深緑 Primary ボタン（AppWalkButton）、その下に公式 Apple バッジを副次配置。
 * 計測は app_store_badge_click を流用し placement / source_page で発火元を区別する。
 */
export default function WalkInAppCTA({
  sourcePage = "route_detail",
  placement = "route_detail_walk",
  title = "このルートをアプリで歩く",
  // LAYER1_NAV_SPEC §13: 記録訴求（日米で死亡実証）→ ナビ訴求へ。
  // 価値ステートメント（WANWALK_STRATEGY.md 正本）準拠。「取りこぼす」は使わない。
  subcopy = "知らない土地でも、見どころや愛犬と入れるお店を見逃さないよう、現地ではアプリが静かに道案内します。",
  marginBottom = 32,
}: Props) {
  return (
    <section
      className="walk-in-app-cta"
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 20,
        backgroundColor: "var(--color-ww-bg-secondary)",
        border: "1px solid var(--color-ww-border-subtle)",
        borderRadius: "var(--radius-ww-md)",
        padding: "16px 20px",
        marginBottom,
      }}
    >
      <div
        className="walk-in-app-cta__main"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          minWidth: 0,
          flex: "1 1 0",
        }}
      >
        <span
          aria-hidden
          className="walk-in-app-cta__icon"
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
            className="ww-serif walk-in-app-cta__title"
            style={{
              fontFamily: "var(--font-ww-serif)",
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1.4,
              color: "var(--color-ww-text)",
              marginBottom: 2,
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--color-ww-text-secondary)",
            }}
          >
            {subcopy}
          </p>
        </div>
      </div>

      <div
        className="walk-in-app-cta__actions"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <AppWalkButton sourcePage={sourcePage} placement={placement} />
        <AppStoreBadge
          sourcePage={sourcePage}
          placement={placement}
          height={36}
          className="walk-in-app-cta__badge"
        />
      </div>

      <style>{`
        .walk-in-app-cta { align-items: center; }
        .walk-in-app-cta__actions { align-items: center; }
        .walk-in-app-cta__title { text-wrap: balance; }
        @media (max-width: 639px) {
          .walk-in-app-cta { flex-direction: column; align-items: stretch; gap: 14px; }
          .walk-in-app-cta__actions { align-items: flex-start; }
          .walk-in-app-cta__main { gap: 10px !important; }
          .walk-in-app-cta__icon { width: 32px !important; }
        }
      `}</style>
    </section>
  );
}
