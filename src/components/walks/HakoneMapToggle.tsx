import Link from "next/link";
import { Path, MapPin } from "@phosphor-icons/react/dist/ssr";

/**
 * 箱根 2マップの相互回遊トグル（散歩コース ⇄ 犬連れスポット）。
 *
 * - 「散歩コース」 = /hakone（公開・index 可の散歩ルートハブ）
 * - 「犬連れスポット」 = /hakone/dog-map（2026-08-26 の A6 で一般公開・index 可）
 *
 * ⚠️ このトグルは UI（回遊導線）だけを担う。/hakone 側でこのトグルを出すかどうかは
 *   UI フラグ HAKONE_CROSSLINK_ENABLED が制御する（dog-map 側は常に両タブ表示）。
 *   ※ 2026-08 まで dog-map は ?k 限定の非公開で、フラグを先に ON にすると
 *     公開ページから 404 へのリンクが出る関係だった。A6 でその依存は解消済み。
 *
 * ラベルは「さんぽ／おでかけ」だと利用者が混同するため使わず、
 * 内容そのままの「散歩コース」「犬連れスポット」で統一（CEO 指示 2026-07-24）。
 * デザインは深緑のセグメント型（アクティブ＝深緑塗り・白文字）。絵文字・肉球は使わない。
 */
export default function HakoneMapToggle({
  active,
}: {
  active: "routes" | "spots";
}) {
  const tabs = [
    { key: "routes", label: "散歩コース", href: "/hakone", Icon: Path },
    { key: "spots", label: "犬連れスポット", href: "/hakone/dog-map", Icon: MapPin },
  ] as const;

  return (
    <nav
      aria-label="箱根マップの切り替え"
      className="inline-flex"
      style={{
        gap: 4,
        padding: 4,
        border: "1px solid var(--color-ww-border-strong)",
        borderRadius: "var(--radius-ww-md)",
        backgroundColor: "var(--color-ww-bg-secondary)",
      }}
    >
      {tabs.map(({ key, label, href, Icon }) => {
        const isActive = key === active;
        const inner = (
          <>
            <Icon size={16} weight="regular" />
            {label}
          </>
        );
        const shared = {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 18px",
          borderRadius: "var(--radius-ww-sm)",
          fontFamily: "var(--font-ww-sans)",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.02em",
          whiteSpace: "nowrap" as const,
        };

        // アクティブ側は非リンクの span（現在地）。深緑塗り・白文字。
        if (isActive) {
          return (
            <span
              key={key}
              aria-current="page"
              style={{
                ...shared,
                backgroundColor: "var(--color-ww-accent)",
                color: "var(--color-ww-text-inverse)",
              }}
            >
              {inner}
            </span>
          );
        }

        // 非アクティブ側はリンク（相手ページへ回遊）。
        return (
          <Link
            key={key}
            href={href}
            className="transition-colors"
            style={{
              ...shared,
              color: "var(--color-ww-text-secondary)",
            }}
          >
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}
