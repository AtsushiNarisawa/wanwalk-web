import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getHakoneAreasWithRoutes } from "@/lib/walks/data";

/**
 * トップページの「箱根特集」バンド。
 * UI フラグ HAKONE_CROSSLINK_ENABLED=ON のときだけ「おすすめピックアップ」枠を差し替えて表示する。
 *
 * 主 CTA は index 可能な公開ハブ /hakone（箱根 愛犬さんぽマップ）。
 * 散歩コース＋犬連れスポットの2マップ回遊への入口を1枚のカードにまとめる。
 * SEO 評価は /hakone に集約する意図のため、非公開の /hakone/dog-map へはここから直接リンクしない。
 *
 * 画像は /hakone 本体と同じロジックで芦ノ湖エリアの hero を流用（既存の箱根系画像）。
 * このコンポーネントはフラグ ON のときだけレンダリングされるため、OFF（本番デフォルト）では
 * 追加の DB 取得は発生しない。
 */
export default async function HakoneFeatureBundle() {
  const areas = await getHakoneAreasWithRoutes();
  const totalRoutes = areas.reduce((n, a) => n + a.routes.length, 0);
  const heroImage =
    areas.find((a) => a.area.slug === "hakone-ashinoko")?.area.hero_image_url ??
    areas[0]?.area.hero_image_url ??
    null;

  return (
    <Link
      href="/hakone"
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
            alt="箱根 愛犬さんぽマップ"
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
          箱根 愛犬さんぽマップ
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
          散歩コース＋犬連れスポットの地図
        </p>
        <p
          className="mt-3"
          style={{
            fontSize: 14,
            lineHeight: 1.85,
            color: "var(--color-ww-text-secondary)",
          }}
        >
          箱根湯本・宮ノ下・強羅・仙石原・芦ノ湖の5エリアで、愛犬と歩ける散歩コース
          <span className="ww-numeric">{totalRoutes}</span>
          本を、駐車場・犬連れスポット・体験ストーリー付きでご案内します。箱根町・箱根DMOと連携した公式版です。
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
          箱根のマップを見る
          <ArrowRight size={14} weight="regular" />
        </span>
      </div>
    </Link>
  );
}
