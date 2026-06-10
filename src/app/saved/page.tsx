import Link from "next/link";
import type { Metadata } from "next";
import SavedRoutesList from "@/components/walks/SavedRoutesList";

// 端末ローカルの保存リスト（ユーザー固有）なので検索インデックス不要
export const metadata: Metadata = {
  title: "行きたいリスト",
  description: "保存した愛犬との散歩コース一覧。",
  robots: { index: false, follow: true },
};

export default function SavedRoutesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      <nav
        aria-label="パンくず"
        className="mb-6"
        style={{
          fontSize: 12,
          color: "var(--color-ww-text-secondary)",
        }}
      >
        <Link href="/" style={{ color: "var(--color-ww-text-secondary)" }}>
          ホーム
        </Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--color-ww-text)" }}>行きたいリスト</span>
      </nav>

      <header className="mb-10">
        <h1
          className="ww-serif"
          style={{
            fontFamily: "var(--font-ww-serif)",
            fontSize: 32,
            fontWeight: 700,
            color: "var(--color-ww-text)",
            letterSpacing: "0.01em",
            lineHeight: 1.3,
          }}
        >
          行きたいリスト
        </h1>
        <p
          className="mt-3"
          style={{
            fontSize: 15,
            lineHeight: 1.75,
            color: "var(--color-ww-text-secondary)",
          }}
        >
          保存した散歩コースの一覧です。リストはこの端末のブラウザに保存されます（会員登録は不要です）。
        </p>
      </header>

      <SavedRoutesList />
    </div>
  );
}
