import Link from "next/link";
import { getHakoneRouteLinks } from "@/lib/walks/data";
import { formatDistanceOrDash } from "@/lib/walks/format";

/**
 * /hakone/dog-map から箱根の各散歩コース・各エリアへ返すテキストリンク索引。
 *
 * ■ なぜ置くか（2026-09-02・実測にもとづく）
 *   hakone.or.jp トップから /hakone/dog-map への dofollow 被リンクが実在するが、
 *   dog-map が HTML で返している内部リンクは実測で
 *   「/hakone が2本（トグル + 下部）」「/areas/hakone-… が5本」だけで、
 *   **ルート詳細（/routes/…）へは0本**だった。
 *   施設カード（DirectoryPlaceCard）は最寄りコースへのリンクを持っているものの、
 *   既定の「エリア順」表示ではエリアが畳まれており（openAreas の初期値が空）、
 *   カード自体がレンダリングされないため HTML にリンクが出ない。
 *   スマホでの一覧性を守るためこの畳み込み UX は変えず、
 *   サーバー側で常に出るテキストリンク索引を別に置いて外部評価を各コースへ流す。
 *
 *   同じ処方は鎌倉の内部リンク救済（AreaRouteLinks・2026-06-04）で実績があるため、
 *   見た目・マークアップともにそちらに揃える（新しい見た目は作らない）。
 *
 * ■ 置き場所（帰属表示の都合）
 *   HakoneOfficialBadge（「箱根全山 公式」＝ DMO 主体の施設マップに対する帰属）**より下**に置く。
 *   この索引は WanWalk 自身のコンテンツで、DMO 名義の対象ではないため、
 *   バッジが施設マップにだけ掛かって見えるように順序で分離する。
 *   （reference_hakone_dmo_attribution_rule）
 *
 * ■ コスト
 *   dog-map は force-dynamic のため毎リクエスト実行される。
 *   getHakoneRouteLinks は 2 クエリ・テキスト列のみに絞ってある。
 */
export default async function HakoneRouteLinks() {
  const groups = await getHakoneRouteLinks();
  if (groups.length === 0) return null;

  const total = groups.reduce((n, g) => n + g.routes.length, 0);

  return (
    <nav
      aria-labelledby="hakone-route-links-heading"
      style={{
        marginTop: 48,
        paddingTop: 40,
        borderTop: "1px solid var(--color-ww-border-subtle)",
      }}
    >
      <h2
        id="hakone-route-links-heading"
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
        箱根の犬連れ散歩コース
      </h2>
      <p
        style={{
          fontFamily: "var(--font-ww-sans)",
          fontSize: 15,
          lineHeight: 1.85,
          color: "var(--color-ww-text-secondary)",
          maxWidth: 720,
          margin: "0 0 24px",
        }}
      >
        箱根で愛犬と歩ける散歩コースは
        <span className="ww-numeric">{total}</span>本。
        施設めぐりと合わせて、エリアごとに散歩コースも選べます。
      </p>

      {groups.map((group) => (
        <section key={group.areaSlug} style={{ marginBottom: 24 }}>
          {/* エリア見出しはリンクにしない。/areas/{slug} へは、このページ上部の
              エリアセクション（「◯◯の散歩ルートを見る」）から既に5本張られており、
              同一URLへの二重リンクを増やしても先頭のアンカーしか効かないため。
              この索引が埋めるのは「ルート詳細へのリンクが0本」という穴の方。 */}
          <h3
            style={{
              fontFamily: "var(--font-ww-sans)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--color-ww-text)",
              margin: "0 0 10px",
            }}
          >
            {group.areaName}の犬連れ散歩コース
          </h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "14px 24px",
            }}
          >
            {group.routes.map((r) => {
              const dist = formatDistanceOrDash(r.distance_meters);
              const meta =
                r.estimated_minutes == null
                  ? dist !== "—"
                    ? dist
                    : null
                  : dist !== "—"
                    ? `${dist}・約${r.estimated_minutes}分`
                    : `約${r.estimated_minutes}分`;
              return (
                <li key={r.id}>
                  <Link
                    href={`/routes/${r.slug}`}
                    style={{
                      fontFamily: "var(--font-ww-sans)",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "var(--color-ww-accent)",
                      textDecoration: "none",
                      lineHeight: 1.5,
                    }}
                  >
                    {r.name}
                  </Link>
                  {meta && (
                    <span
                      style={{
                        display: "block",
                        fontSize: 12.5,
                        color: "var(--color-ww-text-secondary)",
                        marginTop: 2,
                      }}
                    >
                      {meta}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
