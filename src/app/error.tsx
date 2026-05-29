"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 本番のレンダリング例外（Supabase 障害等）を可視化。Sentry 導入時はここで捕捉送出する。
    console.error("App render error", error);
  }, [error]);

  return (
    <main
      className="min-h-[60vh] flex items-center justify-center px-4 py-20"
      style={{ backgroundColor: "var(--color-ww-bg)" }}
    >
      <div className="max-w-md mx-auto text-center">
        <h1
          className="text-2xl font-serif mb-4"
          style={{ color: "var(--color-ww-text)", fontFamily: "var(--font-ww-serif)" }}
        >
          問題が発生しました
        </h1>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: "var(--color-ww-text-secondary)" }}
        >
          一時的なエラーが発生しました。お手数ですが、少し時間をおいて再度お試しください。
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium"
            style={{
              backgroundColor: "var(--color-ww-accent)",
              color: "var(--color-ww-text-inverse)",
              borderRadius: "var(--radius-ww-md)",
            }}
          >
            再読み込み
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm"
            style={{ color: "var(--color-ww-text-tertiary)" }}
          >
            トップページへ
          </Link>
        </div>
      </div>
    </main>
  );
}
