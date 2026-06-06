import type { Metadata } from "next";
import Link from "next/link";
import { getDirectoryPlaces } from "@/lib/walks/directory";
import HakoneDogMapView from "@/components/walks/HakoneDogMapView";
import DirectoryRefTracker from "@/components/walks/DirectoryRefTracker";

/**
 * 箱根 犬連れ「おでかけマップ」β（非公開）。
 *
 * ■ 非公開βの担保
 *   - robots: noindex,nofollow（meta）
 *   - sitemap 非登録（sitemap.ts を触らない）
 *   - グローバルナビ無し＋どのページからも内部リンクしない（直リンク共有のみ）
 *   ※ robots.txt の Disallow は入れない（Disallow するとクローラが noindex を読めず逆効果）。
 *
 * ■ 中立を設計で体現（HAKONE_DOGMAP_SPEC §10-6）
 *   ピン/カード/バッジ完全均一・PRバッジ無し・固定ランダム順・運営者開示。
 */
export const metadata: Metadata = {
  title: "箱根 愛犬とおでかけマップ（β）",
  description:
    "箱根で愛犬と泊まる・食べる・遊ぶ・温泉を楽しめる施設の地図。各施設から歩けるWanWalkの散歩ルートも一緒にご案内します（試験公開版）。",
  robots: { index: false, follow: false },
  alternates: { canonical: undefined },
};

// ?ref を読むため動的レンダリング。DB 取得は44行+RPC1回と軽量。
export const dynamic = "force-dynamic";

const REF_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

export default async function HakoneDogMapPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const [{ ref }, places] = await Promise.all([
    searchParams,
    getDirectoryPlaces("hakone"),
  ]);
  const safeRef = typeof ref === "string" && REF_PATTERN.test(ref) ? ref : "";

  return (
    <main
      className="mx-auto"
      style={{ maxWidth: 1320, padding: "32px 16px 64px" }}
    >
      {safeRef && <DirectoryRefTracker refSlug={safeRef} />}

      {/* ヘッダー */}
      <header style={{ marginBottom: 28 }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: "var(--font-ww-sans)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "var(--color-ww-accent)",
            backgroundColor: "var(--color-ww-accent-soft)",
            borderRadius: "var(--radius-ww-sm)",
            padding: "3px 10px",
            marginBottom: 14,
          }}
        >
          β版（試験公開）
        </span>
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
      </header>

      {/* 地図 + フィルタ + カード */}
      <HakoneDogMapView places={places} />

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
        <p style={{ margin: "0 0 6px" }}>
          このマップは{" "}
          <Link href="/about" style={{ color: "var(--color-ww-text-secondary)" }}>
            WanWalk
          </Link>{" "}
          が編集・運営しています。掲載は無料で、掲載順や表示は施設の優劣・おすすめ度を示すものではありません。
        </p>
        <p style={{ margin: 0 }}>
          犬の同伴条件・営業時間・料金などの情報は2026年6月時点のものです。最新の情報・予約は各施設の公式サイトでご確認ください。
        </p>
      </footer>
    </main>
  );
}
