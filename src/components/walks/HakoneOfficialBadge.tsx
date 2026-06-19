/**
 * 箱根ページ専用の帰属表示（/hakone・/hakone/dog-map）。
 *
 * WanWalk 本体の SupportedBadge（"Supported by 箱根DMO" ＝ WanWalk が主・DMO が後援）とは
 * 上下関係が逆。箱根 愛犬さんぽマップは箱根町・箱根全山（箱根DMO）が主体で、
 * WanWalk は土台/制作という位置づけ。語順を正して「公式」を主体側に置く。
 *
 * ※「公式」名義は箱根DMO/箱根町のブランド合意が前提（2026-06 DMO確認シート）。
 */
export default function HakoneOfficialBadge() {
  return (
    <div className="py-10 text-center">
      <div
        className="inline-flex items-center gap-3"
        style={{ marginBottom: 8 }}
      >
        <span
          aria-hidden
          style={{
            width: 28,
            height: 1,
            backgroundColor: "var(--color-ww-border-subtle)",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--color-ww-accent)",
            letterSpacing: "0.04em",
          }}
        >
          箱根町・箱根全山 公式
        </span>
        <span
          aria-hidden
          style={{
            width: 28,
            height: 1,
            backgroundColor: "var(--color-ww-border-subtle)",
            display: "inline-block",
          }}
        />
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 11,
          color: "var(--color-ww-text-tertiary)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        制作・運営　WanWalk
      </p>
    </div>
  );
}
