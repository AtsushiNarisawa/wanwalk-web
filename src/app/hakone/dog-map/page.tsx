import type { Metadata } from "next";
import Link from "next/link";
import { getDirectoryPlaces } from "@/lib/walks/directory";
import { getAreaBySlug } from "@/lib/walks/data";
import { buildOgMetadata, toOgImage } from "@/lib/walks/og-meta";
import HakoneDogMapView from "@/components/walks/HakoneDogMapView";
import DirectoryRefTracker from "@/components/walks/DirectoryRefTracker";
import HakoneOfficialBadge from "@/components/walks/HakoneOfficialBadge";
import HakoneMapToggle from "@/components/walks/HakoneMapToggle";

/**
 * 箱根 犬連れ「おでかけマップ」（一般公開・index 可）。
 *
 * ■ 公開の経緯（A6 / 2026-08-26）
 *   2026-08 まではリンク限定の非公開版（`?k=hkmap-2f8a91c47b3e` が無ければ 404・noindex・sitemap 非掲載）
 *   として DMO・掲載施設にだけ配っていた。プレスリリース配信に合わせて公開ゲートを解除した。
 *   - `?k` の判定は撤去。**配布済みの `?k=…` 付き URL はそのまま 200 で開く**
 *     （余分なクエリは無視するだけ。リダイレクトもしない＝配った URL が壊れない）。
 *   - robots: index,follow ／ canonical: /hakone/dog-map ／ sitemap 掲載（A7）。
 *   - referrer を "strict-origin-when-cross-origin" へ変更（2026-08-28）。
 *     `no-referrer` は ?k を Referer に漏らさないための措置だったが、ゲート廃止で役目を終えた。
 *     据え置くと施設の公式サイト側から見て WanWalk からの送客が「ダイレクト」に見えてしまい、
 *     DMO・掲載施設に送客の価値を示せない。strict-origin-when-cross-origin なら外部へは
 *     `https://wanwalk.jp/` というオリジンのみが渡り、パスもクエリも送られない
 *     （配布済みの `?k=` も、DMO バナーの `?ref=` も漏れない）。
 *
 * ■ OGP
 *   /hakone と同じ芦ノ湖のヒーロー（areas.hakone-ashinoko.hero_image_url）を
 *   共通ヘルパー toOgImage() + buildOgMetadata() で 1200x630 に整えて使う。
 *   ※ 従来はサイト既定の fallback（山中湖）を継承していた＝箱根の記事に山中湖が出ていた。
 *
 * ■ 中立を設計で体現（HAKONE_DOGMAP_SPEC §10-6）
 *   ピン/カード/バッジ完全均一・PRバッジ無し・あいうえお順/地理順・運営者開示。
 */
const PAGE_TITLE = "箱根 愛犬とおでかけマップ";
const PAGE_DESCRIPTION =
  "箱根で愛犬と泊まる・食べる・遊ぶ・温泉を楽しめる施設の地図。各施設から歩けるWanWalkの散歩ルートも一緒にご案内します。";

export async function generateMetadata(): Promise<Metadata> {
  // OG 画像は /hakone と同じ芦ノ湖のヒーロー（取得できなければ buildOgMetadata の共通 fallback）。
  const area = await getAreaBySlug("hakone-ashinoko");

  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    robots: { index: true, follow: true },
    alternates: { canonical: "/hakone/dog-map" },
    // 外部リンク先へは「https://wanwalk.jp/」のオリジンのみを渡す（パス・クエリは送らない）。
    // 施設側の解析で WanWalk からの送客が「ダイレクト」に埋もれないようにするための変更。
    // ?k= / ?ref= は含まれないので、旧ゲートの鍵が漏れる心配もない。
    referrer: "strict-origin-when-cross-origin",
    ...buildOgMetadata({
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      path: "/hakone/dog-map",
      ogImage: toOgImage(area?.hero_image_url),
      ogImageAlt: "箱根 愛犬とおでかけマップ - 愛犬と行ける箱根の施設",
    }),
  };
}

// ?ref を server の searchParams で読むため動的レンダリング。DB 取得は公開施設1クエリ+RPC1回と軽量。
// ※ プレス流入スパイクを CDN で受けるための ISR 化（/hakone と同じ形）は CEO 判断待ち。
export const dynamic = "force-dynamic";

const REF_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

