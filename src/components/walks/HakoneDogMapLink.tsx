import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

/**
 * 箱根のルート詳細・エリア詳細から /hakone/dog-map（箱根 愛犬とおでかけマップ）へ返す文脈リンク。
 *
 * ■ なぜ置くか（2026-09-02）
 *   hakone.or.jp トップから /hakone/dog-map への dofollow 被リンクが実在する。
 *   一方、実測では dog-map への内部リンクはトップの箱根特集と /hakone のトグルの2本だけで、
 *   箱根の18本のルート詳細・5枚のエリア詳細からは1本も張られていなかった。
 *   箱根クエリ（大涌谷 犬連れ・箱根神社 犬連れ 等）が7〜10位に沈んでいるため、
 *   箱根関連ページ同士を双方向につないで評価を回す。
 *   逆向き（dog-map → 各コース）は HakoneRouteLinks が担う。
 *
 * ■ 表示条件
 *   箱根グループのエリア（areas.group_key='hakone'）に属するページだけ。
 *   判定は isHakoneAreaSlug()。呼び出し側で分岐する（このコンポーネントは判定を持たない）。
 *
 * ■ 帰属表示について（reference_hakone_dmo_attribution_rule）
 *   ルート詳細・エリア詳細は公開ページ＝WanWalk が主体で、DMO は後援（SupportedBadge）。
 *   したがってこのブロックには DMO 名義（「箱根全山 公式」等）を一切書かない。
 *   「公式」は /hakone/dog-map の HakoneOfficialBadge の1箇所限定のまま。
 *
 * ■ 文面
 *   遷移先 /hakone/dog-map の見出し・description に合わせる（施設が主）。
 *   犬の同伴条件・料金は書かない（恒久ルール）。見出しとアンカーの検索語は「犬連れ」。
 *
 * ■ 見た目
 *   AreaRouteLinks と同じ「borderTop + 明朝24px の h2」パターン。新しい見た目は作らない。
 */
export default function HakoneDogMapLink() {
  return (
    <nav
      aria-labelledby="hakone-dogmap-link-heading"
      style={{
        marginTop: 48,
        paddingTop: 40,
        borderTop: "1px solid var(--color-ww-border-subtle)",
      }}
    >
      <h2
        id="hakone-dogmap-link-heading"
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
        箱根の犬連れスポット
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
        箱根で愛犬と「泊まる・食べる・遊ぶ・温泉」を楽しめる施設を、地図にまとめています。散歩の前後に立ち寄れる場所を、エリアごとに探せます。
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
        箱根の犬連れスポットを地図で見る
        <ArrowRight size={14} weight="regular" />
      </Link>
    </nav>
  );
}
