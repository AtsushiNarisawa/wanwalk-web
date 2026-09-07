import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

/**
 * 箱根「以外」のルート詳細から /hakone/dog-map（箱根 愛犬とおでかけマップ）へ送客する常設導線。
 *
 * ■ なぜ置くか（2026-09-07 CEO決定）
 *   WanWalk は DogHub（箱根仙石原）が運営しており、狙いは「箱根以外のエリアを見ている読者を
 *   WanWalk で獲得し、箱根へ送客する」こと。一方で箱根のSEOを強化すると DogHub 自身の集客と
 *   食い合うため、箱根側は強化しない（＝逆方向の HakoneDogMapLink はこの主旨と別物）。
 *   実装時点（2026-09-07）でルート詳細から箱根 dog-map への回遊リンクは0本だった。
 *
 * ■ 表示条件
 *   箱根グループ以外のエリアのページだけ。呼び出し側で !isHakoneAreaSlug() を条件に描画する
 *   （このコンポーネント自体は判定を持たない＝HakoneDogMapLink と同じ設計）。
 *
 * ■ 文言（恒久ルール厳守）
 *   ・季節に依存する推薦はしない（2026-08-29 CEO決定：芝桜を推していた事故の再発防止）。
 *   ・料金・同伴条件の詳細は書かない（変わるため）。
 *   ・席種（店内/テラス）は書かない（2026-08-02 CEO 確定）。初稿の「テラス席のあるカフェ」は
 *     これに触れるため撤去した（2026-09-07 参謀）。
 *   ・DogHub の名は出さない（DogHub言及は箱根ローカルの文脈に限定する運用のため、
 *     箱根「以外」のページであるここでは出さない）。
 *   ・emoji・肉球・パウプリント・キャラクターは使わない。犬の呼称は「愛犬」で統一。
 *
 * ■ 見た目
 *   AreaRouteLinks / HakoneDogMapLink と同じ「borderTop + 明朝24px の h2」パターン。
 *   新しい様式は作らない。
 */
export default function HakoneDogMapPromo() {
  return (
    <nav
      aria-labelledby="hakone-dogmap-promo-heading"
      style={{
        marginTop: 48,
        paddingTop: 40,
        borderTop: "1px solid var(--color-ww-border-subtle)",
      }}
    >
      <h2
        id="hakone-dogmap-promo-heading"
        className="ww-serif"
        style={{
          fontFamily: "var(--font-ww-serif)",
          fontSize: 24,
          fontWeight: 600,
          color: "var(--color-ww-text)",
          letterSpacing: "0.01em",
          marginBottom: 12,
        }}
      >
        箱根で愛犬とおでかけ
      </h2>
      <p
        style={{
          fontFamily: "var(--font-ww-sans)",
          fontSize: 15,
          lineHeight: 1.85,
          color: "var(--color-ww-text-secondary)",
          maxWidth: 720,
          margin: "0 0 16px",
        }}
      >
        愛犬と泊まれる宿やカフェなど、箱根で愛犬と過ごせる施設を地図から探せます。
      </p>
      <Link
        href="/hakone/dog-map"
        className="inline-flex items-center gap-1"
        style={{
          fontFamily: "var(--font-ww-sans)",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--color-ww-accent)",
          letterSpacing: "0.02em",
          borderBottom: "1px solid var(--color-ww-accent)",
          paddingBottom: 2,
          textDecoration: "none",
        }}
      >
        箱根 愛犬とおでかけマップを見る
        <ArrowRight size={14} weight="regular" />
      </Link>
    </nav>
  );
}
