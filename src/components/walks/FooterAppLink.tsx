"use client";

import { trackEvent } from "@/lib/analytics";

// フッタ内の控えめな App Store 動線（2026-06-30 アプリ休眠に伴う格下げ）。
//
// アプリは休眠（新規開発停止・削除しない・App Store 1.1.2 は公開のまま）。
// 中身の薄い休眠アプリへ新規 DL を送ると DL→即離脱→低評価リスクがあるため、
// トップ/ルート/エリア/スポット各所の目立つ DL 誘導（AppStoreBadge / WalksAppCTA /
// WalkInAppCTA）は全撤去した。本当に必要な少数の動線としてフッタに 1 本だけ残す。
// 残クリックは GA4 app_store_badge_click（placement=footer）で計測を継続する。

export const APP_STORE_URL = "https://apps.apple.com/app/id6757466888";

export default function FooterAppLink() {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontSize: 13,
        color: "var(--color-ww-text-secondary)",
        lineHeight: 2,
      }}
      onClick={() => {
        trackEvent("app_store_badge_click", { placement: "footer" });
      }}
    >
      iOSアプリ（App Store）
    </a>
  );
}
