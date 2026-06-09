"use client";

import { DeviceMobile } from "@phosphor-icons/react/dist/ssr";
import { trackEvent, type SourcePage } from "@/lib/analytics";
import { APP_STORE_URL } from "./AppStoreBadge";

type Props = {
  sourcePage?: SourcePage;
  placement?: string;
  label?: string;
  className?: string;
};

/**
 * Web→App 導線の主役となる深緑 Primary ボタン（DESIGN_TOKENS §10 準拠）。
 * クリック計測は AppStoreBadge と同じ app_store_badge_click を流用し、
 * source_page / placement で発火元を区別する。リンク先も同じ App Store。
 * 公式 Apple バッジは AppWalkButton の下に副次的に並べる想定。
 */
export default function AppWalkButton({
  sourcePage,
  placement,
  label = "アプリで歩く",
  className,
}: Props) {
  return (
    <>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`ww-app-walk-btn${className ? ` ${className}` : ""}`}
        onClick={() => {
          trackEvent("app_store_badge_click", {
            source_page: sourcePage,
            placement,
          });
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minHeight: 44,
          padding: "12px 24px",
          backgroundColor: "var(--color-ww-accent)",
          color: "#ffffff",
          fontSize: 15,
          fontWeight: 600,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          borderRadius: "var(--radius-ww-md)",
          textDecoration: "none",
        }}
      >
        <DeviceMobile size={18} weight="regular" />
        {label}
      </a>
      <style>{`
        .ww-app-walk-btn:hover { background-color: var(--color-ww-accent-hover) !important; }
      `}</style>
    </>
  );
}
