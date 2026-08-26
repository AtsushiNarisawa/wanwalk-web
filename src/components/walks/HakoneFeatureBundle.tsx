import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getHakoneAreasWithRoutes } from "@/lib/walks/data";
import { getDirectoryPlaces } from "@/lib/walks/directory";

/**
 * トップページの「箱根特集」バンド。
 * UI フラグ HAKONE_CROSSLINK_ENABLED=ON のときだけ「おすすめピックアップ」枠を差し替えて表示する。
 *
 * 主 CTA は施設一覧 /hakone/dog-map（箱根 愛犬とおでかけマップ）。
 * 箱根DMO 連携リリースで公開するのは施設一覧で、プレスリリースの着地点がこのトップページに
 * なったため（CEO 決定 2026-08-26）、トップから施設一覧へ最短で送る。
 * ※ 旧・主 CTA は /hakone（散歩コースのハブ）で、その理由は「非公開の dog-map へ直接リンクせず
 *   SEO 評価を /hakone に集約する」だった。A6（2026-08-26）で dog-map が index 可・sitemap 掲載に
 *   なったためこの前提は消滅。散歩コースのハブへは同じ枠の見出し「箱根特集」の
 *   「すべて見る」（/hakone）から回遊できる。
 *
 * 文面は遷移先 /hakone/dog-map の見出し・description に合わせる（施設が主・散歩コースは従）。
 * 件数はハードコードせず、施設は getDirectoryPlaces、コースは getHakoneAreasWithRoutes から取る。
 *
 * 画像は /hakone 本体と同じロジックで芦ノ湖エリアの hero を流用（既存の箱根系画像・据え置き）。
 * このコンポーネントはフラグ ON のときだけレンダリングされるため、OFF（本番デフォルト）では
 * 追加の DB 取得は発生しない。
 */
export default async function HakoneFeatureBundle() {
  const [areas, places] = await Promise.all([
    getHakoneAreasWithRoutes(),
    getDirectoryPlaces("hakone"),
  ]);
  const totalRoutes = areas.reduce((n, a) => n + a.routes.length, 0);
  const totalAreas = areas.length;
  const totalPlaces = places.length;
  const heroImage =
    areas.find((a) => a.area.slug === "hakone-ashinoko")?.area.hero_image_url ??
    areas[0]?.area.hero_image_url ??
    null;

  return (
    <Link
      href="/hakone/dog-map"
      className="group block overflow-hidden transition-colors"
      style={{
        border: "1px solid var(--color-ww-border-subtle)",
        borderRadius: "var(--radius-ww-md)",
        backgroundColor: "var(--color-ww-bg)",
      }}
    >
      {heroImage && (
        <div className="aspect-[21/9] relative">
          <Image
            src={heroImage}
            alt="箱根 愛犬とおでかけマップ"
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 1152px) 100vw, 1152px"
          />
        </div>
      )}
      <div className="p-6">
        <h3
          className="ww-serif"
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 22,
            fontWeight: 600,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
            lineHeight: 1.4,
          }}
        >
          箱根 愛犬とおでかけマップ
        </h3>
        <p
          className="mt-1"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-ww-accent)",
            letterSpacing: "0.02em",
          }}
        >
          泊まる・食べる・遊ぶ・温泉の施設マップ
        </p>
        <p
          className="mt-3"
          style={{
            fontSize: 14,
            lineHeight: 1.85,
            color: "var(--color-ww-text-secondary)",
          }}
        >
          箱根で愛犬と「泊まる・食べる・遊ぶ・温泉」を楽しめる施設
          <span className="ww-numeric">{totalPlaces}</span>
          件を地図にまとめました。各施設のカードには、そこから歩けるWanWalkの散歩コースを最寄り3本まで距離つきでご案内します（箱根
          <span className="ww-numeric">{totalAreas}</span>
          エリア・全
          <span className="ww-numeric">{totalRoutes}</span>
          本）。箱根町・箱根DMOと連携した公式版です。
        </p>
        <span
          className="inline-flex items-center gap-1 mt-4"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--color-ww-accent)",
            letterSpacing: "0.04em",
            borderBottom: "1px solid var(--color-ww-accent)",
            paddingBottom: 2,
          }}
        >
          箱根のおでかけマップを見る
          <ArrowRight size={14} weight="regular" />
        </span>
      </div>
    </Link>
  );
}