export default async function HakoneDogMapPage({
  searchParams,
}: {
  // 配布済みリンクの `?k=…` は読まずに無視する（付いていても通常表示）。
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  const places = await getDirectoryPlaces("hakone");
  const safeRef = typeof ref === "string" && REF_PATTERN.test(ref) ? ref : "";

  return (
    <main
      className="mx-auto"
      style={{ maxWidth: 1320, padding: "32px 16px 64px" }}
    >
      {safeRef && <DirectoryRefTracker refSlug={safeRef} surface="hakone_dogmap" />}

      {/* 2マップの相互回遊トグル（アクティブ＝犬連れスポット／散歩コース→/hakone）。
          このページ自身が公開ページになった（A6）ため、トグルは UI フラグに関係なく常に両タブ表示。
          ※ /hakone 側でトグルを出すかどうかは UI フラグ HAKONE_CROSSLINK_ENABLED が制御する。 */}
      <div style={{ marginBottom: 20 }}>
        <HakoneMapToggle active="spots" />
      </div>

      {/* ヘッダー */}
      <header style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 34,
            fontWeight: 700,
            lineHeight: 1.35,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
            margin: "0 0 16px",
          }}
        >
          箱根 愛犬とおでかけマップ
        </h1>
        <p
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: 16,
            lineHeight: 1.85,
            color: "var(--color-ww-text-secondary)",
            maxWidth: 720,
            margin: 0,
          }}
        >
          箱根で愛犬と「泊まる・食べる・遊ぶ・温泉」を楽しめる施設を地図にまとめました。
          各施設のカードには、そこから歩けるWanWalkの散歩ルートを最寄り3本まで距離つきでご案内します。
          地図のカテゴリボタンで絞り込めます。
        </p>
        {/* 犬の同伴条件をサイトに載せない方針（2026-08-02 CEO 確定）に伴う、唯一の誘導文。
            条件は施設ごとにばらつきがあり変わるため、カード・地図ポップアップからは条件表示を撤去し、
            ここ1箇所で公式サイトへ誘導する。 */}
        <p
          style={{
            fontFamily: "var(--font-ww-sans)",
            fontSize: 14,
            lineHeight: 1.85,
            color: "var(--color-ww-text-tertiary)",
            maxWidth: 720,
            margin: "14px 0 0",
          }}
        >
          {"愛犬の同伴条件（受け入れできる犬のサイズ、同伴できる場所、料金など）は施設ごとに異なり、変更されることもあります。おでかけ前に各施設の公式サイトでご確認ください。"}
        </p>
      </header>

      {/* 地図 + フィルタ + カード */}
      <HakoneDogMapView places={places} />

      {/* 帰属（箱根全山＝箱根DMO が主体・WanWalk が制作）。運営者開示は下部フッターで別途。 */}
      <HakoneOfficialBadge />

      {/* 運営者開示・免責 */}
      <footer
        style={{
          marginTop: 48,
          paddingTop: 20,
          borderTop: "1px solid var(--color-ww-border-subtle)",
          fontSize: 12,
          lineHeight: 1.8,
          color: "var(--color-ww-text-tertiary)",
        }}
      >
        <p style={{ margin: "0 0 10px" }}>
          <Link href="/hakone" style={{ color: "var(--color-ww-accent)" }}>
            箱根 愛犬さんぽマップ（散歩コース一覧）→
          </Link>
        </p>
        <p style={{ margin: "0 0 6px" }}>
          このマップは、箱根・仙石原の犬のホテル&カフェ「
          <a
            href="https://dog-hub.shop/?utm_source=wanwalk&utm_medium=referral&utm_campaign=hakone-dogmap&utm_content=operator_disclosure"
            target="_blank"
            rel="noopener"
            style={{ color: "var(--color-ww-text-secondary)" }}
          >
            DogHub箱根仙石原
          </a>
          」の運営チームが手がける{" "}
          <Link href="/about" style={{ color: "var(--color-ww-text-secondary)" }}>
            WanWalk
          </Link>{" "}
          が編集・運営しています。掲載は無料で、掲載順や表示は施設の優劣・おすすめ度を示すものではありません。
        </p>
        <p style={{ margin: 0 }}>
          掲載内容は、各施設のカードに記載した確認日時点のものです。営業時間・料金・空き状況は各施設の公式サイトでご確認ください。
        </p>
      </footer>
    </main>
  );
}
