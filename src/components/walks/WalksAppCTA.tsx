import Link from "next/link";
import { DeviceMobile } from "@phosphor-icons/react/dist/ssr";
import AppStoreBadge from "./AppStoreBadge";
import type { SourcePage } from "@/lib/analytics";

type Props = {
  sourcePage?: SourcePage;
  /** GA4 app_store_badge_click の placement。既定 walks_app_cta（既存ページ後方互換）。 */
  placement?: string;
  /** 見出し。既定は共通文言。 */
  title?: string;
  /** 説明文。既定は共通文言。 */
  description?: string;
  /** バッジ下の「推薦の募集について」リンクを出すか。/contribute 自身では false。 */
  showContributeLink?: boolean;
};

export default function WalksAppCTA({
  sourcePage = "home",
  placement = "walks_app_cta",
  title = "WanWalkアプリ、App Store で配信中",
  description = "愛犬との散歩道を記録し、良い道は編集部へ推薦できます。採用された道は、公式ルートとして全国に届きます。",
  showContributeLink = true,
}: Props) {
  return (
    <section
      className="text-center"
      style={{
        backgroundColor: "var(--color-ww-bg-secondary)",
        border: "1px solid var(--color-ww-border-subtle)",
        borderRadius: "var(--radius-ww-md)",
        padding: "48px 24px",
      }}
    >
      <div
        className="inline-flex items-center justify-center mb-6"
        style={{
          width: 56,
          height: 56,
          color: "var(--color-ww-accent)",
          borderBottom: "1px solid var(--color-ww-border-subtle)",
          paddingBottom: 8,
        }}
      >
        <DeviceMobile size={28} weight="regular" />
      </div>
      <h2
        className="ww-serif mb-4"
        style={{
          fontFamily: "var(--font-ww-serif)",
          fontSize: 24,
          fontWeight: 600,
          color: "var(--color-ww-text)",
          letterSpacing: "0.02em",
          lineHeight: 1.4,
        }}
      >
        {title}
      </h2>
      <p
        className="mx-auto mb-8"
        style={{
          maxWidth: 520,
          fontSize: 14,
          lineHeight: 1.75,
          color: "var(--color-ww-text-secondary)",
        }}
      >
        {description}
      </p>
      <AppStoreBadge sourcePage={sourcePage} placement={placement} height={48} />
      {showContributeLink && (
        <p style={{ marginTop: 16 }}>
          <Link
            href="/contribute"
            style={{ fontSize: 13, color: "var(--color-ww-accent)", textDecoration: "none" }}
          >
            推薦の募集について
          </Link>
        </p>
      )}
    </section>
  );
}
