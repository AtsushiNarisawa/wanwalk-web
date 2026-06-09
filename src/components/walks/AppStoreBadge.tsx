"use client";

import { trackEvent, type SourcePage } from "@/lib/analytics";

export const APP_STORE_URL = "https://apps.apple.com/app/id6757466888";

type Props = {
  sourcePage?: SourcePage;
  placement?: string;
  height?: number;
  className?: string;
};

export default function AppStoreBadge({
  sourcePage,
  placement,
  height = 48,
  className,
}: Props) {
  const width = Math.round(height * (119.66407 / 40));

  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="App Store からダウンロード"
      className={className}
      onClick={() => {
        trackEvent("app_store_badge_click", {
          source_page: sourcePage,
          placement,
        });
      }}
      style={{ display: "inline-block", lineHeight: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/badges/app-store-badge.svg"
        alt="Download on the App Store"
        width={width}
        height={height}
        style={{ display: "block" }}
      />
    </a>
  );
}
