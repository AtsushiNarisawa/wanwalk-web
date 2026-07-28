/**
 * 非公開マップ /hakone/dog-map 専用の帰属表示。
 *
 * ※ 実測（2026-07-28 grep）: 公開ページ /hakone が使うのは SupportedBadge であって
 *    このバッジではない。このコンポーネントの利用箇所は /hakone/dog-map の 1 箇所だけ。
 *
 * ■ 名義の使い分け（2026-07-28 CEO 確定・恒久ルール／統一しない）
 *   - 非公開マップ（このバッジ）: 箱根DMO が主体・WanWalk が制作 →「箱根全山 公式」
 *   - 公開の wanwalk.jp 全体（SupportedBadge）: WanWalk が主体・DMO が後援
 *     →「Supported by 箱根DMO」
 *
 * ■ 表記
 *   箱根DMO の正式ブランド名は「箱根全山」。「箱根町」は行政名なので名義には出さない。
 *   ※「公式」名義は箱根DMO のブランド合意が前提（2026-06 DMO確認シート）。
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
          箱根全山 公式
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
