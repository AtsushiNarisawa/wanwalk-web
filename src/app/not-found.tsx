import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ページが見つかりません｜WanWalk",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main
      className="min-h-[60vh] flex items-center justify-center px-4 py-20"
      style={{ backgroundColor: "var(--color-ww-bg)" }}
    >
      <div className="max-w-md mx-auto text-center">
        <p
          className="ww-numeric text-sm tracking-widest mb-4"
          style={{ color: "var(--color-ww-text-tertiary)" }}
        >
          404
        </p>
        <h1
          className="text-2xl font-serif mb-4"
          style={{ color: "var(--color-ww-text)", fontFamily: "var(--font-ww-serif)" }}
        >
          ページが見つかりません
        </h1>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: "var(--color-ww-text-secondary)" }}
        >
          お探しのページは移動または削除された可能性があります。
          トップページから散歩ルートをお探しください。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: "var(--color-ww-accent)",
            color: "var(--color-ww-text-inverse)",
            borderRadius: "var(--radius-ww-md)",
          }}
        >
          トップページへ
        </Link>
      </div>
    </main>
  );
}
